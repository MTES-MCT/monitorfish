from pathlib import Path

from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from src.entities.alerts import AlertType
from src.generic_tasks import extract
from src.shared_tasks.alerts import (
    extract_active_reportings,
    extract_silenced_alerts,
    filter_alerts,
    load_alerts,
    make_alerts,
)
from src.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_suspicions_of_under_declaration():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/suspicions_of_under_declaration.sql",
    )


with Flow("Suspicions of under-declaration", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        vessels_with_suspicions_of_under_declaration = (
            extract_suspicions_of_under_declaration()
        )

        alerts = make_alerts(
            vessels_with_suspicions_of_under_declaration,
            AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value,
            AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value,
        )
        silenced_alerts = extract_silenced_alerts(
            AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value,
            # 8 days, to cover the date range analyzed in
            # `extract_suspicions_of_under_declaration`
            number_of_hours=192,
        )
        active_reportings = extract_active_reportings(
            AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value
        )
        filtered_alerts = filter_alerts(alerts, silenced_alerts, active_reportings)

        # Load
        load_alerts(
            filtered_alerts,
            alert_config_name=AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT.value,
        )

flow.file_name = Path(__file__).name
