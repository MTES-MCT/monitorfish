from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task

from config import LIBRARY_LOCATION
from src.pipeline.generic_tasks import load


@task(checkpoint=False)
def extract_segments():
    return pd.read_pickle(LIBRARY_LOCATION / "pipeline/data/fleet_segments.pkl")


@task(checkpoint=False)
def load_segments(segments):
    load(
        segments,
        table_name="fleet_segments",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        pg_array_columns=[
            "dirm",
            "gears",
            "fao_areas",
            "target_species",
            "bycatch_species",
            "flag_states",
        ],
    )


with Flow("Fleet segments") as flow:
    segments = extract_segments()
    load_segments(segments)

flow.file_name = Path(__file__).name
