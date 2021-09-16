from typing import Union

import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.segments import (
    attribute_segments_to_catches,
    extract_segments,
    unnest_segments,
)
from src.pipeline.processing import df_to_dict_series
from src.read_query import read_saved_query


@task(checkpoint=False)
def extract_catches():  # pragma: no cover
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/current_catches.sql"
    )


@task(checkpoint=False)
def compute_current_segments(catches, segments):

    current_segments = attribute_segments_to_catches(
        catches[["cfr", "gear", "fao_area", "species"]],
        segments[
            [
                "segment",
                "gear",
                "fao_area",
                "species",
                "risk_factor",
                "control_priority_level",
            ]
        ],
    )

    # Aggregate by vessel
    current_segments = (
        current_segments.groupby("cfr")[
            ["segment", "risk_factor", "control_priority_level"]
        ]
        .agg(
            {
                "segment": "unique",
                "risk_factor": "max",
                "control_priority_level": "max",
            }
        )
        .rename(
            columns={
                "segment": "segments",
            }
        )
    )

    total_catch_weight = catches.groupby("cfr")["weight"].sum()
    total_catch_weight = total_catch_weight.rename("total_weight_onboard")

    current_segments = pd.merge(
        current_segments,
        total_catch_weight,
        left_index=True,
        right_index=True,
        how="outer",
    )

    return current_segments


@task(checkpoint=False)
def merge_segments_catches(catches, current_segments):

    # Group catch data of each vessel in a list of dicts like
    # [{"gear": "DRB", "species": "SCE", "faoZone": "27.7", "weight": 156.2}, ...]
    catch_columns = ["gear", "fao_area", "species", "weight"]
    species_onboard = catches[catch_columns]
    species_onboard = species_onboard.rename(columns={"fao_area": "faoZone"})
    species_onboard = df_to_dict_series(
        species_onboard.dropna(subset=["species"]), result_colname="species_onboard"
    )
    species_onboard = catches[["cfr"]].join(species_onboard)
    species_onboard = species_onboard.dropna(subset=["species_onboard"])
    species_onboard = species_onboard.groupby("cfr")["species_onboard"].apply(list)

    # Keep one line by vessel for data related to the last ers messages of each vessel
    last_ers_columns = [
        "cfr",
        "last_ers_datetime_utc",
        "departure_datetime_utc",
        "trip_number",
        "gear_onboard",
    ]

    last_ers = catches[last_ers_columns].groupby("cfr").head(1)
    last_ers = last_ers.set_index("cfr")

    # Join departure, catches and segments information into a single table with 1 line
    # by vessel
    res = last_ers.join(species_onboard).join(current_segments).reset_index()
    res = res.fillna(
        {"total_weight_onboard": 0, "risk_factor": 1, "control_priority_level": 1}
    )

    return res


@task(checkpoint=False)
def load_current_segments(vessels_segments):  # pragma: no cover
    logger = prefect.context.get("logger")
    load(
        vessels_segments,
        table_name="current_segments",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        delete_before_insert=True,
        pg_array_columns=["segments"],
        handle_array_conversion_errors=True,
        value_on_array_conversion_error="{}",
        jsonb_columns=["gear_onboard", "species_onboard"],
    )


with Flow("Current segments") as flow:

    catches = extract_catches()
    segments = extract_segments()
    segments = unnest_segments(segments)
    current_segments = compute_current_segments(catches, segments)
    current_segments = merge_segments_catches(catches, current_segments)
    load_current_segments(current_segments)
