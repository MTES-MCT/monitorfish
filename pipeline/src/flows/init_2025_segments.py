from ast import literal_eval

import pandas as pd
from prefect import flow, get_run_logger, task

from config import LIBRARY_LOCATION
from src.generic_tasks import load
from src.sentry import report_flow_failure_to_sentry


@task
def extract_2025_segments():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/segments_2025.csv",
        converters={
            "gears": literal_eval,
            "fao_areas": literal_eval,
            "target_species": literal_eval,
            "vessel_types": literal_eval,
        },
    )


@task
def load_2025_segments(segments: pd.DataFrame):
    logger = get_run_logger()

    load(
        segments,
        table_name="fleet_segments",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="upsert",
        df_id_column="year",
        table_id_column="year",
        pg_array_columns=[
            "gears",
            "fao_areas",
            "target_species",
            "vessel_types",
        ],
    )


@flow(
    name="Monitorfish - Init 2025 segments",
    on_failure=[report_flow_failure_to_sentry],
    on_crashed=[report_flow_failure_to_sentry],
)
def init_2025_segments_flow():
    segments = extract_2025_segments()
    load_2025_segments(segments)
