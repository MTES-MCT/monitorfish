from datetime import datetime, timedelta
from typing import List

import pandas as pd
import prefect
from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_Intersects
from prefect import Flow, Parameter, case, task
from prefect.tasks.control_flow import merge
from sqlalchemy import Table, and_, or_, select
from sqlalchemy.sql import Select

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import coalesce, df_to_dict_series, join_on_multiple_keys
from src.pipeline.shared_tasks.facades import get_facades_table
from src.pipeline.shared_tasks.positions import get_positions_table
from src.pipeline.utils import get_table
from src.read_query import read_query


class ZonesTable:
    """
    A class to represent a table of zones which can be filtered on a given field.

        Args:
            table (Table): A SQLAchemy `Table`
            geometry_column (str): name of the geometry column
            filter_column (str): name of the column on which to filter (typically the
              id or unique name of zones)

        Raises:
            AssertionError: if `filter_column` is not a column of `table` or
              `geometry_column` is not a column of `Table` of type
              `geoalchemy2.Geometry`
    """

    def __init__(self, table: Table, geometry_column: str, filter_column: str):

        assert filter_column in table.columns
        assert geometry_column in table.columns
        assert isinstance(table.columns[geometry_column].type, Geometry)
        self.table = table
        self.filter_column = filter_column
        self.geometry_column = geometry_column

    def __repr__(self):
        return (
            f"ZonesTable(table={self.table.__repr__()}, "
            f"filter_column='{self.filter_column}', "
            f"geometry_column='{self.geometry_column}')"
        )


@task(checkpoint=False)
def alert_has_gear_parameters(
    fishing_gears: list, fishing_gear_categories: list
) -> bool:
    """
    Returns `True` if one of the input arguments are non empty lists, `False`
    otherwise.

    Args:
        fishing_gears (list): list of gears or `None`
        fishing_gear_categories (list): list of gear_categories or `None`

    Returns:
        bool: `True` if one of the input arguments are non empty lists, `False`
          otherwise.

    Raises:
        TypeError: if the input arguments are not lists or `None`.
    """

    try:
        assert fishing_gears is None or isinstance(fishing_gears, list)
    except AssertionError:
        raise TypeError("'fishing_gears' must be `None` or `list`.")

    try:
        assert fishing_gear_categories is None or isinstance(
            fishing_gear_categories, list
        )
    except AssertionError:
        raise TypeError("'fishing_gear_categories' must be `None` or `list`.")

    return True if fishing_gears or fishing_gear_categories else False


@task(checkpoint=False)
def get_alert_type_zones_table(alert_type: str) -> ZonesTable:
    """
    Return a `ZonesTable` representing the table in which zones for the given
    `alert_type` are stored.

    Args:
        alert_type (str): the type of alert.

    Returns:
        - ZonesTable: table in which to look for the zones for the given alert type.

    Raises:
        ValueError: if the input `alert_type` does not correspond to one of the
          expected types of alert.
    """

    alert_type_zones_tables = {
        "THREE_MILES_TRAWLING_ALERT": "n_miles_to_shore_areas_subdivided",
    }

    logger = prefect.context.get("logger")

    try:
        table_name = alert_type_zones_tables[alert_type]
    except KeyError:
        raise ValueError(
            (
                f"Unknown alert type '{alert_type}'. "
                f"Expects one of {alert_type_zones_tables.keys()}."
            )
        )

    zones_table = get_table(
        table_name,
        schema="public",
        engine=create_engine("monitorfish_remote"),
        logger=logger,
    )

    zones_table = ZonesTable(
        table=zones_table, filter_column="miles_to_shore", geometry_column="geometry"
    )

    return zones_table


@task(checkpoint=False)
def get_fishing_gears_table() -> Table:
    """
    Return a `Table` representing the table in which fishing gears are stored.

    Returns:
        - Table: table of fishing gears
    """

    return get_table(
        table_name="fishing_gear_codes",
        schema="public",
        engine=create_engine("monitorfish_remote"),
        logger=prefect.context.get("logger"),
    )


@task(checkpoint=False)
def make_positions_in_alert_query(
    positions_table: Table,
    facades_table: Table,
    zones_table: ZonesTable,
    only_fishing_positions: bool,
    zones: List = None,
    hours_from_now: int = 8,
    flag_states: List = None,
) -> Select:
    """
    Creates select statement for the query to execute to compute positions in alert.
    """

    now = datetime.utcnow()
    start_date = now - timedelta(hours=hours_from_now)

    q = (
        select(
            [
                positions_table.c.id,
                positions_table.c.internal_reference_number.label("cfr"),
                positions_table.c.external_reference_number.label(
                    "external_immatriculation"
                ),
                positions_table.c.ircs,
                positions_table.c.vessel_name,
                positions_table.c.flag_state,
                positions_table.c.date_time,
                facades_table.c.facade,
            ]
        )
        .select_from(
            positions_table.join(
                zones_table.table,
                ST_Intersects(
                    positions_table.c.geometry,
                    zones_table.table.c[zones_table.geometry_column],
                ),
            ).join(
                facades_table,
                ST_Intersects(positions_table.c.geometry, facades_table.c.geometry),
                isouter=True,
            )
        )
        .where(
            and_(
                positions_table.c.date_time > start_date,
                positions_table.c.date_time < now,
            )
        )
    )

    if only_fishing_positions:
        q = q.where(positions_table.c.is_fishing)

    if zones:
        q = q.where(zones_table.table.c[zones_table.filter_column].in_(zones))

    if flag_states:
        q = q.where(positions_table.c.flag_state.in_(flag_states))

    return q


@task(checkpoint=False)
def make_fishing_gears_query(
    fishing_gears_table: Table,
    fishing_gears: List[str] = None,
    fishing_gear_categories: List[str] = None,
) -> Select:
    """
    Creates select statement for the query to execute to get the list of gear codes for
    which to generate alerts.
    """

    q = select([fishing_gears_table.c.fishing_gear_code])

    filters = []

    if fishing_gears:
        filters.append(fishing_gears_table.c.fishing_gear_code.in_(fishing_gears))

    if fishing_gear_categories:
        filters.append(
            fishing_gears_table.c.fishing_gear_category.in_(fishing_gear_categories)
        )

    if filters:
        q = q.where(or_(*filters))

    return q


@task(checkpoint=False)
def extract_vessels_current_gears() -> pd.DataFrame:
    """
    Extracts of vessels in `last_positions` with their current (known or probable)
    gear(s).

      - For vessels that have non null `gear_onboard` (for their last DEP) in
        `last_positions`, these gears are used
      - For other vessels, the `gears_declared` from the `vessels` table are used.
    """

    vessels_current_gears = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/vessels_current_gears.sql",
    )

    vessels_current_gears["current_gears"] = coalesce(
        vessels_current_gears[["gear_onboard", "declared_fishing_gears"]]
    )

    vessels_current_gears["current_gears"] = vessels_current_gears["current_gears"].map(
        lambda l: set(l) if l else None
    )

    vessels_current_gears = vessels_current_gears.drop(
        columns=["gear_onboard", "declared_fishing_gears"]
    )

    return vessels_current_gears


@task(checkpoint=False)
def extract_gear_codes(query: Select) -> set:
    """
    Executes the input `sqlalchemy.Select` statement, expected to contain a
    `fishing_gear_code` column, returns said columns results as a `set`.
    """

    fishing_gear_codes = read_query(
        "monitorfish_remote",
        query,
    )

    return set(fishing_gear_codes.fishing_gear_code)


@task(checkpoint=False)
def extract_positions_in_alert(query: Select) -> pd.DataFrame:
    """
    Executes the input `sqlalchemy.Select` statement, returns query results.
    """
    return read_query(
        "monitorfish_remote",
        query,
    )


@task(checkpoint=False)
def filter_on_gears(
    positions_in_alert: pd.DataFrame,
    vessels_current_gears: pd.DataFrame,
    gear_codes: set,
    include_vessels_unknown_gear: bool,
):
    """
    Filters input `positions_in_alert` to keep only rows for which the vessel has at
    least on of the gears listed in `gear_codes`.

    Args:
        positions_in_alert (pd.DataFrame): DataFrame of positions. Must have columns
          "cfr", "external_immatriculation", "ircs"
        vessels_current_gears (pd.DataFrame): DataFrame of vessels. Must have columns
          "cfr", "external_immatriculation", "ircs", "current_gears"
        gear_codes (set): set of gear_codes
        include_vessels_unknown_gear (bool): if `True`, `positions_in_alert` for which
          the corresponding vessel does not have any known gears (because the vessel
          is either absent of the `vessels_current_gears` DataFrame or has `None` in
          the `current_gears` field of that DataFrame) are kept. Otherwise, those rows
          are discarded.
    """

    positions_in_alert = join_on_multiple_keys(
        positions_in_alert,
        vessels_current_gears,
        how="left",
        on=["cfr", "external_immatriculation", "ircs"],
    )

    positions_in_alert_known_gear = positions_in_alert.dropna(subset=["current_gears"])

    positions_in_alert_known_gear = positions_in_alert_known_gear.loc[
        positions_in_alert_known_gear.current_gears.map(
            lambda s: not gear_codes.isdisjoint(s)
        )
    ]

    res = positions_in_alert_known_gear

    if include_vessels_unknown_gear:
        positions_in_alert_unknown_gear = positions_in_alert.loc[
            positions_in_alert.current_gears.isna()
        ]

        res = pd.concat([res, positions_in_alert_unknown_gear])

    res = res.drop(columns=["current_gears"])

    return res


@task(checkpoint=False)
def make_alerts(positions_in_alert: pd.DataFrame, alert_type: str) -> pd.DataFrame:
    """
    Generates alerts from the input `positions_in_alert`, essentially by grouping all
    positions of the same vessel as one alert.
    """
    alerts = (
        positions_in_alert.groupby(
            [
                "cfr",
                "external_immatriculation",
                "ircs",
                "vessel_name",
                "flag_state",
                "facade",
            ],
            as_index=False,
            dropna=False,
        )
        .agg({"date_time": "max"})
        .rename(
            columns={
                "cfr": "internal_reference_number",
                "external_immatriculation": "external_reference_number",
                "date_time": "creation_date",
            }
        )
    )

    alerts["type"] = alert_type
    alerts["value"] = df_to_dict_series(
        alerts.rename(columns={"facade": "seaFront", "flag_state": "flagState"})[
            ["seaFront", "flagState", "type"]
        ]
    )

    return alerts[
        [
            "vessel_name",
            "internal_reference_number",
            "external_reference_number",
            "ircs",
            "creation_date",
            "value",
        ]
    ]


@task(checkpoint=False)
def load_alerts(alerts: pd.DataFrame):
    """
    Loads input alerts in `pending_alerts` table.
    """

    load(
        alerts,
        table_name="pending_alerts",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        jsonb_columns=["value"],
    )


with Flow("Position alert") as flow:

    alert_type = Parameter("alert_type")
    zones = Parameter("zones")
    hours_from_now = Parameter("hours_from_now", default=8)
    only_fishing_positions = Parameter("only_fishing_positions", default=True)
    flag_states = Parameter("flag_states", default=None)
    fishing_gears = Parameter("fishing_gears", default=None)
    fishing_gear_categories = Parameter("fishing_gear_categories", default=None)
    include_vessels_unknown_gear = Parameter(
        "include_vessels_unknown_gear", default=True
    )

    must_filter_on_gears = alert_has_gear_parameters(
        fishing_gears, fishing_gear_categories
    )

    positions_table = get_positions_table()
    zones_table = get_alert_type_zones_table(alert_type)
    facades_table = get_facades_table()

    positions_query = make_positions_in_alert_query(
        positions_table=positions_table,
        facades_table=facades_table,
        zones_table=zones_table,
        only_fishing_positions=only_fishing_positions,
        zones=zones,
        hours_from_now=hours_from_now,
        flag_states=flag_states,
    )

    positions_in_alert = extract_positions_in_alert(positions_query)

    with case(must_filter_on_gears, True):
        fishing_gears_table = get_fishing_gears_table()
        fishing_gears_query = make_fishing_gears_query(
            fishing_gears_table=fishing_gears_table,
            fishing_gears=fishing_gears,
            fishing_gear_categories=fishing_gear_categories,
        )
        gear_codes = extract_gear_codes(fishing_gears_query)
        vessels_current_gears = extract_vessels_current_gears()

        positions_in_alert_1 = filter_on_gears(
            positions_in_alert=positions_in_alert,
            vessels_current_gears=vessels_current_gears,
            gear_codes=gear_codes,
            include_vessels_unknown_gear=include_vessels_unknown_gear,
        )

    with case(must_filter_on_gears, False):
        positions_in_alert_2 = positions_in_alert

    positions_in_alert = merge(
        positions_in_alert_1, positions_in_alert_2, checkpoint=False
    )

    alerts = make_alerts(positions_in_alert, alert_type)
    load_alerts(alerts)
