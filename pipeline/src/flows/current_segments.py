import pandas as pd
from prefect import flow, get_run_logger, task

from config import default_risk_factors
from src.generic_tasks import extract, load
from src.helpers.segments import allocate_segments_to_catches
from src.processing import df_to_dict_series
from src.shared_tasks.dates import get_current_year
from src.shared_tasks.segments import (
    extract_control_priorities,
    extract_segments_of_year,
)


@task
def extract_current_catches(number_of_days: int) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/current_catches.sql",
        params={"number_of_days": number_of_days},
    )


@task
def extract_last_positions():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/last_positions.sql",
    )


@task
def compute_current_segments(
    current_catches, segments, last_positions, control_priorities
):
    segmented_catches = (
        allocate_segments_to_catches(
            current_catches[
                [
                    "catch_id",
                    "cfr",
                    "vessel_id",
                    "year",
                    "fao_area",
                    "gear",
                    "mesh",
                    "species",
                    "scip_species_type",
                    "weight",
                    "vessel_type",
                    "ircs",
                    "external_immatriculation",
                    "last_logbook_message_datetime_utc",
                    "departure_datetime_utc",
                    "trip_number",
                    "gear_onboard",
                ]
            ],
            segments[
                [
                    "year",
                    "segment",
                    "segment_name",
                    "gears",
                    "fao_areas",
                    "min_mesh",
                    "max_mesh",
                    "target_species",
                    "min_share_of_target_species",
                    "main_scip_species_type",
                    "priority",
                    "vessel_types",
                    "impact_risk_factor",
                ]
            ],
            catch_id_column="catch_id",
            batch_id_column="cfr",
        )
        .dropna(subset=["segment"])
        .reset_index(drop=True)
    )

    # Aggregate by vessel
    current_segments_impact = (
        segmented_catches.sort_values("impact_risk_factor", ascending=False)
        .groupby("cfr")[["cfr", "segment", "impact_risk_factor"]]
        .head(1)
        .set_index("cfr")
        .rename(
            columns={
                "segment": "segment_highest_impact",
            }
        )
    )

    current_segments = (
        segmented_catches.groupby("cfr")["segment"].unique().rename("segments")
    )

    total_catch_weight = current_catches.groupby("cfr")["weight"].sum()
    total_catch_weight = total_catch_weight.rename("total_weight_onboard")

    current_segments = pd.merge(
        current_segments,
        total_catch_weight,
        left_index=True,
        right_index=True,
        how="outer",
    )

    current_segments = pd.merge(
        current_segments,
        current_segments_impact,
        left_index=True,
        right_index=True,
        how="outer",
    )

    # Merge façade from last positions, then control priorities
    segmented_catches_with_facade = pd.merge(
        segmented_catches, last_positions, on="cfr", how="left"
    )

    control_priorities = (
        pd.merge(
            segmented_catches_with_facade, control_priorities, on=["segment", "facade"]
        )
        .sort_values("control_priority_level", ascending=False)
        .groupby("cfr")[["cfr", "segment", "control_priority_level"]]
        .head(1)
        .set_index("cfr")
        .rename(
            columns={
                "segment": "segment_highest_priority",
            }
        )
    )

    # Group catch data of each vessel in a list of dicts like
    # [{"gear": "DRB", "species": "SCE", "faoZone": "27.7", "weight": 156.2}, ...]
    catch_columns = ["gear", "fao_area", "species", "mesh", "weight"]
    species_onboard = current_catches[catch_columns]
    species_onboard = species_onboard.rename(columns={"fao_area": "faoZone"})
    species_onboard = df_to_dict_series(
        species_onboard.dropna(subset=["species"]), result_colname="species_onboard"
    )
    species_onboard = current_catches[["cfr"]].join(species_onboard)
    species_onboard = species_onboard.dropna(subset=["species_onboard"])
    species_onboard = species_onboard.groupby("cfr")["species_onboard"].apply(list)

    # Keep one line per vessel for data related to the last logbook report of each
    # vessel
    last_logbook_report_columns = [
        "cfr",
        "ircs",
        "external_immatriculation",
        "vessel_id",
        "last_logbook_message_datetime_utc",
        "departure_datetime_utc",
        "trip_number",
        "gear_onboard",
    ]

    last_logbook_report = (
        current_catches[last_logbook_report_columns].groupby("cfr").head(1)
    )
    last_logbook_report = last_logbook_report.set_index("cfr")

    # Join departure, catches and segments information into a single table with 1 line
    # by vessel
    res = (
        last_logbook_report.join(species_onboard)
        .join(current_segments)
        .join(control_priorities)
        .reset_index()
    )

    res = res.fillna({"total_weight_onboard": 0, **default_risk_factors})

    return res


@task
def load_current_segments(vessels_segments):  # pragma: no cover
    logger = get_run_logger()
    load(
        vessels_segments,
        table_name="current_segments",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
        pg_array_columns=["segments"],
        handle_array_conversion_errors=True,
        value_on_array_conversion_error="{}",
        jsonb_columns=["gear_onboard", "species_onboard"],
        nullable_integer_columns=["vessel_id"],
    )


@flow(name="Current segments")
def current_segments_flow(number_of_days: int = 90):
    # Extract
    current_year = get_current_year()
    current_catches = extract_current_catches(number_of_days=number_of_days)
    last_positions = extract_last_positions()
    segments = extract_segments_of_year(current_year)
    control_priorities = extract_control_priorities()

    # Transform
    current_segments = compute_current_segments(
        current_catches, segments, last_positions, control_priorities
    )

    # Load
    load_current_segments(current_segments)
