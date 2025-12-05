from prefect import flow

from src.shared_tasks.alerts import (
    archive_reporting,
    extract_non_archived_reportings_ids_of_type,
    extract_pending_alerts_ids_of_type,
    validate_pending_alert,
)


@flow(name="Monitorfish - Validate pending alerts")
def validate_pending_alerts_flow(alert_type: str):
    pending_alert_ids = extract_pending_alerts_ids_of_type(alert_type)
    validated_alerts = validate_pending_alert.map(pending_alert_ids)
    validated_alerts.wait()
    reporting_ids = extract_non_archived_reportings_ids_of_type(alert_type)
    archived_reporting = archive_reporting.map(reporting_ids)
    archived_reporting.wait()
