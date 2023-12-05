from pathlib import Path

from prefect import Flow, Parameter

from config import FLOW_STATES_TO_CLEAN, MAX_FLOW_RUN_MINUTES
from forklift.pipeline.shared_tasks.control_flow import cancel_flow_run, get_flow_runs
from forklift.pipeline.shared_tasks.dates import (
    get_timezone_aware_utcnow,
    make_timedelta,
)

with Flow("Clean flow runs") as flow:
    flow_states_to_clean = Parameter(
        "flow_states_to_clean", default=FLOW_STATES_TO_CLEAN
    )
    max_flow_run_minutes = Parameter(
        "max_flow_run_minutes", default=MAX_FLOW_RUN_MINUTES
    )

    now = get_timezone_aware_utcnow()
    max_flow_run_duration = make_timedelta(minutes=max_flow_run_minutes)
    max_state_datetime_utc = now - max_flow_run_duration

    flow_runs_to_delete = get_flow_runs(
        states=flow_states_to_clean, max_state_datetime_utc=max_state_datetime_utc
    )

    cancel_flow_run.map(flow_runs_to_delete)

flow.file_name = Path(__file__).name
