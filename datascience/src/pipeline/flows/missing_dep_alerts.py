from pathlib import Path

from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.entities.alerts import AlertType
from src.pipeline.generic_tasks import extract
from src.pipeline.shared_tasks.alerts import (
    extract_active_reportings,
    extract_silenced_alerts,
    filter_alerts,
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
        vessels_with_missing_deps = extract_missing_deps()

        alerts = make_alerts(
            vessels_with_missing_deps,
            AlertType.MISSING_DEP_ALERT.value,
            AlertType.MISSING_DEP_ALERT.value,
        )
        silenced_alerts = extract_silenced_alerts(AlertType.MISSING_DEP_ALERT.value)
        active_reportings = extract_active_reportings(AlertType.MISSING_DEP_ALERT.value)
        filtered_alerts = filter_alerts(alerts, silenced_alerts, active_reportings)

        # Load
        load_alerts(
            filtered_alerts, alert_config_name=AlertType.MISSING_DEP_ALERT.value
        )

flow.file_name = Path(__file__).name
