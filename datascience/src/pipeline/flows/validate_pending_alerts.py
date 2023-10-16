from pathlib import Path

from prefect import Flow, Parameter, case
from prefect.executors import LocalDaskExecutor

from src.pipeline.shared_tasks.alerts import (
    archive_reporting,
    extract_non_archived_reportings_ids_of_type,
    extract_pending_alerts_ids_of_type,
    validate_pending_alert,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running

with Flow("Validate pending alerts", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        alert_type = Parameter("alert_type")
        pending_alert_ids = extract_pending_alerts_ids_of_type(alert_type)
        validated_alerts = validate_pending_alert.map(pending_alert_ids)
        reporting_ids = extract_non_archived_reportings_ids_of_type(
            alert_type, upstream_tasks=[validated_alerts]
        )
        archive_reporting.map(reporting_ids)

flow.file_name = Path(__file__).name
