from datetime import datetime, timedelta
from pathlib import Path
from typing import Tuple

import pandas as pd
from geoalchemy2.functions import ST_Intersects
from prefect import Flow, Parameter, task
from sqlalchemy import Table, and_, not_, select
from sqlalchemy.sql import Select

from src.pipeline.generic_tasks import extract
from src.pipeline.processing import df_to_dict_series, join_on_multiple_keys
from src.pipeline.shared_tasks.alerts import (
    extract_silenced_alerts,
    filter_silenced_alerts,
    load_alerts,
)
from src.pipeline.shared_tasks.infrastructure import get_table
from src.pipeline.shared_tasks.positions import add_vessel_identifier
from src.pipeline.shared_tasks.risk_factors import extract_current_risk_factors
from src.read_query import read_query


@task(checkpoint=False)
def get_dates() -> Tuple[datetime, datetime, datetime, datetime]:
    """
    Returns the dates used in the flow as a 4-tuple :

      - Yesterday at 00:00 (beginning of the day) in UTC
      - Yesterday at 8pm in UTC
      - Today at 00:00 (beginning of the day) in UTC
      - Current datetime in UTC

    Returns:
        Tuple[datetime, datetime, datetime]
    """
    utcnow = datetime.utcnow()
    today_at_zero_hours = utcnow.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_at_zero_hours = today_at_zero_hours - timedelta(days=1)
    yesterday_at_eight_pm = yesterday_at_zero_hours + timedelta(hours=20)

    return yesterday_at_zero_hours, yesterday_at_eight_pm, today_at_zero_hours, utcnow


@task(checkpoint=False)
def make_vessels_at_sea_query(
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
    Generates the `sqlalchemy.Select` statement to run in order to get the list of
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
          given value will be queried. Defaults to None.
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
                facade_areas_table.c.facade,
            ]
        )
        .distinct()
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
        q = q.where(vessels_table.c.length >= minimum_length)

    if eez_to_monitor_iso3:
        q = q.where(eez_areas_table.c.iso_sov1.in_(eez_to_monitor_iso3))

    return q


@task(checkpoint=False)
def extract_vessels_at_sea(query: Select) -> pd.DataFrame:
    """
    Runs the input `Select` statement on the `monitorfish_remote` database and returns
    the results as a `pandas.DataFrame`.

    Args:
        query (Select): `Select` statement to execute.

    Returns:
        pd.DataFrame: Result of the execution of the input `Select` statement.
    """

    return read_query(
        "monitorfish_remote",
        query,
    )


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
    vessels_at_sea_yesterday_everywhere: pd.DataFrame,
    vessels_at_sea_yesterday_in_french_eez: pd.DataFrame,
) -> pd.DataFrame:
    """
    Concatenates the two input `DataFrame`.

    Args:
        vessels_at_sea_yesterday_everywhere (pd.DataFrame)
        vessels_at_sea_yesterday_in_french_eez (pd.DataFrame)

    Returns:
        pd.DataFrame
    """
    return pd.concat(
        [
            vessels_at_sea_yesterday_everywhere,
            vessels_at_sea_yesterday_in_french_eez,
        ],
        ignore_index=True,
    )


@task(checkpoint=False)
def get_vessels_with_missing_fars(
    vessels_at_sea: pd.DataFrame, vessels_that_emitted_fars: pd.DataFrame
) -> pd.DataFrame:
    """
    Filters `vessels_at_sea` to keep only rows whose `cfr` is NOT in
    `vessels_that_emitted_fars`.

    Args:
        vessels_at_sea (pd.DataFrame): `DataFrame` of vessels at sea
        vessels_that_emitted_fars (pd.DataFrame): `DataFrame` of vessels that emitted
          `FAR` reports

    Returns:
        pd.DataFrame: Filtered version of `vessels_at_sea` with only those that are
          not in `vessels_that_emitted_fars`
    """
    return vessels_at_sea.loc[
        ~vessels_at_sea.cfr.isin(vessels_that_emitted_fars)
    ].reset_index(drop=True)


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


@task(checkpoint=False)
def make_alerts(
    vessels_with_missing_fars: pd.DataFrame,
    alert_type: str,
    alert_config_name: str,
    creation_date: datetime,
) -> pd.DataFrame:
    """
    Generates alerts from the input `vessels_with_missing_fars`.

    Args:
        vessels_with_missing_fars (pd.DataFrame): `DateFrame` of vessels for which to
          create an alert.
        alert_type (str): `type` to specify in the built alerts.
        alert_config_name (str): `alert_config_name` to specify in the built alerts.
        creation_date (datetime): `creation_date` to specify in the built alerts.

    Returns:
        pd.DataFrame: `DataFrame` of alerts.
    """
    alerts = vessels_with_missing_fars.copy(deep=True)
    alerts = alerts.rename(
        columns={
            "cfr": "internal_reference_number",
            "external_immatriculation": "external_reference_number",
        }
    )

    alerts["creation_date"] = creation_date

    alerts["type"] = alert_type
    alerts["value"] = df_to_dict_series(
        alerts.rename(
            columns={
                "facade": "seaFront",
                "flag_state": "flagState",
                "risk_factor": "riskFactor",
            }
        )[["seaFront", "flagState", "type", "riskFactor"]]
    )

    alerts["alert_config_name"] = alert_config_name

    return alerts[
        [
            "vessel_name",
            "internal_reference_number",
            "external_reference_number",
            "ircs",
            "vessel_identifier",
            "creation_date",
            "type",
            "facade",
            "value",
            "alert_config_name",
        ]
    ]


with Flow("Missing FAR alerts") as flow:

    # Parameters
    alert_type = Parameter("alert_type")
    alert_config_name = Parameter("alert_config_name")
    states_iso2_to_monitor_everywhere = Parameter("states_iso2_to_monitor_everywhere")
    states_iso2_to_monitor_in_french_eez = Parameter(
        "states_iso2_to_monitor_in_french_eez"
    )
    minimum_length = Parameter("minimum_length")
    only_raise_if_route_shows_fishing = Parameter("only_raise_if_route_shows_fishing")

    # Infras
    positions_table = get_table("positions")
    facade_areas_table = get_table("facade_areas_subdivided")
    eez_areas_table = get_table("eez_areas")
    vessels_table = get_table("vessels")

    # Extract
    (
        yesterday_at_zero_hours,
        yesterday_at_eight_pm,
        today_at_zero_hours,
        utcnow,
    ) = get_dates()

    vessels_at_sea_yesterday_everywhere_query = make_vessels_at_sea_query(
        positions_table=positions_table,
        facade_areas_table=facade_areas_table,
        from_date=yesterday_at_zero_hours,
        to_date=yesterday_at_eight_pm,
        states_to_monitor_iso2=states_iso2_to_monitor_everywhere,
        vessels_table=vessels_table,
        minimum_length=minimum_length,
        only_fishing_positions=only_raise_if_route_shows_fishing,
    )

    vessels_at_sea_yesterday_in_french_eez_query = make_vessels_at_sea_query(
        positions_table=positions_table,
        facade_areas_table=facade_areas_table,
        from_date=yesterday_at_zero_hours,
        to_date=yesterday_at_eight_pm,
        states_to_monitor_iso2=states_iso2_to_monitor_in_french_eez,
        vessels_table=vessels_table,
        minimum_length=minimum_length,
        eez_areas_table=eez_areas_table,
        eez_to_monitor_iso3=["FRA"],
        only_fishing_positions=only_raise_if_route_shows_fishing,
    )

    vessels_at_sea_yesterday_in_french_eez = extract_vessels_at_sea(
        vessels_at_sea_yesterday_in_french_eez_query
    )
    vessels_at_sea_yesterday_everywhere = extract_vessels_at_sea(
        vessels_at_sea_yesterday_everywhere_query
    )

    vessels_that_emitted_fars = extract_vessels_that_emitted_fars(
        declaration_min_datetime_utc=yesterday_at_zero_hours,
        declaration_max_datetime_utc=utcnow,
        fishing_operation_min_datetime_utc=yesterday_at_zero_hours,
        fishing_operation_max_datetime_utc=today_at_zero_hours,
    )

    current_risk_factors = extract_current_risk_factors()

    # Transform
    vessels_at_sea = concat(
        vessels_at_sea_yesterday_everywhere, vessels_at_sea_yesterday_in_french_eez
    )

    vessels_with_missing_fars = get_vessels_with_missing_fars(
        vessels_at_sea, vessels_that_emitted_fars
    )

    vessels_with_missing_fars = add_vessel_identifier(vessels_with_missing_fars)

    vessels_with_missing_fars = merge_risk_factor(
        vessels_with_missing_fars, current_risk_factors
    )

    alerts = make_alerts(
        vessels_with_missing_fars=vessels_with_missing_fars,
        alert_type=alert_type,
        alert_config_name=alert_config_name,
        creation_date=utcnow,
    )
    silenced_alerts = extract_silenced_alerts()
    alert_without_silenced = filter_silenced_alerts(alerts, silenced_alerts)

    # Load
    load_alerts(alert_without_silenced, alert_config_name=alert_config_name)

flow.file_name = Path(__file__).name
