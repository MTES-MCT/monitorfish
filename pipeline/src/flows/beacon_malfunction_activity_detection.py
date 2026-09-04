from datetime import datetime
from typing import List

import pandas as pd
from prefect import flow, task, unmapped

from src.entities.alerts import AlertType
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


@task
def extract_vessels_with_recent_ais() -> pd.DataFrame:
    """
    Extract vessels that have at least one AIS position
    between 1 and 4 hours ago, and a last VMS position older than 4 hours (or none).
    One row per vessel (most recent AIS position in the window).
    The is_at_port field is not yet set — call tag_positions_at_port next.
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/vessels_with_activity_detected_by_ais.sql",
    )


@task
def extract_beacon_malfunctions_with_declared_activity() -> pd.DataFrame:
    """
    Extract current beacon malfunctions during which the vessel recently declared
    fishing activity (DEP, FAR), along with the vessel data required to build alerts.
    This also works on vessels with paper logbook, although with some delay.
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/beacon_malfunctions_with_declared_activity.sql",
        params={"utcnow": datetime.utcnow()},
    )


@task
def extract_beacon_malfunctions_with_sale() -> pd.DataFrame:
    """
    Extract current beacon malfunctions during which the vessel recently sold fish
    (a sales note was emitted), along with the vessel data required to build alerts.
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/beacon_malfunctions_with_sale.sql",
        params={"utcnow": datetime.utcnow()},
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
def get_malfunction_ids_with_activity(
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
def get_malfunction_ids_not_already_followed(
    malfunctions: pd.DataFrame,
) -> List[int]:
    return malfunctions.loc[~malfunctions.is_followed, "id"].tolist()


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
    vessels = vessels.rename(
        columns={"vms_last_position_datetime_utc": "malfunction_start_date_utc"}
    )
    return vessels


@flow(name="Monitorfish - Beacon malfunction activity detection")
def beacon_malfunction_activity_detection_flow():
    # Extract
    vessels_with_recent_ais = extract_vessels_with_recent_ais.submit()
    non_archived_malfunctions = extract_non_archived_malfunctions.submit()
    current_malfunctions_with_declared_activity = (
        extract_beacon_malfunctions_with_declared_activity.submit()
    )
    current_malfunctions_with_sale = extract_beacon_malfunctions_with_sale.submit()
    ais_silenced_alerts = extract_silenced_alerts.submit(
        AlertType.AIS_ACTIVITY_ON_VESSEL_NOT_EMITTING_VMS_ALERT.value,
        number_of_hours=4,
    )
    ais_active_reportings = extract_active_reportings.submit(
        AlertType.AIS_ACTIVITY_ON_VESSEL_NOT_EMITTING_VMS_ALERT.value
    )
    declared_activity_silenced_alerts = extract_silenced_alerts.submit(
        AlertType.DECLARED_FISHING_ACTIVITY_DURING_BEACON_MALFUNCTION.value,
        # Fishing activity data may be received several months after the event,
        # and we should be able to detect those cases - i.e. a vessel that hasn't
        # emitted for 6 months and for which we receive today a declaration of
        # activity that took place 3 months must trigger the alert.
        number_of_hours=24 * 365,
    )
    declared_activity_active_reportings = extract_active_reportings.submit(
        AlertType.DECLARED_FISHING_ACTIVITY_DURING_BEACON_MALFUNCTION.value
    )
    sale_silenced_alerts = extract_silenced_alerts.submit(
        AlertType.SALE_DURING_BEACON_MALFUNCTION.value,
        # Sales notes may be received several months after the event (in particular
        # paper sales notes), and we should be able to detect those cases.
        number_of_hours=24 * 365,
    )
    sale_active_reportings = extract_active_reportings.submit(
        AlertType.SALE_DURING_BEACON_MALFUNCTION.value
    )

    # Tag is_at_port using port H3 referential, then keep only at-sea vessels
    vessels_with_recent_ais = tag_positions_at_port(vessels_with_recent_ais)
    vessels_with_recent_ais_at_sea = filter_vessels_at_sea(vessels_with_recent_ais)

    # Transform
    ids_to_follow = get_malfunction_ids_with_activity(
        vessels_with_recent_ais_at_sea, non_archived_malfunctions
    )
    vessels_without_malfunction = get_vessels_without_malfunction(
        vessels_with_recent_ais_at_sea, non_archived_malfunctions
    )
    current_malfunctions_with_declared_activity_to_follow = (
        get_malfunction_ids_not_already_followed(
            current_malfunctions_with_declared_activity
        )
    )
    current_malfunctions_with_sale_to_follow = get_malfunction_ids_not_already_followed(
        current_malfunctions_with_sale
    )
    malfunction_candidates = add_malfunction_start_fields(vessels_without_malfunction)
    new_malfunctions = prepare_new_beacon_malfunctions(malfunction_candidates)
    ais_alerts = make_alerts(
        vessels_with_recent_ais_at_sea,
        AlertType.AIS_ACTIVITY_ON_VESSEL_NOT_EMITTING_VMS_ALERT.value,
        "Activité AIS détectée sans émission VMS",
        natinf_code=27688,
        threat="Mesures techniques et de conservation",
        threat_characterization="VMS - absence",
    )
    filtered_ais_alerts = filter_alerts(
        ais_alerts, ais_silenced_alerts, ais_active_reportings
    )
    declared_activity_alerts = make_alerts(
        current_malfunctions_with_declared_activity,
        AlertType.DECLARED_FISHING_ACTIVITY_DURING_BEACON_MALFUNCTION.value,
        "Activité de pêche déclarée pendant une avarie VMS",
        natinf_code=27688,
        threat="Mesures techniques et de conservation",
        threat_characterization="VMS - absence",
    )
    filtered_declared_activity_alerts = filter_alerts(
        declared_activity_alerts,
        declared_activity_silenced_alerts,
        declared_activity_active_reportings,
    )
    sale_alerts = make_alerts(
        current_malfunctions_with_sale,
        AlertType.SALE_DURING_BEACON_MALFUNCTION.value,
        "Note de vente pendant une avarie VMS",
        natinf_code=27688,
        threat="Mesures techniques et de conservation",
        threat_characterization="VMS - absence",
    )
    filtered_sale_alerts = filter_alerts(
        sale_alerts,
        sale_silenced_alerts,
        sale_active_reportings,
    )

    # Load
    update_beacon_malfunction_is_followed.map(
        ids_to_follow,
        is_followed=unmapped(True),
    )
    update_beacon_malfunction_is_followed.map(
        current_malfunctions_with_declared_activity_to_follow,
        is_followed=unmapped(True),
    )
    update_beacon_malfunction_is_followed.map(
        current_malfunctions_with_sale_to_follow,
        is_followed=unmapped(True),
    )
    load_new_beacon_malfunctions(new_malfunctions)
    load_alerts(
        filtered_ais_alerts,
        alert_config_name=AlertType.AIS_ACTIVITY_ON_VESSEL_NOT_EMITTING_VMS_ALERT.value,
    )
    load_alerts(
        filtered_declared_activity_alerts,
        alert_config_name=(
            AlertType.DECLARED_FISHING_ACTIVITY_DURING_BEACON_MALFUNCTION.value
        ),
    )
    load_alerts(
        filtered_sale_alerts,
        alert_config_name=AlertType.SALE_DURING_BEACON_MALFUNCTION.value,
    )
