from datetime import datetime, timedelta
from pathlib import Path
from typing import Tuple

import pandas as pd
import prefect
from geoalchemy2.functions import ST_Intersects
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor
from sqlalchemy import Table, and_, not_, or_, select
from sqlalchemy.sql import Select

from src.pipeline.exceptions import MonitorfishHealthError
from src.pipeline.generic_tasks import extract, read_query_task
from src.pipeline.processing import join_on_multiple_keys
from src.pipeline.shared_tasks.alerts import (
    extract_silenced_alerts,
    filter_silenced_alerts,
    load_alerts,
    make_alerts,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.infrastructure import get_table
from src.pipeline.shared_tasks.positions import add_vessel_identifier
from src.pipeline.shared_tasks.risk_factors import extract_current_risk_factors
from src.pipeline.shared_tasks.vessels import add_vessel_id, add_vessels_columns


@task(checkpoint=False)
def get_dates(days_without_far: int) -> Tuple[datetime, datetime, datetime, datetime]:
    """
    Returns the dates used in the flow as a 4-tuple :

      - `days_without_far` days ago at 00:00 (beginning of the day) in UTC
      - Yesterday at 8pm in UTC
      - Today at 00:00 (beginning of the day) in UTC
      - Current datetime in UTC

    Returns:
        Tuple[datetime, datetime, datetime]
    """
    utcnow = datetime.utcnow()
    today_at_zero_hours = utcnow.replace(hour=0, minute=0, second=0, microsecond=0)
    period_start_at_zero_hours = today_at_zero_hours - timedelta(days=days_without_far)
    yesterday_at_eight_pm = today_at_zero_hours - timedelta(hours=4)

    return (
        period_start_at_zero_hours,
        yesterday_at_eight_pm,
        today_at_zero_hours,
        utcnow,
    )


@task(checkpoint=False)
def make_positions_at_sea_query(
    positions_table: Table,
    facade_areas_table: Table,
    from_date: datetime,
    to_date: datetime,
    states_to_monitor_iso2: list = None,
    vessels_table: Table = None,
    minimum_length: float = None,
    eez_areas_table: Table = None,
    eez_to_monitor_iso3: list = None,
    only_fishing_positions: bool = False,
) -> Select:
    """
    Generates the `sqlalchemy.Select` statement to run in order to get the positions of
    vessels that were at sea (i.e. those that emitted at least one VMS position outside
    of a port) between the designated dates and matching the designated flag states.

    Args:
        positions_table (Table): `sqlalchemy.Table` representing `positions`
        facade_areas_table (Table): `sqlalchemy.Table` representing `facade_areas`
        from_date (datetime): Start of the time interval to query, in UTC
        to_date (datetime): End of the time interval to query, in UTC
        states_to_monitor_iso2 (list, optional): If provided, only vessels of the given
          flag_states will be queried. Defaults to None.
        vessels_table (Table, optional): `sqlalchemy.Table` representing `vessels`. Must
          be provided if `minimum_length` is not `None`. Defaults to None.
        minimum_length (float, optional): If provided, only vessels longer than the
          given value will be queried (only applies to french vessels). Defaults to
          None.
        eez_areas_table (Table, optional): `sqlalchemy.Table` representing `eez_areas`.
          Must be provided if `eez_to_monitor_iso3` is not `None`. Defaults to None.
        eez_to_monitor_iso3 (list, optional): If provided, only VMS emission in the
          designated EEZ areas will be considered. Defaults to None.
        only_fishing_positions (bool, optional): if `True`, only positions which were
          detected as being in fishing operation will be considered.
          Defaults to `False`.

    Raises:
        ValueError: If `minimum_length` is not `None` and the `vessels_table` is not
          provided.
        ValueError: If `eez_to_monitor_iso3` is not `None` and the `eez_areas_table`
          is not provided.

    Returns:
        Select: `Select` statement representing a SQL query
    """

    from_table = positions_table.join(
        facade_areas_table,
        ST_Intersects(positions_table.c.geometry, facade_areas_table.c.geometry),
        isouter=True,
    )

    if minimum_length:
        try:
            assert isinstance(vessels_table, Table)
        except AssertionError:
            raise ValueError(
                (
                    "The vessels_table must be provided when "
                    "filtering on a minimum_length"
                )
            )

        from_table = from_table.join(
            vessels_table,
            positions_table.c.internal_reference_number == vessels_table.c.cfr,
        )

    if eez_to_monitor_iso3:
        try:
            assert isinstance(eez_areas_table, Table)
        except AssertionError:
            raise ValueError(
                ("The eez_table must be provided when " "filtering on a eez_to_monitor")
            )

        from_table = from_table.join(
            eez_areas_table,
            ST_Intersects(positions_table.c.geometry, eez_areas_table.c.wkb_geometry),
        )

    q = (
        select(
            [
                positions_table.c.internal_reference_number.label("cfr"),
                positions_table.c.external_reference_number.label(
                    "external_immatriculation"
                ),
                positions_table.c.ircs,
                positions_table.c.vessel_name,
                positions_table.c.flag_state,
                positions_table.c.date_time,
                positions_table.c.latitude,
                positions_table.c.longitude,
                facade_areas_table.c.facade,
            ]
        )
        .select_from(from_table)
        .where(
            and_(
                positions_table.c.date_time >= from_date,
                positions_table.c.date_time < to_date,
                positions_table.c.internal_reference_number.isnot(None),
                not_(positions_table.c.is_at_port),
            )
        )
    )

    if only_fishing_positions:
        q = q.where(positions_table.c.is_fishing)

    if states_to_monitor_iso2:
        q = q.where(positions_table.c.flag_state.in_(states_to_monitor_iso2))

    if minimum_length:
        q = q.where(
            or_(
                vessels_table.c.length >= minimum_length,
                positions_table.c.flag_state != "FR",
            )
        )

    if eez_to_monitor_iso3:
        q = q.where(eez_areas_table.c.iso_sov1.in_(eez_to_monitor_iso3))

    return q


@task(checkpoint=False)
def extract_vessels_that_emitted_fars(
    declaration_min_datetime_utc: datetime,
    declaration_max_datetime_utc: datetime,
    fishing_operation_min_datetime_utc: datetime,
    fishing_operation_max_datetime_utc: datetime,
) -> set:
    """
    Extracts the vessels that emitted at least one `FAR` logbook report between the
    designated dates and returns the result as a `set` of their CFR numbers.

    Date conditions on dates must be made on 3 dates :

    - `operation_datetime_utc`: for performance reasons (the table is chunked on this
      column)
    - `report_datetime_utc`: to get only reports that were filled between the given
      dates
    - `farDatetimeUtc` : in certain cases (in particular VisioCapture), reports can be
      filled weeks or months after the actual fishing operation. In the context of this
      flow, we are not interested in these reports and want to keep only reports that
      were filled directly on the boat, in 'live'.

    Args:
        declaration_min_datetime_utc (datetime): Minimum `operation_datetime_utc` and
          `report_datetime_utc`
        declaration_max_datetime_utc (datetime): Maximum `operation_datetime_utc` and
          `report_datetime_utc`
        fishing_operation_min_datetime_utc (datetime): Minimum `farDatetimeUtc`
        fishing_operation_max_datetime_utc (datetime): Maximum `farDatetimeUtc`

    Returns:
        set: Set of `cfr` number of the vessels that emitted at least one `FAR` report
          between the given dates.
    """

    vessels_that_emitted_fars = extract(
        "monitorfish_remote",
        "monitorfish/vessels_that_emitted_fars.sql",
        params={
            "declaration_min_datetime_utc": declaration_min_datetime_utc,
            "declaration_max_datetime_utc": declaration_max_datetime_utc,
            "fishing_operation_min_datetime_utc": fishing_operation_min_datetime_utc,
            "fishing_operation_max_datetime_utc": fishing_operation_max_datetime_utc,
        },
    )

    return set(vessels_that_emitted_fars.cfr)


@task(checkpoint=False)
def concat(
    positions_at_sea_yesterday_everywhere: pd.DataFrame,
    positions_at_sea_yesterday_in_french_eez: pd.DataFrame,
) -> pd.DataFrame:
    """
    Concatenates the two input `DataFrame`.

    Args:
        positions_at_sea_yesterday_everywhere (pd.DataFrame)
        positions_at_sea_yesterday_in_french_eez (pd.DataFrame)

    Returns:
        pd.DataFrame
    """
    return pd.concat(
        [
            positions_at_sea_yesterday_everywhere,
            positions_at_sea_yesterday_in_french_eez,
        ],
        ignore_index=True,
    )


@task(checkpoint=False)
def get_vessels_at_sea(positions_at_sea: pd.DataFrame, min_days: int) -> pd.DataFrame:
    """
    Returns a DataFrame with the vessels present in the input `positions_at_sea`
    DataFrame which were at sea on at least `min_days` days. Must have columns :

      - `cfr`
      - `external_immatriculation`
      - `ircs`
      - `vessel_name`
      - `facade`
      - `flag_state`
      - `date_time`
      - `latitude`
      - `longitude`


    Args:
        positions_at_sea (pd.DataFrame): DataFrame of positions of vessels at sea
        min_days (int): minimum number of days at sea. Vessels at sea less than
          `min_days` days are excluded from the result.

    Returns:
        pd.DataFrame: vessels of the input that were at sea on at least `n_days`
        different days.
    """
    positions_at_sea = positions_at_sea.copy(deep=True)
    positions_at_sea["date"] = positions_at_sea.date_time.map(lambda d: d.date())

    positions_at_sea["days_at_sea"] = positions_at_sea.groupby(
        ["cfr", "ircs", "external_immatriculation"]
    )["date"].transform("nunique")

    positions_at_sea = positions_at_sea.loc[
        positions_at_sea.days_at_sea >= min_days
    ].reset_index(drop=True)

    vessels_at_sea = (
        positions_at_sea.sort_values("date_time", ascending=False)
        .groupby(["cfr", "ircs", "external_immatriculation"])
        .head(1)[
            [
                "cfr",
                "external_immatriculation",
                "ircs",
                "vessel_name",
                "flag_state",
                "facade",
                "latitude",
                "longitude",
            ]
        ]
        .reset_index(drop=True)
    )
    return vessels_at_sea


@task(checkpoint=False)
def get_vessels_with_missing_fars(
    vessels_at_sea: pd.DataFrame,
    vessels_that_emitted_fars: set,
    max_share_of_vessels_with_missing_fars: float = 0.5,
) -> pd.DataFrame:
    """
    Filters `vessels_at_sea` to keep only rows whose `cfr` is NOT in
    `vessels_that_emitted_fars`.

    Args:
        vessels_at_sea (pd.DataFrame): `DataFrame` of vessels at sea
        vessels_that_emitted_fars (set): `set` cfrs of vessels that emitted
          `FAR` reports
        max_share_of_vessels_with_missing_fars (float, optional): If the share of
          `vessels_at_sea` that are not in `vessels_that_emitted_fars` is greater than
          this value, it is assumed that there is a breakdown in the date pipeline and
          a `MonitorfishHealthError` is raised. Defaults to 0.5.

    Raises:
        MonitorfishHealthError: raised if the share of vessels with missing fars is
          greater than `max_share_of_vessels_with_missing_fars`

    Returns:
        pd.DataFrame: Filtered version of `vessels_at_sea` with only those that are
        not in `vessels_that_emitted_fars`
    """

    logger = prefect.context.get("logger")
    vessels_with_missing_fars = vessels_at_sea.loc[
        ~vessels_at_sea.cfr.isin(vessels_that_emitted_fars)
    ].reset_index(drop=True)

    share_of_vessels_with_missing_fars = len(vessels_with_missing_fars) / max(
        len(vessels_at_sea), 1
    )
    logger.info(
        (
            f"Out of {len(vessels_at_sea)} vessels at sea, "
            f"{len(vessels_with_missing_fars)} sent no FAR "
            f"({share_of_vessels_with_missing_fars:.0%})."
        )
    )

    try:
        assert (
            share_of_vessels_with_missing_fars <= max_share_of_vessels_with_missing_fars
        )
    except AssertionError:
        raise MonitorfishHealthError(
            (
                f"More than {max_share_of_vessels_with_missing_fars:.0%} of the "
                "`vessels_at_sea` are absent from `vessels_that_emitted_fars`. It is "
                "likely that there is a logbook data breakdown."
            )
        )

    return vessels_with_missing_fars


@task(checkpoint=False)
def merge_risk_factor(
    vessels_with_missing_fars: pd.DataFrame, current_risk_factors: pd.DataFrame
) -> pd.DataFrame:
    """
    Merges on the input DataFrame on ["cfr", "external_immatriculation", "ircs"].

    Args:
        vessels_with_missing_fars (pd.DataFrame)
        current_risk_factors (pd.DataFrame)

    Returns:
        pd.DataFrame
    """
    return join_on_multiple_keys(
        vessels_with_missing_fars,
        current_risk_factors,
        how="left",
        or_join_keys=["cfr", "external_immatriculation", "ircs"],
    )


with Flow("Missing FAR alerts", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        # Parameters
        alert_type = Parameter("alert_type")
        alert_config_name = Parameter("alert_config_name")
        states_iso2_to_monitor_everywhere = Parameter(
            "states_iso2_to_monitor_everywhere"
        )
        states_iso2_to_monitor_in_french_eez = Parameter(
            "states_iso2_to_monitor_in_french_eez"
        )
        max_share_of_vessels_with_missing_fars = Parameter(
            "max_share_of_vessels_with_missing_fars"
        )
        minimum_length = Parameter("minimum_length")
        only_raise_if_route_shows_fishing = Parameter(
            "only_raise_if_route_shows_fishing"
        )
        days_without_far = Parameter("days_without_far")

        # Infras
        districts_table = get_table("districts")
        positions_table = get_table("positions")
        facade_areas_table = get_table("facade_areas_subdivided")
        eez_areas_table = get_table("eez_areas")
        vessels_table = get_table("vessels")

        # Extract
        (
            period_start_at_zero_hours,
            yesterday_at_eight_pm,
            today_at_zero_hours,
            utcnow,
        ) = get_dates(days_without_far)

        positions_at_sea_yesterday_everywhere_query = make_positions_at_sea_query(
            positions_table=positions_table,
            facade_areas_table=facade_areas_table,
            from_date=period_start_at_zero_hours,
            to_date=yesterday_at_eight_pm,
            states_to_monitor_iso2=states_iso2_to_monitor_everywhere,
            vessels_table=vessels_table,
            minimum_length=minimum_length,
            only_fishing_positions=only_raise_if_route_shows_fishing,
        )

        positions_at_sea_yesterday_in_french_eez_query = make_positions_at_sea_query(
            positions_table=positions_table,
            facade_areas_table=facade_areas_table,
            from_date=period_start_at_zero_hours,
            to_date=yesterday_at_eight_pm,
            states_to_monitor_iso2=states_iso2_to_monitor_in_french_eez,
            vessels_table=vessels_table,
            minimum_length=minimum_length,
            eez_areas_table=eez_areas_table,
            eez_to_monitor_iso3=["FRA"],
            only_fishing_positions=only_raise_if_route_shows_fishing,
        )

        positions_at_sea_yesterday_in_french_eez = read_query_task(
            "monitorfish_remote", positions_at_sea_yesterday_in_french_eez_query
        )
        positions_at_sea_yesterday_everywhere = read_query_task(
            "monitorfish_remote", positions_at_sea_yesterday_everywhere_query
        )

        vessels_that_emitted_fars = extract_vessels_that_emitted_fars(
            declaration_min_datetime_utc=period_start_at_zero_hours,
            declaration_max_datetime_utc=utcnow,
            fishing_operation_min_datetime_utc=period_start_at_zero_hours,
            fishing_operation_max_datetime_utc=today_at_zero_hours,
        )

        current_risk_factors = extract_current_risk_factors()

        # Transform
        positions_at_sea = concat(
            positions_at_sea_yesterday_everywhere,
            positions_at_sea_yesterday_in_french_eez,
        )

        vessels_at_sea = get_vessels_at_sea(positions_at_sea, min_days=days_without_far)

        vessels_with_missing_fars = get_vessels_with_missing_fars(
            vessels_at_sea,
            vessels_that_emitted_fars,
            max_share_of_vessels_with_missing_fars,
        )

        vessels_with_missing_fars = add_vessel_identifier(vessels_with_missing_fars)

        vessels_with_missing_fars = merge_risk_factor(
            vessels_with_missing_fars, current_risk_factors
        )
        vessels_with_missing_fars = add_vessel_id(
            vessels_with_missing_fars, vessels_table
        )
        vessels_with_missing_fars = add_vessels_columns(
            vessels_with_missing_fars,
            vessels_table,
            districts_table=districts_table,
            districts_columns_to_add=["dml"],
        )
        alerts = make_alerts(vessels_with_missing_fars, alert_type, alert_config_name)
        silenced_alerts = extract_silenced_alerts()
        alert_without_silenced = filter_silenced_alerts(alerts, silenced_alerts)

        # Load
        load_alerts(alert_without_silenced, alert_config_name=alert_config_name)

flow.file_name = Path(__file__).name
