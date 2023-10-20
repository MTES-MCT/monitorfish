from datetime import datetime, timedelta
from pathlib import Path
from typing import List

import pandas as pd
import prefect
from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_Intersects
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor
from prefect.tasks.control_flow import merge
from sqlalchemy import Table, and_, or_, select
from sqlalchemy.sql import Select

from src.db_config import create_engine
from src.pipeline import utils
from src.pipeline.generic_tasks import extract, read_query_task
from src.pipeline.processing import coalesce, join_on_multiple_keys
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
        ZonesTable: table in which to look for the zones for the given alert type.

    Raises:
        ValueError: if the input `alert_type` does not correspond to one of the
          expected types of alert.
    """

    alert_type_zones_tables = {
        "THREE_MILES_TRAWLING_ALERT": {
            "table": "n_miles_to_shore_areas_subdivided",
            "filter_column": "miles_to_shore",
            "geometry_column": "geometry",
        },
        "TWELVE_MILES_FISHING_ALERT": {
            "table": "n_miles_to_shore_areas_subdivided",
            "filter_column": "miles_to_shore",
            "geometry_column": "geometry",
        },
        "FRENCH_EEZ_FISHING_ALERT": {
            "table": "eez_areas",
            "filter_column": "iso_sov1",
            "geometry_column": "wkb_geometry",
        },
    }

    logger = prefect.context.get("logger")

    try:
        table_info = alert_type_zones_tables[alert_type]
    except KeyError:
        raise ValueError(
            (
                f"Unknown alert type '{alert_type}'. "
                f"Expects one of {alert_type_zones_tables.keys()}."
            )
        )

    zones_table = utils.get_table(
        table_info["table"],
        schema="public",
        conn=create_engine("monitorfish_remote"),
        logger=logger,
    )

    zones_table = ZonesTable(
        table=zones_table,
        filter_column=table_info["filter_column"],
        geometry_column=table_info["geometry_column"],
    )

    return zones_table


@task(checkpoint=False)
def make_positions_in_alert_query(
    positions_table: Table,
    facades_table: Table,
    zones_table: ZonesTable,
    only_fishing_positions: bool,
    zones: List = None,
    hours_from_now: int = 8,
    flag_states: List = None,
    except_flag_states: List = None,
) -> Select:
    """
    Creates select statement for the query to execute to compute positions in alert.

    Args:
        positions_table (Table): `SQLAlchemy.Table` of positions.
        facades_table (Table): `SQLAlchemy.Table` of façades.
        zones_table (ZonesTable): `ZonesTable` of zones.
        only_fishing_positions (bool): If `True`, filters positions to keep only
          positions tagged as `is_fishing`.
        zones (List, optional): If provided, adds a
          'WHERE zones.filter_column IN zones' clause to the query. Defaults to None.
        hours_from_now (int, optional): Determines how many hours back in the past the
          `positions` table will be scanned. Defaults to 8.
        flag_states (List, optional): If given, filters positions to keep only those of
          vessels that belong to these flag_states. Defaults to None.
        except_flag_states (List, optional): If given, filters positions to keep only
          those of vessels that do NOT belong to these flag_states. Defaults to None.

    Returns:
        Select: `SQLAlchemy.Select` statement corresponding to the given parameters.
    """

    now = datetime.utcnow()
    start_date = now - timedelta(hours=hours_from_now)

    q = (
        select(
            positions_table.c.id,
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
            facades_table.c.facade,
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
                or_(
                    positions_table.c.internal_reference_number.isnot(None),
                    positions_table.c.external_reference_number.isnot(None),
                    positions_table.c.ircs.isnot(None),
                ),
            )
        )
    )

    if only_fishing_positions:
        q = q.where(positions_table.c.is_fishing)

    if zones:
        q = q.where(zones_table.table.c[zones_table.filter_column].in_(zones))

    if flag_states:
        q = q.where(positions_table.c.flag_state.in_(flag_states))

    if except_flag_states:
        q = q.where(positions_table.c.flag_state.notin_(except_flag_states))

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

    q = select(fishing_gears_table.c.fishing_gear_code)

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
def extract_current_gears() -> pd.DataFrame:
    """
    Extracts of vessels in `last_positions` with their current (known or probable)
    gear(s).

      - For vessels that have non null `gear_onboard` (for their last DEP) in
        `last_positions`, these gears are used
      - For other vessels, the `gears_declared` from the `vessels` table are used.
    """

    current_gears = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/current_gears.sql",
    )

    current_gears["current_gears"] = coalesce(
        current_gears[["gear_onboard", "declared_fishing_gears"]]
    )

    current_gears["current_gears"] = current_gears["current_gears"].map(
        lambda li: set(li) if li else None
    )

    current_gears = current_gears.drop(
        columns=["gear_onboard", "declared_fishing_gears"]
    )

    return current_gears


@task(checkpoint=False)
def extract_gear_codes(query: Select) -> set:
    """
    Executes the input `sqlalchemy.Select` statement, expected to contain a
    `fishing_gear_code` column, returns said columns results as a `set`.
    """

    fishing_gear_codes = read_query(
        query,
        db="monitorfish_remote",
    )

    return set(fishing_gear_codes.fishing_gear_code)


@task(checkpoint=False)
def filter_on_gears(
    positions_in_alert: pd.DataFrame,
    current_gears: pd.DataFrame,
    gear_codes: set,
    include_vessels_unknown_gear: bool,
):
    """
    Filters input `positions_in_alert` to keep only rows for which the vessel's
    current gears are included in `gear_codes`.

    Args:
        positions_in_alert (pd.DataFrame): DataFrame of positions. Must have columns
          "cfr", "external_immatriculation", "ircs"
        current_gears (pd.DataFrame): DataFrame of vessels. Must have columns
          "cfr", "external_immatriculation", "ircs", "current_gears"
        gear_codes (set): set of gear_codes
        include_vessels_unknown_gear (bool): if `True`, `positions_in_alert` for which
          the corresponding vessel does not have any known gears (because the vessel
          is either absent of the `current_gears` DataFrame or has `None` in
          the `current_gears` field of that DataFrame) are kept. Otherwise, those rows
          are discarded.
    """

    positions_in_alert = join_on_multiple_keys(
        positions_in_alert,
        current_gears,
        how="left",
        or_join_keys=["cfr", "external_immatriculation", "ircs"],
    )

    positions_in_alert_known_gear = positions_in_alert.dropna(subset=["current_gears"])

    positions_in_alert_known_gear = positions_in_alert_known_gear.loc[
        positions_in_alert_known_gear.current_gears.map(
            lambda s: s.issubset(gear_codes)
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
def merge_risk_factor(
    positions_in_alert: pd.DataFrame, current_risk_factors: pd.DataFrame
) -> pd.DataFrame:
    return join_on_multiple_keys(
        positions_in_alert,
        current_risk_factors,
        how="left",
        or_join_keys=["cfr", "external_immatriculation", "ircs"],
    )


@task(checkpoint=False)
def get_vessels_in_alert(positions_in_alert: pd.DataFrame) -> pd.DataFrame:
    """
    Returns a `DataFrame` of unique vessels in alert from the input `DataFrame` of
    positions in alert.
    For each vessel, the date of the most recent position is used as
    `creation_datetime` for the alert.
    """
    vessels_in_alerts = (
        positions_in_alert.sort_values("date_time", ascending=False)
        .groupby(["cfr", "ircs", "external_immatriculation"], dropna=False)
        .head(1)[
            [
                "cfr",
                "external_immatriculation",
                "ircs",
                "vessel_name",
                "flag_state",
                "facade",
                "risk_factor",
                "vessel_identifier",
                "date_time",
                "latitude",
                "longitude",
            ]
        ]
        .rename(
            columns={
                "date_time": "creation_date",
            }
        )
        .reset_index(drop=True)
    )
    return vessels_in_alerts


with Flow("Position alert", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        alert_type = Parameter("alert_type")
        alert_config_name = Parameter("alert_config_name")
        zones = Parameter("zones")
        hours_from_now = Parameter("hours_from_now", default=8)
        only_fishing_positions = Parameter("only_fishing_positions", default=True)
        flag_states = Parameter("flag_states", default=None)
        except_flag_states = Parameter("except_flag_states", default=None)
        fishing_gears = Parameter("fishing_gears", default=None)
        fishing_gear_categories = Parameter("fishing_gear_categories", default=None)
        include_vessels_unknown_gear = Parameter(
            "include_vessels_unknown_gear", default=True
        )

        must_filter_on_gears = alert_has_gear_parameters(
            fishing_gears, fishing_gear_categories
        )

        positions_table = get_table("positions")
        vessels_table = get_table("vessels")
        districts_table = get_table("districts")
        zones_table = get_alert_type_zones_table(alert_type)
        facades_table = get_table("facade_areas_subdivided")

        positions_query = make_positions_in_alert_query(
            positions_table=positions_table,
            facades_table=facades_table,
            zones_table=zones_table,
            only_fishing_positions=only_fishing_positions,
            zones=zones,
            hours_from_now=hours_from_now,
            flag_states=flag_states,
            except_flag_states=except_flag_states,
        )

        positions_in_alert = read_query_task("monitorfish_remote", positions_query)

        with case(must_filter_on_gears, True):
            fishing_gears_table = get_table("fishing_gear_codes")
            fishing_gears_query = make_fishing_gears_query(
                fishing_gears_table=fishing_gears_table,
                fishing_gears=fishing_gears,
                fishing_gear_categories=fishing_gear_categories,
            )
            gear_codes = extract_gear_codes(fishing_gears_query)
            current_gears = extract_current_gears()

            positions_in_alert_1 = filter_on_gears(
                positions_in_alert=positions_in_alert,
                current_gears=current_gears,
                gear_codes=gear_codes,
                include_vessels_unknown_gear=include_vessels_unknown_gear,
            )

        with case(must_filter_on_gears, False):
            positions_in_alert_2 = positions_in_alert

        positions_in_alert = merge(
            positions_in_alert_1, positions_in_alert_2, checkpoint=False
        )

        positions_in_alert = add_vessel_identifier(positions_in_alert)
        current_risk_factors = extract_current_risk_factors()
        positions_in_alert = merge_risk_factor(positions_in_alert, current_risk_factors)
        vessels_in_alert = get_vessels_in_alert(positions_in_alert)
        vessels_in_alert = add_vessel_id(vessels_in_alert, vessels_table)
        vessels_in_alert = add_vessels_columns(
            vessels_in_alert,
            vessels_table,
            districts_table=districts_table,
            districts_columns_to_add=["dml"],
        )
        alerts = make_alerts(vessels_in_alert, alert_type, alert_config_name)
        silenced_alerts = extract_silenced_alerts()
        alert_without_silenced = filter_silenced_alerts(alerts, silenced_alerts)
        load_alerts(alert_without_silenced, alert_config_name)

flow.file_name = Path(__file__).name
