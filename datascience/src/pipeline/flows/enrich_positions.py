from datetime import datetime, timedelta
from typing import List, Union

import pandas as pd
import prefect
from prefect import Flow, Parameter, task, unmapped
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers import dates
from src.pipeline.helpers.dates import Period
from src.pipeline.helpers.spatial import enrich_positions
from src.pipeline.processing import prepare_df_for_loading
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
        dtypes={"datetime_utc": "datetime64[ns]"},
    )


def enrich_positions_by_vessel(
    positions: pd.DataFrame,
    minimum_consecutive_positions: int,
    fishing_speed_threshold: float,
) -> pd.DataFrame:
    return positions.groupby(
        ["cfr", "ircs", "external_immatriculation"], dropna=False, group_keys=False
    ).apply(
        enrich_positions,
        minimum_consecutive_positions=minimum_consecutive_positions,
        fishing_speed_threshold=fishing_speed_threshold,
    )


def load_fishing_activity(positions: pd.DataFrame, period: Period):

    logger = prefect.context.get("logger")
    e = create_engine("monitorfish_remote")

    with e.begin() as connection:
        connection.execute(
            text(
                "CREATE TEMP TABLE tmp_enriched_positions("
                "    id INTEGER PRIMARY KEY,"
                "    is_at_port BOOLEAN,"
                "    meters_from_previous_position REAL,"
                "    time_since_previous_position INTERVAL,"
                "    average_speed REAL,"
                "    is_fishing BOOLEAN"
                ")"
                "ON COMMIT DROP;"
            )
        )

        positions = prepare_df_for_loading(
            positions, logger, timedelta_columns=["time_since_previous_position"]
        )

        columns_to_load = [
            "id",
            "is_at_port",
            "meters_from_previous_position",
            "time_since_previous_position",
            "average_speed",
            "is_fishing",
        ]

        positions[columns_to_load].to_sql(
            "tmp_enriched_positions",
            connection,
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )

        connection.execute(
            text(
                "UPDATE interim.test_positions p"
                "SET"
                "    is_at_port = ep.is_at_port,"
                "    meters_from_previous_position = COALESCE("
                "        ep.meters_from_previous_position,"
                "        p.meters_from_previous_position"
                "    ),"
                "    time_since_previous_position = COALESCE("
                "        ep.time_since_previous_position,"
                "        p.time_since_previous_position"
                "    ),"
                "    average_speed = ep.average_speed,"
                "    is_fishing = ep.is_fishing"
                "FROM tmp_enriched_positions ep"
                "WHERE p.id = ep.id"
                "AND p.date_time >= :start"
                "AND p.date_time <= :end"
                ";"
            ),
            start=period.start,
            end=period.end,
        )


@task(checkpoint=False)
def extract_enrich_load(
    period: Period, minimum_consecutive_positions: int, fishing_speed_threshold: float
):
    """Extract positions for the given `Period`, enrich and update the `positions`
    table.

    This is all done in one `Task` in order to avoid having tasks returning anything.
    Indeed Prefect stores all task results in memory until the flow run is done
    running, which in this case must be avoided in order to benefit from the chunked
    processing logic in terms of memory consumption.
    """

    positions = extract_positions(period)
    positions = tag_positions_at_port.run(positions)
    positions = enrich_positions_by_vessel(
        positions,
        minimum_consecutive_positions=minimum_consecutive_positions,
        fishing_speed_threshold=fishing_speed_threshold,
    )
    load_fishing_activity(positions)


with Flow("Enrich positions") as flow:

    start_hours_ago = Parameter("start_hours_ago")
    end_hours_ago = Parameter("end_hours_ago")
    minutes_per_chunk = Parameter("minutes_per_chunk")
    chunk_overlap_minutes = Parameter("chunk_overlap_minutes")
    minimum_consecutive_positions = Parameter("minimum_consecutive_positions")
    fishing_speed_threshold = Parameter("fishing_speed_threshold")

    periods = make_periods(
        start_hours_ago,
        end_hours_ago,
        minutes_per_chunk,
        chunk_overlap_minutes,
    )

    extract_enrich_load.map(
        periods,
        minimum_consecutive_positions=unmapped(minimum_consecutive_positions),
        fishing_speed_threshold=unmapped(fishing_speed_threshold),
    )
