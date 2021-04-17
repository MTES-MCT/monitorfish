import io

import pandas as pd
import prefect
import requests
from dotenv import load_dotenv
from prefect import Flow, Parameter, task

from config import FLEET_SEGMENTS_URL, LIBRARY_LOCATION, PROXIES
from src.pipeline.generic_tasks import load

load_dotenv()


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
        delete_before_insert=True,
        pg_array_columns=[
            "dirm",
            "gears",
            "fao_areas",
            "target_species",
            "bycatch_species",
            "flag_states",
        ],
    )


with Flow("Load preliminary fleet segments definitions") as flow:
    segments = extract_segments()
    load_segments(segments)
