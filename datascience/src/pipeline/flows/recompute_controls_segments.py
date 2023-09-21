from pathlib import Path
from typing import List

import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.entities.missions import MissionActionType
from src.pipeline.generic_tasks import extract
from src.pipeline.helpers.segments import attribute_segments_to_catches
from src.pipeline.processing import df_to_dict_series, prepare_df_for_loading
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.segments import extract_segments_of_year, unnest_segments
from src.pipeline.utils import psql_insert_copy


@task(checkpoint=False)
def extract_controls_catches(year: int, control_types: List[str]) -> pd.DataFrame:
    """
    Extracts controls data from the specified year.

    Args:
        year (int): year to extract

    Returns:
        pd.DataFrame: DataFrame with controls data.
    """
    parse_dates = ["action_datetime_utc"]
    dtypes = {"id": "int"}

    try:
        assert isinstance(year, int)
    except AssertionError:
        raise ValueError(f"year must be of type int, got {type(year)}")

    try:
        assert isinstance(control_types, List)
    except AssertionError:
        raise ValueError(
            f"control_types must be of type list, got {type(control_types)}"
        )

    for control_type in control_types:
        try:
            MissionActionType(control_type)
        except ValueError:
            raise ValueError(f"control_types contains unexpected value {control_type}")

    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/controls_catches.sql",
        parse_dates=parse_dates,
        dtypes=dtypes,
        params={"year": year, "control_types": tuple(control_types)},
    )


@task(checkpoint=False)
def compute_controls_segments(
    controls_catches: pd.DataFrame,
    segments: pd.DataFrame,
) -> pd.DataFrame:

    controls_catches = controls_catches.where(controls_catches.notnull(), None)
    controls_segments = (
        attribute_segments_to_catches(
            controls_catches,
            segments[["segment", "segment_name", "fao_area", "gear", "species"]],
        )[["id", "segment", "segment_name"]]
        .drop_duplicates()
        .rename(columns={"segment_name": "segmentName"})
    )
    controls_segments["segment"] = df_to_dict_series(
        controls_segments[["segment", "segmentName"]]
    )

    controls_segments = (
        controls_segments.groupby("id")[["segment", "segmentName"]]
        .agg(list)
        .reset_index()
        .rename(columns={"segment": "segments"})[["id", "segments"]]
    )

    controls_without_segment = pd.DataFrame(
        {"id": sorted(set(controls_catches.id) - set(controls_segments.id))}
    )
    controls_without_segment["segments"] = [list()] * len(controls_without_segment)
    controls_segments = pd.concat([controls_segments, controls_without_segment])
    controls_segments = controls_segments.reset_index(drop=True)

    return controls_segments


@task(checkpoint=False)
def load_controls_segments(controls_segments: pd.DataFrame):
    logger = prefect.context.get("logger")

    e = create_engine("monitorfish_remote")
    with e.begin() as connection:

        logger.info("Creating temporary table")
        connection.execute(
            text(
                "CREATE TEMP TABLE tmp_controls_segments("
                "    id INTEGER PRIMARY KEY,"
                "    segments jsonb"
                ")"
                "ON COMMIT DROP;"
            )
        )

        controls_segments = prepare_df_for_loading(
            controls_segments,
            logger,
            jsonb_columns=["segments"],
        )

        logger.info("Loading to temporary table")

        controls_segments.to_sql(
            "tmp_controls_segments",
            connection,
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )

        logger.info("Updating segments from temporary table")

        connection.execute(
            text(
                "UPDATE public.mission_actions a "
                "SET "
                "    segments = cs.segments "
                "FROM tmp_controls_segments cs "
                "WHERE a.id = cs.id;"
            )
        )


with Flow("Recompute controls segments", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        # Parameters
        year = Parameter("year")
        control_types = Parameter("control_types")

        # Extract
        controls_catches = extract_controls_catches(
            year=year, control_types=control_types
        )
        segments = extract_segments_of_year(year=year)

        # Transform
        segments = unnest_segments(segments)
        controls_segments = compute_controls_segments(controls_catches, segments)

        # Load
        load_controls_segments(controls_segments)

flow.file_name = Path(__file__).name
