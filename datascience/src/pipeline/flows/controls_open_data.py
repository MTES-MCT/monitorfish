import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from config import (
    CONTROLS_STATISTICS_CSV_RESOURCE_ID,
    CONTROLS_STATISTICS_CSV_RESOURCE_TITLE,
    CONTROLS_STATISTICS_DATASET_ID,
    FLEET_SEGMENTS_CSV_RESOURCE_ID,
    FLEET_SEGMENTS_CSV_RESOURCE_TITLE,
    IS_INTEGRATION,
)
from src.pipeline.generic_tasks import extract
from src.pipeline.processing import prepare_df_for_loading
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.datagouv import get_csv_file_object, update_resource


@task(checkpoint=False)
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


@task(checkpoint=False)
def extract_fleet_segments_open_data() -> pd.DataFrame:
    return extract(
        "monitorfish_remote",
        "monitorfish/fleet_segments_open_data.sql",
    )


@task(checkpoint=False)
def transform_controls_open_data(controls) -> pd.DataFrame:
    logger = prefect.context.get("logger")
    controls = prepare_df_for_loading(
        controls,
        logger=logger,
        nullable_integer_columns=["target_number_of_controls_year"],
    )
    return controls


@task(checkpoint=False)
def transform_fleet_segments_open_data(fleet_segments) -> pd.DataFrame:
    logger = prefect.context.get("logger")
    fleet_segments = prepare_df_for_loading(
        fleet_segments,
        logger=logger,
        nullable_integer_columns=["year"],
        pg_array_columns=["gears", "fao_areas", "species"],
    )
    return fleet_segments


with Flow("Controls open data", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        dataset_id = Parameter("dataset_id", default=CONTROLS_STATISTICS_DATASET_ID)
        controls_resource_id = Parameter(
            "controls_resource_id", default=CONTROLS_STATISTICS_CSV_RESOURCE_ID
        )
        controls_resource_title = Parameter(
            "controls_resource_title", default=CONTROLS_STATISTICS_CSV_RESOURCE_TITLE
        )

        fleet_segments_resource_id = Parameter(
            "fleet_segments_resource_id", default=FLEET_SEGMENTS_CSV_RESOURCE_ID
        )
        fleet_segments_resource_title = Parameter(
            "fleet_segments_resource_title", default=FLEET_SEGMENTS_CSV_RESOURCE_TITLE
        )

        is_integration = Parameter("is_integration", default=IS_INTEGRATION)

        controls = extract_controls_open_data()
        controls = transform_controls_open_data(controls)
        controls_csv_file = get_csv_file_object(controls)

        fleet_segments = extract_fleet_segments_open_data()
        fleet_segments = transform_fleet_segments_open_data(fleet_segments)
        fleet_segments_csv_file = get_csv_file_object(fleet_segments)

        update_resource(
            dataset_id=dataset_id,
            resource_id=controls_resource_id,
            resource_title=controls_resource_title,
            resource=controls_csv_file,
            mock_update=is_integration,
        )

        update_resource(
            dataset_id=dataset_id,
            resource_id=fleet_segments_resource_id,
            resource_title=fleet_segments_resource_title,
            resource=fleet_segments_csv_file,
            mock_update=is_integration,
        )
