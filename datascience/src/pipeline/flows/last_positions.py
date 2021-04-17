import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load


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
    last_positions = pd.merge(last_positions, current_segments, on="cfr", how="outer")
    last_positions = last_positions.fillna({"total_weight_onboard": 0.0})
    return last_positions


@task(checkpoint=False)
def load_last_positions(last_positions):

    load(
        last_positions,
        table_name="last_positions",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        delete_before_insert=True,
        pg_array_columns=["segments"],
        handle_array_conversion_errors=True,
        value_on_array_conversion_error="{}",
        jsonb_columns=["gear_onboard", "species_onboard"],
    )


with Flow(
    "Extract last positions, enrich with current segments, "
    "catches and gear onboard since last dep"
) as flow:
    current_segments = extract_current_segments()
    last_positions = extract_last_positions()
    last_positions = merge(last_positions, current_segments)
    load_last_positions(last_positions)
