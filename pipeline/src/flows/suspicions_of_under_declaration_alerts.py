from prefect import flow, task

from src.entities.alerts import AlertType
from src.generic_tasks import extract
from src.shared_tasks.alerts import (
    extract_active_reportings,
    extract_silenced_alerts,
    filter_alerts,
    load_alerts,
    make_alerts,
)


@task
def extract_suspicions_of_under_declaration():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/suspicions_of_under_declaration.sql",
    )


@flow(name="Suspicions of under-declaration")
def suspicions_of_under_declaration_alerts_flow():
    vessels_with_suspicions_of_under_declaration = (
        extract_suspicions_of_under_declaration.submit()
    )
    silenced_alerts = extract_silenced_alerts.submit(
        AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value,
        # 8 days, to cover the date range analyzed in
        # `extract_suspicions_of_under_declaration`
        number_of_hours=192,
    )
    active_reportings = extract_active_reportings.submit(
        AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value
    )

    alerts = make_alerts(
        vessels_with_suspicions_of_under_declaration,
        AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value,
        AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value,
    )
    filtered_alerts = filter_alerts(alerts, silenced_alerts, active_reportings)

    # Load
    load_alerts(
        filtered_alerts,
        alert_config_name=AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value,
    )
