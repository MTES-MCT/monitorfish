from datetime import datetime
from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, case, task

from src.pipeline.entities.vessel_profiles import VesselProfileType
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import merge_dicts
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.dates import get_utcnow


@task(checkpoint=False)
def extract_profiles(
    profile_datetime_utc: datetime, profile_dimension: str, profile_type: str
) -> pd.DataFrame:
    assert profile_dimension in (
        "fao_area",
        "gear",
        "species",
        "segment",
    )

    duration_in_days = VesselProfileType[profile_type].duration_in_days

    logger = prefect.context.get("logger")
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


@task(checkpoint=False)
def extract_port_profiles(
    profile_datetime_utc: datetime, profile_type: str
) -> pd.DataFrame:
    duration_in_days = VesselProfileType[profile_type].duration_in_days
    logger = prefect.context.get("logger")
    logger.info(f"Extracting port {profile_type} profiles.")

    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/port_profiles.sql",
        params={
            "profile_datetime_utc": profile_datetime_utc,
            "duration_in_days": duration_in_days,
        },
    )


@task(checkpoint=False)
def extract_latest_port_profiles(profile_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/latest_port_profiles.sql",
        params={"profile_datetime_utc": profile_datetime_utc},
    )


@task(checkpoint=False)
def extract_ports_facade() -> dict:
    ports_facade = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/ports_facade.sql",
    )
    return ports_facade.set_index("locode")["facade"].to_dict()


@task(checkpoint=False)
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


@task(checkpoint=False)
def add_latest_port_facade(
    latest_port_profiles: pd.DataFrame, ports_facade: dict
) -> pd.DataFrame:
    latest_port_profiles = latest_port_profiles.copy(deep=True)
    latest_port_profiles[
        "latest_landing_facade"
    ] = latest_port_profiles.latest_landing_port.map(ports_facade)
    return latest_port_profiles


@task(checkpoint=False)
def transform_profiles(
    profiles: pd.DataFrame, profile_dimension: str, profile_type: str
):
    logger = prefect.context.get("logger")
    logger.info(f"Transforming {profile_dimension} {profile_type} profiles")

    assert isinstance(profiles, pd.DataFrame)

    profile_type_prefix = VesselProfileType[profile_type].prefix

    profile_dimension_label = {
        "fao_area": "fao_areas",
        "gear": "gears",
        "species": "species",
        "segment": "segments",
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


@task(checkpoint=False)
def transform_gear_onboard(
    gear_onboard: pd.DataFrame, profile_type: str
) -> pd.DataFrame:
    profile_type_prefix = VesselProfileType[profile_type].prefix
    gear_onboard = gear_onboard.copy(deep=True)
    gear_onboard_column = f"{profile_type_prefix}gear_onboard"
    gear_onboard[gear_onboard_column] = gear_onboard.apply(
        lambda row: {"gear": row["gear"], "mesh": row["mesh"]}, axis=1
    )
    res = gear_onboard.groupby("cfr")[gear_onboard_column].agg(list)
    return res


@task(checkpoint=False)
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


# with Flow("Vessel profiles", executor=LocalDaskExecutor()) as flow:
with Flow("Vessel profiles") as flow:
    flow_not_running = check_flow_not_running()

    with case(flow_not_running, True):
        # Extract
        now = get_utcnow()

        ports_facade = extract_ports_facade()

        gear_profiles = extract_profiles(
            profile_datetime_utc=now, profile_dimension="gear", profile_type="FULL"
        )
        species_profiles = extract_profiles(
            profile_datetime_utc=now, profile_dimension="species", profile_type="FULL"
        )
        fao_area_profiles = extract_profiles(
            profile_datetime_utc=now, profile_dimension="fao_area", profile_type="FULL"
        )
        segment_profiles = extract_profiles(
            profile_datetime_utc=now, profile_dimension="segment", profile_type="FULL"
        )
        port_profiles = extract_port_profiles(
            profile_datetime_utc=now, profile_type="FULL"
        )

        recent_gear_profiles = extract_profiles(
            profile_datetime_utc=now, profile_dimension="gear", profile_type="RECENT"
        )
        recent_species_profiles = extract_profiles(
            profile_datetime_utc=now, profile_dimension="species", profile_type="RECENT"
        )
        recent_fao_area_profiles = extract_profiles(
            profile_datetime_utc=now,
            profile_dimension="fao_area",
            profile_type="RECENT",
        )
        recent_segment_profiles = extract_profiles(
            profile_datetime_utc=now, profile_dimension="segment", profile_type="RECENT"
        )
        recent_port_profiles = extract_port_profiles(
            profile_datetime_utc=now, profile_type="RECENT"
        )

        latest_port_profiles = extract_latest_port_profiles(profile_datetime_utc=now)
        gear_onboard = extract_gear_onboard(
            profile_datetime_utc=now, profile_type="FULL"
        )
        recent_gear_onboard = extract_gear_onboard(
            profile_datetime_utc=now, profile_type="RECENT"
        )
        # Transform
        gear_profiles = transform_profiles(
            gear_profiles, profile_dimension="gear", profile_type="FULL"
        )
        species_profiles = transform_profiles(
            species_profiles, profile_dimension="species", profile_type="FULL"
        )
        fao_area_profiles = transform_profiles(
            fao_area_profiles, profile_dimension="fao_area", profile_type="FULL"
        )
        segment_profiles = transform_profiles(
            segment_profiles, profile_dimension="segment", profile_type="FULL"
        )
        port_profiles = transform_profiles(
            port_profiles, profile_dimension="port_locode", profile_type="FULL"
        )

        recent_gear_profiles = transform_profiles(
            recent_gear_profiles, profile_dimension="gear", profile_type="RECENT"
        )
        recent_species_profiles = transform_profiles(
            recent_species_profiles, profile_dimension="species", profile_type="RECENT"
        )
        recent_fao_area_profiles = transform_profiles(
            recent_fao_area_profiles,
            profile_dimension="fao_area",
            profile_type="RECENT",
        )
        recent_segment_profiles = transform_profiles(
            recent_segment_profiles, profile_dimension="segment", profile_type="RECENT"
        )
        recent_port_profiles = transform_profiles(
            recent_port_profiles, profile_dimension="port_locode", profile_type="RECENT"
        )

        latest_port_profiles = add_latest_port_facade(
            latest_port_profiles, ports_facade
        )

        recent_gear_onboard = transform_gear_onboard(
            recent_gear_onboard, profile_type="RECENT"
        )
        gear_onboard = transform_gear_onboard(gear_onboard, profile_type="FULL")

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

flow.file_name = Path(__file__).name
