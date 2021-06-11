import numpy as np
import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import join_on_multiple_keys


@task(checkpoint=False)
def extract_current_segments():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/current_segments.sql"
    )


@task(checkpoint=False)
def extract_last_positions():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/last_positions.sql",
        dtypes={"emission_period": str},
    )


@task(checkpoint=False)
def extract_last_controls():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/last_controls.sql",
        parse_dates=["last_control_datetime_utc"],
    )


@task(checkpoint=False)
def merge(last_positions, current_segments, last_controls):
    last_positions = pd.merge(last_positions, current_segments, on="cfr", how="left")
    last_positions = join_on_multiple_keys(
        last_positions,
        last_controls,
        on=["cfr", "ircs", "external_immatriculation"],
        how="left",
    )

    last_positions = last_positions.fillna({"total_weight_onboard": 0.0})

    last_positions.loc[:, "trip_number"] = last_positions.trip_number.map(
        lambda x: str(int(x)), na_action="ignore"
    ).replace([np.nan], [None])

    last_positions.loc[:, "emission_period"] = last_positions.emission_period.replace(
        ["NaT", np.nan], [None, None]
    )

    last_positions["id"] = np.arange(0, len(last_positions))

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


with Flow("Last positions") as flow:
    current_segments = extract_current_segments()
    last_positions = extract_last_positions()
    last_controls = extract_last_controls()
    last_positions = merge(last_positions, current_segments, last_controls)
    load_last_positions(last_positions)
