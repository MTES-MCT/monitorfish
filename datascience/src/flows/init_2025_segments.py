from ast import literal_eval
from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task
from prefect.executors import LocalDaskExecutor

from config import LIBRARY_LOCATION
from src.generic_tasks import load


@task(checkpoint=False)
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


@task(checkpoint=False)
def load_2025_segments(segments: pd.DataFrame):
    load(
        segments,
        table_name="fleet_segments",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
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


with Flow("Init 2025 segments", executor=LocalDaskExecutor()) as flow:
    segments = extract_2025_segments()
    load_2025_segments(segments)

flow.file_name = Path(__file__).name
