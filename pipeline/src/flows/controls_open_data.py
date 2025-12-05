import pandas as pd
from prefect import flow, get_run_logger, task

from config import (
    CONTROLS_STATISTICS_CSV_RESOURCE_ID,
    CONTROLS_STATISTICS_CSV_RESOURCE_TITLE,
    CONTROLS_STATISTICS_DATASET_ID,
    FLEET_SEGMENTS_CSV_RESOURCE_ID,
    FLEET_SEGMENTS_CSV_RESOURCE_TITLE,
    IS_INTEGRATION,
)
from src.generic_tasks import extract
from src.processing import prepare_df_for_loading
from src.shared_tasks.datagouv import get_csv_file_object, update_resource


@task
def extract_controls_open_data() -> pd.DataFrame:
    return extract(
        "monitorfish_remote",
        "monitorfish/controls_open_data.sql",
        dtypes={
            "control_year": int,
            "control_month": int,
            "number_controls": int,
            "number_controls_ytd": int,
        },
    )


@task
def extract_fleet_segments_open_data() -> pd.DataFrame:
    return extract(
        "monitorfish_remote",
        "monitorfish/fleet_segments_open_data.sql",
    )


@task
def transform_controls_open_data(controls) -> pd.DataFrame:
    logger = get_run_logger()
    controls = prepare_df_for_loading(
        controls,
        logger=logger,
        nullable_integer_columns=["target_number_of_controls_year"],
    )
    return controls


@task
def transform_fleet_segments_open_data(fleet_segments) -> pd.DataFrame:
    logger = get_run_logger()
    fleet_segments = prepare_df_for_loading(
        fleet_segments,
        logger=logger,
        nullable_integer_columns=["year"],
        pg_array_columns=["gears", "fao_areas", "target_species"],
    )
    return fleet_segments


@flow(name="Monitorfish - Controls open data")
def controls_open_data_flow(
    dataset_id: str = CONTROLS_STATISTICS_DATASET_ID,
    controls_resource_id: str = CONTROLS_STATISTICS_CSV_RESOURCE_ID,
    controls_resource_title: str = CONTROLS_STATISTICS_CSV_RESOURCE_TITLE,
    fleet_segments_resource_id: str = FLEET_SEGMENTS_CSV_RESOURCE_ID,
    fleet_segments_resource_title: str = FLEET_SEGMENTS_CSV_RESOURCE_TITLE,
    is_integration: bool = IS_INTEGRATION,
):
    controls = extract_controls_open_data()
    controls = transform_controls_open_data(controls)
    controls_csv_file = get_csv_file_object(controls)

    fleet_segments = extract_fleet_segments_open_data()
    fleet_segments = transform_fleet_segments_open_data(fleet_segments)
    fleet_segments_csv_file = get_csv_file_object(fleet_segments)

    controls_response = update_resource(
        dataset_id=dataset_id,
        resource_id=controls_resource_id,
        resource_title=controls_resource_title,
        resource=controls_csv_file,
        mock_update=is_integration,
    )

    fleet_segments_response = update_resource(
        dataset_id=dataset_id,
        resource_id=fleet_segments_resource_id,
        resource_title=fleet_segments_resource_title,
        resource=fleet_segments_csv_file,
        mock_update=is_integration,
    )

    return (
        controls_response,
        fleet_segments_response,
        controls_csv_file,
        fleet_segments_csv_file,
    )
