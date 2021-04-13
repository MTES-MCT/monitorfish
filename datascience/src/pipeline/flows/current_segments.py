from typing import Union

import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import df_to_dict_series
from src.read_query import read_saved_query


# ************************************** Helpers **************************************
def catch_zone_isin_fao_zone(
    catch_zone: Union[None, str], fao_zone: Union[None, str]
) -> bool:
    """Return
    - True if a catch zone (e.g. '27.7.b') is in a given fao_zone (e.g. '27.7.b' or
    '27')
    - False if a catch zone (e.g. '27.7.b') is NOT in a given fao_zone (e.g. '28.6' or
    '27.7.b.4')
    - True if the fao_zone if None (whatever the value of the catch_zone)
    - False if the fao_zone is not None and the catch_zone is None
    """
    if fao_zone is None:
        return True
    elif catch_zone is None:
        return False
    else:
        return fao_zone in catch_zone


# ********************************** Tasks and flow **********************************
@task(checkpoint=False)
def extract_catches():  # pragma: no cover
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/current_catches.sql"
    )


@task(checkpoint=False)
def extract_segments():  # pragma: no cover
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/fleet_segments.sql"
    )


@task(checkpoint=False)
def unnest(segments):
    return (
        segments.explode("gears")
        .explode("fao_zones")
        .explode("species")
        .rename(columns={"fao_zones": "fao_zone", "gears": "gear"})
    )


@task(checkpoint=False)
def compute_current_segments(catches, segments):

    catches_ = catches[["cfr", "gear", "fao_zone", "species", "weight"]]
    segments_ = segments[["segment", "gear", "fao_zone", "species"]]

    # Merge catches and segments on gear and species
    current_segments_gear_species = pd.merge(
        segments_,
        catches_,
        on=["species", "gear"],
        suffixes=("_of_segment", "_of_catch"),
    )

    # Merge catches and segments only on gear, for segments without a species criterion
    segments_gear_only = segments_[segments_.species.isna()].drop(columns=["species"])

    current_segments_gear_only = pd.merge(
        segments_gear_only, catches_, on="gear", suffixes=("_of_segment", "_of_catch")
    )

    # Merge catches and segments only on species, for segments without a gear criterion
    segments_species_only = segments_[segments_.gear.isna()].drop(columns=["gear"])

    current_segments_species_only = pd.merge(
        segments_species_only,
        catches_,
        on="species",
        suffixes=("_of_segment", "_of_catch"),
    )

    # Match catches to all segments that have no criterion on species nor on gears
    segments_no_gear_no_species = segments_[
        segments_[["gear", "species"]].isna().all(axis=1)
    ][["segment", "fao_zone"]]

    current_segments_no_gear_no_species = pd.merge(
        segments_no_gear_no_species,
        catches_,
        how="cross",
        suffixes=("_of_segment", "_of_catch"),
    )

    # Concatenate the 4 sets of matched (catches, segments)
    current_segments = pd.concat(
        [
            current_segments_gear_species,
            current_segments_gear_only,
            current_segments_species_only,
            current_segments_no_gear_no_species,
        ]
    )

    # Matched (catches, segments) now need to be filtered to keep only the matches
    # that satisfy the fao_zone criterion. A catch made in '27.7.b' will satisfy
    # the fao criterion of a segment whose fao_zone is '27.7', so we check that the
    # fao zone of the segment is a substring of the fao zone of the catch.
    current_segments = current_segments[
        (
            current_segments.apply(
                lambda row: catch_zone_isin_fao_zone(
                    row.fao_zone_of_catch, row.fao_zone_of_segment
                ),
                axis=1,
            )
        )
    ]

    # Finally, aggregate by vessel
    current_segments = current_segments.groupby("cfr")[["segment", "weight"]].agg(
        {"segment": "unique", "weight": "sum"}
    )

    current_segments = current_segments.rename(
        columns={"segment": "segments", "weight": "total_weight_onboard"}
    )
    return current_segments


@task(checkpoint=False)
def merge_segments_catches(catches, current_segments):

    # Group catch data of each vessel in a list of dicts like
    # [{"gear": "DRB", "species": "SCE", "faoZone": "27.7", "weight": 156.2}, ...]
    catch_columns = ["gear", "fao_zone", "species", "weight"]
    species_onboard = catches[catch_columns]
    species_onboard = species_onboard.rename(columns={"fao_zone": "faoZone"})
    species_onboard = df_to_dict_series(
        species_onboard.dropna(subset=["species"]), result_colname="species_onboard"
    )
    species_onboard = catches[["cfr"]].join(species_onboard)
    species_onboard = species_onboard.dropna(subset=["species_onboard"])
    species_onboard = species_onboard.groupby("cfr")["species_onboard"].apply(list)

    # Keep one line by vessel for data related to the last departure of each vessel
    last_deps_columns = ["cfr", "departure_datetime_utc", "trip_number", "gear_onboard"]
    last_deps = catches[last_deps_columns].groupby("cfr").head(1)
    last_deps = last_deps.set_index("cfr")

    # Join departure, catches and segments information into a single table with 1 line
    # by vessel
    res = last_deps.join(species_onboard).join(current_segments).reset_index()
    res = res.fillna({"total_weight_onboard": 0})

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


with Flow(
    "Extract the last DEP of each vessel in the `ers` table, "
    "load into the `current_segments` table"
) as flow:  # pragma: no cover

    catches = extract_catches()
    segments = extract_segments()
    segments = unnest(segments)
    current_segments = compute_current_segments(catches, segments)
    current_segments = merge_segments_catches(catches, current_segments)
    load_current_segments(current_segments)
