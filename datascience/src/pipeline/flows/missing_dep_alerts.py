from pathlib import Path

from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.generic_tasks import extract
from src.pipeline.shared_tasks.alerts import (
    extract_silenced_alerts,
    filter_silenced_alerts,
    load_alerts,
    make_alerts,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_missing_deps():
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/missing_deps.sql"
    )


with Flow("Missing DEP alerts", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        alert_type = Parameter("alert_type")
        alert_config_name = Parameter("alert_config_name")

        vessels_with_missing_deps = extract_missing_deps()

        alerts = make_alerts(vessels_with_missing_deps, alert_type, alert_config_name)
        silenced_alerts = extract_silenced_alerts(alert_type)
        alert_without_silenced = filter_silenced_alerts(alerts, silenced_alerts)

        # Load
        load_alerts(alert_without_silenced, alert_config_name=alert_config_name)

flow.file_name = Path(__file__).name
