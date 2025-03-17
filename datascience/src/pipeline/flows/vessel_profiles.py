from datetime import datetime
from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.generic_tasks import extract, load
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.dates import get_utcnow


@task(checkpoint=False)
def extract_gear_profiles(start_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/gear_profiles.sql",
        params={"start_datetime_utc": start_datetime_utc},
    )


@task(checkpoint=False)
def extract_species_profiles(start_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/species_profiles.sql",
        params={"start_datetime_utc": start_datetime_utc},
    )


@task(checkpoint=False)
def extract_port_profiles(start_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/ports_profiles.sql",
        params={"start_datetime_utc": start_datetime_utc},
    )


@task(checkpoint=False)
def extract_segment_profiles(start_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/segments_profiles.sql",
        params={"start_datetime_utc": start_datetime_utc},
    )


@task(checkpoint=False)
def transform_gear_profiles(gear_profiles):
    gears = gear_profiles.copy(deep=True)
    gears["gear_share"] = gears.apply(lambda row: {row["gear"]: row["share"]}, axis=1)
    gears = gears.groupby("cfr")["gear_share"].agg(list).rename("gears").reset_index()
    return gears


@task(checkpoint=False)
def transform_species_profiles(species_profiles):
    species = species_profiles.copy(deep=True)
    species["species_share"] = species.apply(
        lambda row: {row["species"]: row["share"]}, axis=1
    )
    species = (
        species.groupby("cfr")["species_share"]
        .agg(list)
        .rename("species")
        .reset_index()
    )
    return species


@task(checkpoint=False)
def transform_port_profiles(port_profiles):
    ports = port_profiles.copy(deep=True)
    ports["port_share"] = ports.apply(lambda row: {row["port"]: row["share"]}, axis=1)
    ports = ports.groupby("cfr")["port_share"].agg(list).rename("ports").reset_index()
    return ports


@task(checkpoint=False)
def transform_segment_profiles(segment_profiles):
    segments = segment_profiles.copy(deep=True)
    segments["segment_share"] = segments.apply(
        lambda row: {row["segment"]: row["share"]}, axis=1
    )
    segments = (
        segments.groupby("cfr")["segment_share"]
        .agg(list)
        .rename("segments")
        .reset_index()
    )
    return segments


@task(checkpoint=False)
def merge_vessel_profiles(
    gear_profiles: pd.DataFrame,
    species_profiles: pd.DataFrame,
    segment_profiles: pd.DataFrame,
) -> pd.DataFrame:
    vessel_profiles = pd.merge(
        gear_profiles, species_profiles, on="cfr", how="outer", validate="1:1"
    )
    vessel_profiles = pd.merge(
        vessel_profiles, segment_profiles, on="cfr", how="outer", validate="1:1"
    )
    return vessel_profiles


@task(checkpoint=False)
def load_vessel_profiles(vessel_profiles: pd.DataFrame):
    """
    Replaces the content of the `vessel_profiles` table with the content of the
    `vessel_profiles` DataFrame.

    Args:
        vessel_profiles (pd.DataFrame): vessel profiles data to load
    """
    load(
        vessel_profiles,
        table_name="vessel_profiles",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        jsonb_columns=[
            "gears",
            "species",
            "segments",
        ],
    )


with Flow("Vessel profiles", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()

    with case(flow_not_running, True):
        # Extract
        now = get_utcnow()
        gear_profiles = extract_gear_profiles(start_datetime_utc=now)
        species_profiles = extract_species_profiles(start_datetime_utc=now)
        # ports_profiles = extract_ports_profiles(start_datetime_utc=now)
        segment_profiles = extract_segment_profiles(start_datetime_utc=now)

        # Transform
        gear_profiles = transform_gear_profiles(gear_profiles)
        species_profiles = transform_species_profiles(species_profiles)
        # ports_profiles = transform_ports_profiles(ports_profiles)
        segment_profiles = transform_segment_profiles(segment_profiles)

        vessel_profiles = merge_vessel_profiles(
            gear_profiles, species_profiles, segment_profiles
        )
        # Load
        load_vessel_profiles(vessel_profiles)

flow.file_name = Path(__file__).name
