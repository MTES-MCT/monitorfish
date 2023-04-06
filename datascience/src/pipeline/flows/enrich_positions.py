from logging import Logger
from pathlib import Path

import numpy as np
import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task, unmapped
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract
from src.pipeline.helpers.dates import Period
from src.pipeline.helpers.spatial import enrich_positions
from src.pipeline.processing import (
    left_isin_right_by_decreasing_priority,
    prepare_df_for_loading,
    zeros_ones_to_bools,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.dates import make_periods
from src.pipeline.shared_tasks.positions import tag_positions_at_port
from src.pipeline.utils import psql_insert_copy


def extract_positions(period: Period) -> pd.DataFrame:
    """
    Extracts all positions of a given Period.

    Args:
        period (Period): Period of extraction

    Returns:
        pd.DataFrame: DataFrame of positions.
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/all_positions.sql",
        params={
            "start": period.start,
            "end": period.end,
        },
        dtypes={
            "datetime_utc": "datetime64[ns]",
            "time_emitting_at_sea": "timedelta64[ns]",
        },
    )


def filter_already_enriched_vessels(positions: pd.DataFrame) -> pd.DataFrame:
    """
    Filters the input positions `DateFrame` by removing positions of vessels that have
    all their positions already enriched (which is detected by checking whether the
    `is_at_port` column contains any null values).

    Args:
        positions (pd.DataFrame): vessels' positions. Must have columns:

          - 'cfr'
          - 'external_immatriculation'
          - 'ircs'
          - 'is_at_port'
          - any other column required for the rest of the flow (latitude, longitude,
            datetime...)

    Returns:
        pd.DataFrame: same as input with some rows removed.
    """
    vessels_to_enrich = positions[positions.is_at_port.isna()][
        ["cfr", "external_immatriculation", "ircs"]
    ].drop_duplicates()

    positions_to_enrich = positions.loc[
        left_isin_right_by_decreasing_priority(
            positions[["cfr", "external_immatriculation", "ircs"]], vessels_to_enrich
        )
    ].reset_index(drop=True)

    return positions_to_enrich


def enrich_positions_by_vessel(
    positions: pd.DataFrame,
    minimum_consecutive_positions: int,
    min_fishing_speed_threshold: float,
    max_fishing_speed_threshold: float,
    minimum_minutes_of_emission_at_sea: int,
) -> pd.DataFrame:
    """
    Applies `enrich_positions` to each vessel's positions.

    Args:
        positions (pd.DataFrame): input positions. Must have columns:

          - 'cfr'
          - 'external_immatriculation'
          - 'ircs'
          - 'latitude'
          - 'longitude'
          - 'datetime_utc'
          - 'is_at_port'
          - 'time_emitting_at_sea'

    Returns:
        pd.DataFrame: same as input, with the following columns added:

          - 'meters_from_previous_position'
          - 'time_since_previous_position'
          - 'average_speed'
          - 'is_fishing'

          and with the `time_emitting_at_sea` values recomputed / updated.
    """
    minimum_time_of_emission_at_sea = np.timedelta64(
        minimum_minutes_of_emission_at_sea, "m"
    )

    if len(positions) == 0:
        # With an empty DataFrame, the `groupby` has nothing to group on and therefore
        # `enrich_positions` does not get applied at all, which causes the result to
        # be equal to the input and therefore some columns are missing.
        # In this case, applying `enrich_positions` without any groupby just adds the
        # desired columns and solves the problem.
        res = enrich_positions(
            positions, minimum_time_of_emission_at_sea=minimum_time_of_emission_at_sea
        )
    else:

        res = positions.groupby(
            ["cfr", "ircs", "external_immatriculation"], dropna=False, group_keys=False
        ).apply(
            enrich_positions,
            minimum_time_of_emission_at_sea=minimum_time_of_emission_at_sea,
            minimum_consecutive_positions=minimum_consecutive_positions,
            min_fishing_speed_threshold=min_fishing_speed_threshold,
            max_fishing_speed_threshold=max_fishing_speed_threshold,
            return_floats=True,
        )
        # It is much faster to apply zeros_ones_to_bool once after processing all
        # vessels' positions than to apply it inside the enrich_position function
        # for each vessel individually
        res["is_fishing"] = zeros_ones_to_bools(res["is_fishing"])
    return res


def load_fishing_activity(positions: pd.DataFrame, period: Period, logger: Logger):
    """Updates `positions` table with the contents of the input `DataFrame`.
    The input `DataFrame` must have columns:

      - id
      - is_at_port
      - meters_from_previous_position
      - time_since_previous_position
      - average_speed
      - is_fishing
      - time_emitting_at_sea

    Args:
        positions (pd.DataFrame): Enriched positions data
        period (Period): the `Period` covered by the input `DataFrame`. This is used
          to add a `where` clause on the `positions` hypertable limiting the time range
          queried when looking for `id` corresponding to the rows to update.
        logger (Logger): `Logger`
    """

    e = create_engine("monitorfish_remote")

    with e.begin() as connection:

        logger.info("Creating temporary table")
        connection.execute(
            text(
                "CREATE TEMP TABLE tmp_enriched_positions("
                "    id INTEGER PRIMARY KEY,"
                "    is_at_port BOOLEAN,"
                "    meters_from_previous_position REAL,"
                "    time_since_previous_position INTERVAL,"
                "    average_speed REAL,"
                "    is_fishing BOOLEAN,"
                "    time_emitting_at_sea INTERVAL"
                ")"
                "ON COMMIT DROP;"
            )
        )

        positions = prepare_df_for_loading(
            positions,
            logger,
            timedelta_columns=["time_since_previous_position", "time_emitting_at_sea"],
        )

        columns_to_load = [
            "id",
            "is_at_port",
            "meters_from_previous_position",
            "time_since_previous_position",
            "average_speed",
            "is_fishing",
            "time_emitting_at_sea",
        ]

        logger.info("Loading to temporary table")

        positions[columns_to_load].to_sql(
            "tmp_enriched_positions",
            connection,
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )

        logger.info("Updating positions from temporary table")

        connection.execute(
            text(
                "UPDATE public.positions p "
                "SET "
                "    is_at_port = ep.is_at_port, "
                "    meters_from_previous_position = COALESCE( "
                "        ep.meters_from_previous_position, "
                "        p.meters_from_previous_position "
                "    ), "
                "    time_since_previous_position = COALESCE( "
                "        ep.time_since_previous_position, "
                "        p.time_since_previous_position "
                "    ), "
                "    average_speed = COALESCE( "
                "        ep.average_speed, "
                "        p.average_speed "
                "    ), "
                "    is_fishing = COALESCE( "
                "        ep.is_fishing, "
                "        p.is_fishing "
                "    ),"
                "    time_emitting_at_sea = COALESCE( "
                "        ep.time_emitting_at_sea, "
                "        p.time_emitting_at_sea "
                "    )"
                "FROM tmp_enriched_positions ep "
                "WHERE p.id = ep.id "
                "AND p.date_time >= :start "
                "AND p.date_time <= :end;"
            ),
            start=period.start,
            end=period.end,
        )


@task(checkpoint=False)
def reset_positions(period: Period):
    """
    Deletes enriched data from positions table in the designated Period.
    """

    logger = prefect.context.get("logger")
    e = create_engine("monitorfish_remote")

    logger.info(f"Resetting positions for period {period.start} - {period.end}.")

    e.execute(
        text(
            "UPDATE public.positions p "
            "SET "
            "    is_at_port = NULL, "
            "    meters_from_previous_position = NULL, "
            "    time_since_previous_position = NULL, "
            "    average_speed = NULL, "
            "    is_fishing = NULL, "
            "    time_emitting_at_sea = NULL "
            "WHERE p.date_time >= :start "
            "AND p.date_time <= :end;"
        ),
        start=period.start,
        end=period.end,
    )


@task(checkpoint=False)
def extract_enrich_load(
    period: Period,
    minimum_consecutive_positions: int,
    min_fishing_speed_threshold: float,
    max_fishing_speed_threshold: float,
    minimum_minutes_of_emission_at_sea: int,
):
    """Extract positions for the given `Period`, enrich and update the `positions`
    table.

    This is all done in one `Task` in order to avoid having tasks returning anything.
    Indeed Prefect stores all task results in memory until the flow run is done
    running, which in this case must be avoided in order to benefit from the chunked
    processing logic in terms of memory consumption.
    """

    logger = prefect.context.get("logger")
    logger.info(f"Processing positions for period {period.start} - {period.end}.")

    logger.info("Extracting...")
    positions = extract_positions(period)
    logger.info(
        f"Extracted {len(positions)} positions from {positions.cfr.nunique()} vessels."
    )

    logger.info("Filtering...")
    positions = filter_already_enriched_vessels(positions)

    logger.info(
        f"Retained {len(positions)} positions from {positions.cfr.nunique()} vessels."
    )

    logger.info("Tagging positions at port")
    positions = tag_positions_at_port.run(positions)

    logger.info("Enriching positions")
    positions = enrich_positions_by_vessel(
        positions,
        minimum_consecutive_positions=minimum_consecutive_positions,
        min_fishing_speed_threshold=min_fishing_speed_threshold,
        max_fishing_speed_threshold=max_fishing_speed_threshold,
        minimum_minutes_of_emission_at_sea=minimum_minutes_of_emission_at_sea,
    )

    logger.info("Loading")
    load_fishing_activity(positions, period, logger)


with Flow("Enrich positions") as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        start_hours_ago = Parameter("start_hours_ago")
        end_hours_ago = Parameter("end_hours_ago")
        minutes_per_chunk = Parameter("minutes_per_chunk")
        chunk_overlap_minutes = Parameter("chunk_overlap_minutes")
        minimum_consecutive_positions = Parameter("minimum_consecutive_positions")
        minimum_minutes_of_emission_at_sea = Parameter(
            "minimum_minutes_of_emission_at_sea"
        )
        min_fishing_speed_threshold = Parameter("min_fishing_speed_threshold")
        max_fishing_speed_threshold = Parameter("max_fishing_speed_threshold")
        recompute_all = Parameter("recompute_all")

        periods = make_periods(
            start_hours_ago,
            end_hours_ago,
            minutes_per_chunk,
            chunk_overlap_minutes,
        )

        with case(recompute_all, True):
            reset = reset_positions.map(periods)
            extract_enrich_load.map(
                periods,
                minimum_consecutive_positions=unmapped(minimum_consecutive_positions),
                min_fishing_speed_threshold=unmapped(min_fishing_speed_threshold),
                max_fishing_speed_threshold=unmapped(max_fishing_speed_threshold),
                minimum_minutes_of_emission_at_sea=unmapped(
                    minimum_minutes_of_emission_at_sea
                ),
                upstream_tasks=[reset],
            )

        with case(recompute_all, False):
            extract_enrich_load.map(
                periods,
                minimum_consecutive_positions=unmapped(minimum_consecutive_positions),
                min_fishing_speed_threshold=unmapped(min_fishing_speed_threshold),
                max_fishing_speed_threshold=unmapped(max_fishing_speed_threshold),
                minimum_minutes_of_emission_at_sea=unmapped(
                    minimum_minutes_of_emission_at_sea
                ),
            )

flow.file_name = Path(__file__).name
