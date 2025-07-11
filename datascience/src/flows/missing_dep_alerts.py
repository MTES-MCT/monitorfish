from pathlib import Path

from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

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
from src.shared_tasks.control_flow import check_flow_not_running
from src.shared_tasks.healthcheck import (
    assert_logbook_health,
    get_monitorfish_healthcheck,
)


@task(checkpoint=False)
def extract_missing_deps(hours_from_now: int):
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/missing_deps.sql",
        params={"hours_from_now": hours_from_now},
    )


with Flow("Missing DEP alerts", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        healthcheck = get_monitorfish_healthcheck()
        logbook_healthcheck = assert_logbook_health(healthcheck)
        hours_from_now = Parameter("hours_from_now", MISSING_DEP_TRACK_ANALYSIS_HOURS)
        vessels_with_missing_deps = extract_missing_deps(
            hours_from_now, upstream_tasks=[logbook_healthcheck]
        )

        alerts = make_alerts(
            vessels_with_missing_deps,
            AlertType.MISSING_DEP_ALERT.value,
            AlertType.MISSING_DEP_ALERT.value,
        )
        silenced_alerts = extract_silenced_alerts(
            AlertType.MISSING_DEP_ALERT.value,
            number_of_hours=hours_from_now,
            upstream_tasks=[logbook_healthcheck],
        )
        active_reportings = extract_active_reportings(
            AlertType.MISSING_DEP_ALERT.value, upstream_tasks=[logbook_healthcheck]
        )
        filtered_alerts = filter_alerts(alerts, silenced_alerts, active_reportings)

        # Load
        load_alerts(
            filtered_alerts, alert_config_name=AlertType.MISSING_DEP_ALERT.value
        )

flow.file_name = Path(__file__).name
