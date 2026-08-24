import geopandas as gpd
import pandas as pd
from prefect import flow, get_run_logger, task
from sqlalchemy import text

from src.db_config import create_engine
from src.generic_tasks import extract
from src.shared_tasks.facades import extract_facade_areas
from src.utils import psql_insert_copy

# Mission action types whose facade is deduced from their location, and mission action
# types whose facade is that of the port where they took place. All other mission
# action types (AIR_SURVEILLANCE, OBSERVATION) are not assigned a facade, mirroring the
# backend `GetMissionActionFacade` use case.
LOCALIZED_ACTION_TYPES = ["SEA_CONTROL", "AIR_CONTROL"]
PORT_ACTION_TYPES = ["LAND_CONTROL"]


@task
def extract_mission_actions_of_year(year: int) -> pd.DataFrame:
    """
    Extracts the `id`, `action_type`, `latitude`, `longitude` and `port_locode` of
    mission actions of the given year.

    Args:
        year (int): year to extract

    Returns:
        pd.DataFrame: DataFrame with mission actions data.
    """
    try:
        assert isinstance(year, int)
    except AssertionError:
        raise ValueError(f"year must be of type int, got {type(year)}")

    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/mission_actions_of_year.sql",
        params={"year": year},
    )


@task
def extract_ports_facade() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/ports_fao_areas_and_facade.sql",
    )[["locode", "facade"]]


@task
def compute_mission_actions_facade(
    mission_actions: pd.DataFrame,
    facade_areas: gpd.GeoDataFrame,
    ports: pd.DataFrame,
) -> pd.DataFrame:
    """
    Computes the facade of mission actions, following the same logic as the backend
    `GetMissionActionFacade` use case :

    - the facade of `SEA_CONTROL` and `AIR_CONTROL` actions is deduced from their
      location (`latitude`, `longitude`)
    - the facade of `LAND_CONTROL` actions is that of the port where they took place
    - actions of any other type (`AIR_SURVEILLANCE`, `OBSERVATION`) are not assigned a
      facade

    Args:
        mission_actions (pd.DataFrame): mission actions with at least `id`,
          `action_type`, `latitude`, `longitude` and `port_locode` columns
        facade_areas (gpd.GeoDataFrame): facades with `facade` column (and geometry)
        ports (pd.DataFrame): ports with `locode` and `facade` columns

    Returns:
        pd.DataFrame: DataFrame with columns `id` and `facade`
    """
    localized_actions = mission_actions.loc[
        mission_actions.action_type.isin(LOCALIZED_ACTION_TYPES)
        & mission_actions.latitude.notnull()
        & mission_actions.longitude.notnull(),
        ["id", "latitude", "longitude"],
    ]

    localized_actions = gpd.GeoDataFrame(
        localized_actions,
        geometry=gpd.points_from_xy(
            localized_actions.longitude, localized_actions.latitude
        ),
        crs=4326,
    )

    localized_actions_facade = gpd.sjoin(localized_actions, facade_areas)[
        ["id", "facade"]
    ]

    port_actions = mission_actions.loc[
        mission_actions.action_type.isin(PORT_ACTION_TYPES)
        & mission_actions.port_locode.notnull(),
        ["id", "port_locode"],
    ]

    port_actions_facade = pd.merge(
        port_actions,
        ports.rename(columns={"locode": "port_locode"}),
        how="left",
        on="port_locode",
    )[["id", "facade"]]

    mission_actions_facade = pd.concat(
        [localized_actions_facade, port_actions_facade]
    ).reset_index(drop=True)

    # Use `None` rather than `NaN` for missing facades, so they are loaded as SQL NULL
    # rather than as the literal string "nan" when copied into the `facade` enum column
    mission_actions_facade["facade"] = mission_actions_facade["facade"].where(
        mission_actions_facade["facade"].notna(), None
    )

    return mission_actions_facade


@task
def load_mission_actions_facade(mission_actions_facade: pd.DataFrame, year: int):
    logger = get_run_logger()

    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        logger.info("Creating temporary table")
        connection.execute(
            text(
                "CREATE TEMP TABLE tmp_mission_actions_facade("
                "    id INTEGER PRIMARY KEY,"
                "    facade public.facade"
                ")"
                "ON COMMIT DROP;"
            )
        )

        logger.info("Loading to temporary table")
        mission_actions_facade.to_sql(
            "tmp_mission_actions_facade",
            connection,
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )

        logger.info("Resetting facade of mission actions of the year")
        connection.execute(
            text(
                "UPDATE public.mission_actions "
                "SET facade = NULL "
                "WHERE EXTRACT(year FROM action_datetime_utc) = :year;"
            ),
            {"year": year},
        )

        logger.info("Updating facade from temporary table")
        connection.execute(
            text(
                "UPDATE public.mission_actions a "
                "SET facade = f.facade "
                "FROM tmp_mission_actions_facade f "
                "WHERE a.id = f.id;"
            )
        )


@flow(name="Monitorfish - Recompute mission actions facade")
def recompute_mission_actions_facade_flow(year: int):
    # Extract
    mission_actions = extract_mission_actions_of_year(year=year)
    facade_areas = extract_facade_areas()
    ports = extract_ports_facade()

    # Transform
    mission_actions_facade = compute_mission_actions_facade(
        mission_actions, facade_areas, ports
    )

    # Load
    load_mission_actions_facade(mission_actions_facade, year=year)
