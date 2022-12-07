from datetime import datetime
from pathlib import Path

import geopandas as gpd
import pandas as pd
import prefect
from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from config import default_risk_factors
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.segments import attribute_segments_to_catches
from src.pipeline.processing import df_to_dict_series
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.facades import extract_facade_areas
from src.pipeline.shared_tasks.infrastructure import get_table
from src.pipeline.shared_tasks.segments import (
    extract_segments_of_current_year,
    unnest_segments,
)
from src.pipeline.shared_tasks.vessels import add_vessel_id


@task(checkpoint=False)
def extract_catches():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/current_catches.sql"
    )


@task(checkpoint=False)
def extract_control_priorities():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/control_priorities.sql",
        params={"year": datetime.utcnow().year},
    )


@task(checkpoint=False)
def extract_last_positions():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/last_positions.sql",
        backend="geopandas",
        geom_col="geometry",
        crs=4326,
    )


@task(checkpoint=False)
def compute_last_positions_facade(
    last_positions: gpd.GeoDataFrame, facade_areas: gpd.GeoDataFrame
) -> pd.DataFrame:

    last_positions_facade_1 = gpd.sjoin(last_positions, facade_areas)[["cfr", "facade"]]

    unassigned_last_positions = last_positions[
        ~last_positions.cfr.isin(last_positions_facade_1.cfr)
    ].copy(deep=True)

    # Vessels that are not directly in a facade geometry are oftentimes vessels in a
    # port, which facade geometries genereally do not encompass. In order to match
    # these vessels to a nearby facade, we drawed a ~10km circle around them
    # and attempt a spatial join on this buffered geometry.
    unassigned_last_positions["geometry"] = unassigned_last_positions.buffer(0.1)

    last_positions_facade_2 = gpd.sjoin(
        unassigned_last_positions, facade_areas, how="left"
    )[["cfr", "facade"]]

    last_positions_facade_2 = last_positions_facade_2.drop_duplicates(subset=["cfr"])

    last_positions_facade = pd.concat(
        [last_positions_facade_1, last_positions_facade_2]
    ).set_index("cfr")

    return last_positions_facade


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
                "impact_risk_factor",
            ]
        ],
    )

    # Aggregate by vessel

    current_segments_impact = (
        current_segments.sort_values("impact_risk_factor", ascending=False)
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
        current_segments.groupby("cfr")["segment"].unique().rename("segments")
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

    current_segments = pd.merge(
        current_segments,
        current_segments_impact,
        left_index=True,
        right_index=True,
        how="outer",
    )

    return current_segments


@task(checkpoint=False)
def compute_control_priorities(
    current_segments: pd.DataFrame,
    last_positions_facade: pd.DataFrame,
    control_priorities: pd.DataFrame,
) -> pd.DataFrame:

    cfr_segment_facade = (
        current_segments[["segments"]]
        .join(last_positions_facade)
        .explode("segments")
        .rename(columns={"segments": "segment"})
        .reset_index()
        .dropna(subset=["segment", "facade"])
    )

    control_priorities = (
        pd.merge(cfr_segment_facade, control_priorities, on=["segment", "facade"])
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

    return control_priorities


@task(checkpoint=False)
def join(
    catches: pd.DataFrame,
    current_segments: pd.DataFrame,
    control_priorities: pd.DataFrame,
) -> pd.DataFrame:

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

    # Keep one line per vessel for data related to the last logbook report of each
    # vessel
    last_logbook_report_columns = [
        "cfr",
        "ircs",
        "external_immatriculation",
        "last_logbook_message_datetime_utc",
        "departure_datetime_utc",
        "trip_number",
        "gear_onboard",
    ]

    last_logbook_report = catches[last_logbook_report_columns].groupby("cfr").head(1)
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


@task(checkpoint=False)
def load_current_segments(vessels_segments):  # pragma: no cover
    logger = prefect.context.get("logger")
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


with Flow("Current segments", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        # Extract
        catches = extract_catches()
        last_positions = extract_last_positions()
        segments = extract_segments_of_current_year()
        facade_areas = extract_facade_areas()
        control_priorities = extract_control_priorities()

        vessels_table = get_table("vessels")

        # Transform
        last_positions_facade = compute_last_positions_facade(
            last_positions, facade_areas
        )
        segments = unnest_segments(segments)
        current_segments = compute_current_segments(catches, segments)
        control_priorities = compute_control_priorities(
            current_segments, last_positions_facade, control_priorities
        )
        current_segments = join(catches, current_segments, control_priorities)
        current_segments = add_vessel_id(current_segments, vessels_table)

        # Load
        load_current_segments(current_segments)

flow.file_name = Path(__file__).name
