from typing import List

import pandas as pd
from prefect import flow, get_run_logger, task
from sqlalchemy import text

from src.db_config import create_engine
from src.entities.missions import MissionActionType
from src.generic_tasks import extract
from src.helpers.segments import allocate_segments_to_catches
from src.processing import df_to_dict_series, prepare_df_for_loading
from src.shared_tasks.segments import extract_segments_of_year
from src.utils import psql_insert_copy


@task
def extract_controls_catches(year: int, control_types: List[str]) -> pd.DataFrame:
    """
    Extracts controls data from the specified year.

    Args:
        year (int): year to extract

    Returns:
        pd.DataFrame: DataFrame with controls data.
    """
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
        params={"year": year, "control_types": tuple(control_types)},
    )


@task
def compute_controls_segments(
    controls_catches: pd.DataFrame,
    segments: pd.DataFrame,
) -> pd.DataFrame:
    controls_segments = (
        allocate_segments_to_catches(
            controls_catches,
            segments,
            catch_id_column="catch_id",
            batch_id_column="control_id",
        )[["control_id", "segment", "segment_name"]]
        .dropna(subset=["control_id", "segment"])
        .drop_duplicates()
        .rename(columns={"segment_name": "segmentName"})
    )

    controls_segments["segment"] = df_to_dict_series(
        controls_segments[["segment", "segmentName"]]
    )

    controls_segments = (
        controls_segments.groupby("control_id")["segment"]
        .agg(list)
        .apply(lambda li: sorted(li, key=lambda s: s["segment"]))
        .reset_index()
        .rename(columns={"segment": "segments", "control_id": "id"})
    )

    control_ids_without_segment = pd.DataFrame(
        {"id": sorted(set(controls_catches.control_id) - set(controls_segments.id))}
    )
    control_ids_without_segment["segments"] = [list()] * len(
        control_ids_without_segment
    )
    controls_segments = pd.concat([controls_segments, control_ids_without_segment])
    controls_segments = controls_segments.sort_values("id").reset_index(drop=True)

    return controls_segments


@task
def load_controls_segments(controls_segments: pd.DataFrame):
    logger = get_run_logger()

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


@flow(name="Monitorfish - Recompute controls segments")
def recompute_controls_segments_flow(year: int, control_types: List[str]):
    # Extract
    controls_catches = extract_controls_catches(year=year, control_types=control_types)
    segments = extract_segments_of_year(year=year)

    # Transform
    controls_segments = compute_controls_segments(controls_catches, segments)

    # Load
    load_controls_segments(controls_segments)
