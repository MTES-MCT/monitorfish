from pathlib import Path

from prefect import Flow, Parameter, case
from prefect.executors import LocalDaskExecutor

from src.pipeline.shared_tasks.alerts import (
    extract_pending_alerts_ids_of_config_name,
    validate_pending_alert,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running

with Flow("Validate pending alerts", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        alert_config_name = Parameter("alert_config_name")
        pending_alert_ids = extract_pending_alerts_ids_of_config_name(alert_config_name)
        validate_pending_alert.map(pending_alert_ids)

flow.file_name = Path(__file__).name
