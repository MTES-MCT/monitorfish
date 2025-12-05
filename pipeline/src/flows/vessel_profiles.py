from datetime import datetime

import pandas as pd
from prefect import flow, get_run_logger, task

from src.entities.vessel_profiles import VesselProfileType
from src.generic_tasks import extract, load
from src.processing import merge_dicts
from src.shared_tasks.dates import get_utcnow


@task
def extract_profiles(
    profile_datetime_utc: datetime, profile_dimension: str, profile_type: str
) -> pd.DataFrame:
    assert profile_dimension in (
        "fao_area",
        "gear",
        "species",
        "segment_current_year",
    )

    duration_in_days = VesselProfileType[profile_type].duration_in_days

    logger = get_run_logger()
    logger.info(f"Extracting {profile_dimension} {profile_type} profiles.")

    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/profiles.sql",
        params={
            "profile_datetime_utc": profile_datetime_utc,
            "profile_dimension": profile_dimension,
            "duration_in_days": duration_in_days,
        },
    )


@task
def extract_port_profiles(
    profile_datetime_utc: datetime, profile_type: str
) -> pd.DataFrame:
    duration_in_days = VesselProfileType[profile_type].duration_in_days
    logger = get_run_logger()
    logger.info(f"Extracting port {profile_type} profiles.")

    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/port_profiles.sql",
        params={
            "profile_datetime_utc": profile_datetime_utc,
            "duration_in_days": duration_in_days,
        },
    )


@task
def extract_latest_port_profiles(profile_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/latest_port_profiles.sql",
        params={"profile_datetime_utc": profile_datetime_utc},
    )


@task
def extract_ports_facade() -> dict:
    ports_facade = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/ports_facade.sql",
    )
    return ports_facade.set_index("locode")["facade"].to_dict()


@task
def extract_gear_onboard(
    profile_datetime_utc: datetime, profile_type: str
) -> pd.DataFrame:
    duration_in_days = VesselProfileType[profile_type].duration_in_days
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/gear_onboard.sql",
        params={
            "profile_datetime_utc": profile_datetime_utc,
            "duration_in_days": duration_in_days,
        },
    )


@task
def add_latest_port_facade(
    latest_port_profiles: pd.DataFrame, ports_facade: dict
) -> pd.DataFrame:
    latest_port_profiles = latest_port_profiles.copy(deep=True)
    latest_port_profiles[
        "latest_landing_facade"
    ] = latest_port_profiles.latest_landing_port.map(ports_facade)
    return latest_port_profiles


@task
def transform_profiles(
    profiles: pd.DataFrame, profile_dimension: str, profile_type: str
):
    logger = get_run_logger()
    logger.info(f"Transforming {profile_dimension} {profile_type} profiles")

    assert isinstance(profiles, pd.DataFrame)

    profile_type_prefix = VesselProfileType[profile_type].vessel_profiles_prefix

    profile_dimension_label = {
        "fao_area": "fao_areas",
        "gear": "gears",
        "species": "species",
        "segment_current_year": "segments",
        "port_locode": "landing_ports",
    }[profile_dimension]
    result_column_name = f"{profile_type_prefix}{profile_dimension_label}"
    profiles = profiles[["cfr", profile_dimension, "share"]].copy(deep=True)
    profiles["share_dict"] = profiles.apply(
        lambda row: {row[profile_dimension]: row["share"]}, axis=1
    )
    profiles = (
        profiles.groupby("cfr")["share_dict"]
        .agg(merge_dicts)
        .rename(result_column_name)
        .reset_index()
    )

    return profiles


@task
def transform_gear_onboard(
    gear_onboard: pd.DataFrame, profile_type: str
) -> pd.DataFrame:
    profile_type_prefix = VesselProfileType[profile_type].vessel_profiles_prefix
    gear_onboard = gear_onboard.copy(deep=True)
    gear_onboard_column = f"{profile_type_prefix}gear_onboard"
    gear_onboard[gear_onboard_column] = gear_onboard.apply(
        lambda row: {"gear": row["gear"], "mesh": row["mesh"]}, axis=1
    )
    res = gear_onboard.groupby("cfr")[gear_onboard_column].agg(list)
    return res


@task
def merge_vessel_profiles(
    gear_profiles: pd.DataFrame,
    species_profiles: pd.DataFrame,
    fao_area_profiles: pd.DataFrame,
    segment_profiles: pd.DataFrame,
    port_profiles: pd.DataFrame,
    recent_gear_profiles: pd.DataFrame,
    recent_species_profiles: pd.DataFrame,
    recent_fao_area_profiles: pd.DataFrame,
    recent_segment_profiles: pd.DataFrame,
    recent_port_profiles: pd.DataFrame,
    latest_port_profiles: pd.DataFrame,
    gear_onboard: pd.DataFrame,
    recent_gear_onboard: pd.DataFrame,
) -> pd.DataFrame:
    vessel_profiles = pd.merge(
        gear_profiles, species_profiles, on="cfr", how="outer", validate="1:1"
    )
    for profiles in [
        fao_area_profiles,
        segment_profiles,
        port_profiles,
        recent_gear_profiles,
        recent_species_profiles,
        recent_fao_area_profiles,
        recent_segment_profiles,
        recent_port_profiles,
        latest_port_profiles,
        gear_onboard,
        recent_gear_onboard,
    ]:
        vessel_profiles = pd.merge(
            vessel_profiles, profiles, on="cfr", how="outer", validate="1:1"
        )

    vessel_profiles["latest_landing_facade"] = vessel_profiles[
        "latest_landing_facade"
    ].fillna("Hors façade")
    return vessel_profiles


@task
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
        logger=get_run_logger(),
        how="replace",
        jsonb_columns=[
            "gears",
            "species",
            "fao_areas",
            "segments",
            "landing_ports",
            "recent_gears",
            "recent_species",
            "recent_fao_areas",
            "recent_segments",
            "recent_landing_ports",
            "gear_onboard",
            "recent_gear_onboard",
        ],
    )


@flow(name="Monitorfish - Vessel profiles")
def vessel_profiles_flow(get_utcnow_fn=get_utcnow):
    # Extract
    now = get_utcnow_fn()

    ports_facade = extract_ports_facade.submit()

    gear_profiles = extract_profiles.submit(
        profile_datetime_utc=now, profile_dimension="gear", profile_type="USUAL"
    )
    species_profiles = extract_profiles.submit(
        profile_datetime_utc=now, profile_dimension="species", profile_type="USUAL"
    )
    fao_area_profiles = extract_profiles.submit(
        profile_datetime_utc=now, profile_dimension="fao_area", profile_type="USUAL"
    )
    segment_profiles = extract_profiles.submit(
        profile_datetime_utc=now,
        profile_dimension="segment_current_year",
        profile_type="USUAL",
    )
    port_profiles = extract_port_profiles.submit(
        profile_datetime_utc=now, profile_type="USUAL"
    )

    recent_gear_profiles = extract_profiles.submit(
        profile_datetime_utc=now, profile_dimension="gear", profile_type="RECENT"
    )
    recent_species_profiles = extract_profiles.submit(
        profile_datetime_utc=now, profile_dimension="species", profile_type="RECENT"
    )
    recent_fao_area_profiles = extract_profiles.submit(
        profile_datetime_utc=now,
        profile_dimension="fao_area",
        profile_type="RECENT",
    )
    recent_segment_profiles = extract_profiles.submit(
        profile_datetime_utc=now,
        profile_dimension="segment_current_year",
        profile_type="RECENT",
    )
    recent_port_profiles = extract_port_profiles.submit(
        profile_datetime_utc=now, profile_type="RECENT"
    )

    latest_port_profiles = extract_latest_port_profiles.submit(profile_datetime_utc=now)
    gear_onboard = extract_gear_onboard.submit(
        profile_datetime_utc=now, profile_type="USUAL"
    )
    recent_gear_onboard = extract_gear_onboard.submit(
        profile_datetime_utc=now, profile_type="RECENT"
    )
    # Transform
    gear_profiles = transform_profiles.submit(
        gear_profiles, profile_dimension="gear", profile_type="USUAL"
    )
    species_profiles = transform_profiles.submit(
        species_profiles, profile_dimension="species", profile_type="USUAL"
    )
    fao_area_profiles = transform_profiles.submit(
        fao_area_profiles, profile_dimension="fao_area", profile_type="USUAL"
    )
    segment_profiles = transform_profiles.submit(
        segment_profiles,
        profile_dimension="segment_current_year",
        profile_type="USUAL",
    )
    port_profiles = transform_profiles.submit(
        port_profiles, profile_dimension="port_locode", profile_type="USUAL"
    )

    recent_gear_profiles = transform_profiles.submit(
        recent_gear_profiles, profile_dimension="gear", profile_type="RECENT"
    )
    recent_species_profiles = transform_profiles.submit(
        recent_species_profiles, profile_dimension="species", profile_type="RECENT"
    )
    recent_fao_area_profiles = transform_profiles.submit(
        recent_fao_area_profiles,
        profile_dimension="fao_area",
        profile_type="RECENT",
    )
    recent_segment_profiles = transform_profiles.submit(
        recent_segment_profiles,
        profile_dimension="segment_current_year",
        profile_type="RECENT",
    )
    recent_port_profiles = transform_profiles.submit(
        recent_port_profiles, profile_dimension="port_locode", profile_type="RECENT"
    )

    latest_port_profiles = add_latest_port_facade.submit(
        latest_port_profiles, ports_facade
    )

    recent_gear_onboard = transform_gear_onboard.submit(
        recent_gear_onboard, profile_type="RECENT"
    )
    gear_onboard = transform_gear_onboard.submit(gear_onboard, profile_type="USUAL")

    vessel_profiles = merge_vessel_profiles(
        gear_profiles,
        species_profiles,
        fao_area_profiles,
        segment_profiles,
        port_profiles,
        recent_gear_profiles,
        recent_species_profiles,
        recent_fao_area_profiles,
        recent_segment_profiles,
        recent_port_profiles,
        latest_port_profiles,
        gear_onboard,
        recent_gear_onboard,
    )
    # Load
    load_vessel_profiles(vessel_profiles)
