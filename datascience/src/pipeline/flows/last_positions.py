import pandas as pd
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load
from src.read_query import read_saved_query

# engins du DEP
# taille du bateau
# s'il a le JPE ou non
# MMSI
# quartier du navire
# cadencement
# segment de flotte


@task
def extract_current_segments():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/current_segments.sql"
    )


@task(checkpoint=False)
def extract_last_positions():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/last_positions.sql"
    )


@task(checkpoint=False)
def merge(last_positions, current_segments):
    res = pd.merge(last_positions, current_segments, on="cfr", how="left")
    res = res.fillna({"total_weight_onboard": 0.0})
    return res
