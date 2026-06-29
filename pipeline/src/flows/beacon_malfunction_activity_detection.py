from typing import List

import pandas as pd
from prefect import flow, task, unmapped

from src.entities.alerts import AlertType
from src.entities.beacon_malfunctions import BeaconStatus
from src.generic_tasks import extract
from src.shared_tasks.alerts import (
    extract_active_reportings,
    extract_silenced_alerts,
    filter_alerts,
    load_alerts,
    make_alerts,
)
from src.shared_tasks.beacon_malfunctions import (
    load_new_beacon_malfunctions,
    prepare_new_beacon_malfunctions,
    update_beacon_malfunction_is_followed,
)
from src.shared_tasks.positions import tag_positions_at_port

ALERT_CONFIG_NAME = AlertType.AIS_ACTIVITY_ON_VESSEL_NOT_EMITTING_VMS_ALERT.value
ALERT_NAME = "Activité AIS détectée sans émission VMS"


@task
def extract_vessels_with_recent_ais() -> pd.DataFrame:
    """
    Extract vessels that have an ACTIVATED beacon, at least one AIS position
    between 1 and 4 hours ago, and a last VMS position older than 4 hours (or none).
    One row per vessel (most recent AIS position in the window).
    The is_at_port field is not yet set — call tag_positions_at_port next.
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/vessels_with_activity_detected_by_ais.sql",
    )


@task
def filter_vessels_at_sea(vessels: pd.DataFrame) -> pd.DataFrame:
    return vessels.loc[vessels["is_at_port"] == False].reset_index(drop=True)


@task
def extract_non_archived_malfunctions() -> pd.DataFrame:
    return extract(
        "monitorfish_remote",
        "monitorfish/non_archived_malfunctions_with_cfr.sql",
    )


@task
def get_malfunction_ids_to_follow(
    vessels_with_activity: pd.DataFrame,
    non_archived_malfunctions: pd.DataFrame,
) -> List[int]:
    if vessels_with_activity.empty or non_archived_malfunctions.empty:
        return []
    merged = pd.merge(
        non_archived_malfunctions,
        vessels_with_activity[["cfr"]],
        on="cfr",
        how="inner",
    )
    return merged["id"].tolist()


@task
def get_vessels_without_malfunction(
    vessels_with_activity: pd.DataFrame,
    non_archived_malfunctions: pd.DataFrame,
) -> pd.DataFrame:
    cfrs_with_malfunction = set(non_archived_malfunctions["cfr"].dropna())
    return vessels_with_activity.loc[
        ~vessels_with_activity["cfr"].isin(cfrs_with_malfunction)
    ].reset_index(drop=True)


@task
def add_malfunction_start_fields(vessels: pd.DataFrame) -> pd.DataFrame:
    vessels = vessels.copy(deep=True)
    vessels["beacon_status"] = BeaconStatus.ACTIVATED.value
    vessels = vessels.rename(
        columns={"vms_last_position_datetime_utc": "malfunction_start_date_utc"}
    )
    return vessels


@flow(name="Monitorfish - Beacon malfunction activity detection")
def beacon_malfunction_activity_detection_flow():
    # Extract
    vessels_with_recent_ais = extract_vessels_with_recent_ais.submit()
    non_archived_malfunctions = extract_non_archived_malfunctions.submit()
    silenced_alerts = extract_silenced_alerts.submit(
        ALERT_CONFIG_NAME,
        number_of_hours=4,
    )
    active_reportings = extract_active_reportings.submit(ALERT_CONFIG_NAME)

    # Tag is_at_port using port H3 referential, then keep only at-sea vessels
    vessels_with_recent_ais = tag_positions_at_port(vessels_with_recent_ais)
    vessels_with_activity = filter_vessels_at_sea(vessels_with_recent_ais)

    # Transform
    ids_to_follow = get_malfunction_ids_to_follow(
        vessels_with_activity, non_archived_malfunctions
    )
    vessels_without_malfunction = get_vessels_without_malfunction(
        vessels_with_activity, non_archived_malfunctions
    )
    malfunction_candidates = add_malfunction_start_fields(vessels_without_malfunction)
    new_malfunctions = prepare_new_beacon_malfunctions(malfunction_candidates)
    alerts = make_alerts(
        vessels_with_activity,
        ALERT_CONFIG_NAME,
        ALERT_NAME,
        natinf_code=27688,
        threat="Mesures techniques et de conservation",
        threat_characterization="VMS - absence",
    )
    filtered_alerts = filter_alerts(alerts, silenced_alerts, active_reportings)

    # Load
    update_beacon_malfunction_is_followed.map(
        ids_to_follow,
        is_followed=unmapped(True),
    )
    load_new_beacon_malfunctions(new_malfunctions)
    load_alerts(filtered_alerts, alert_config_name=ALERT_CONFIG_NAME)
