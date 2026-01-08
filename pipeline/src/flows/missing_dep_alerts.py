from prefect import flow, task

from config import MISSING_DEP_TRACK_ANALYSIS_HOURS
from src.entities.alerts import AlertType
from src.generic_tasks import extract
from src.shared_tasks.alerts import (
    extract_active_reportings,
    extract_silenced_alerts,
    filter_alerts,
    load_alerts,
    make_alerts,
)
from src.shared_tasks.healthcheck import (
    assert_logbook_health,
    get_monitorfish_healthcheck,
)


@task
def extract_missing_deps(hours_from_now: int):
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/missing_deps.sql",
        params={"hours_from_now": hours_from_now},
    )


@flow(name="Monitorfish - Missing DEP alerts")
def missing_dep_alerts_flow(
    hours_from_now: int = MISSING_DEP_TRACK_ANALYSIS_HOURS,
):
    # Healthcheck
    healthcheck = get_monitorfish_healthcheck()
    assert_logbook_health(healthcheck)

    # Extract
    silenced_alerts = extract_silenced_alerts.submit(
        AlertType.MISSING_DEP_ALERT.value,
        number_of_hours=hours_from_now,
    )
    vessels_with_missing_deps = extract_missing_deps.submit(hours_from_now)
    active_reportings = extract_active_reportings.submit(
        AlertType.MISSING_DEP_ALERT.value
    )

    # Transform
    alerts = make_alerts(
        vessels_with_missing_deps,
        AlertType.MISSING_DEP_ALERT.value,
        "Sortie en mer sans émission de message DEP",
        natinf_code=27689,
        threat="Obligations déclaratives",
        threat_characterization="DEP",
    )
    filtered_alerts = filter_alerts(alerts, silenced_alerts, active_reportings)

    # Load
    load_alerts(filtered_alerts, alert_config_name=AlertType.MISSING_DEP_ALERT.value)
