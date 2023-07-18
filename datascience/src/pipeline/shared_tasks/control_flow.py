from datetime import datetime, tzinfo
from pathlib import Path
from typing import List

import prefect
from prefect import task
from prefect.engine.signals import SKIP
from prefect.tasks.control_flow.filter import FilterTask
from prefect.utilities.graphql import with_args

from config import FLOWS_LABEL, PREFECT_SERVER_URL
from src.pipeline.entities.prefect import FlowRun


@task(checkpoint=False)
def get_flow_runs(
    states: List[str], max_state_datetime_utc: datetime = None
) -> List[FlowRun]:
    """
    This task fetches flow runs that match the states and max_state_datetime_utc criteria.
    """
    logger = prefect.context.get("logger")
    prefect_client = prefect.Client(api_server=PREFECT_SERVER_URL)

    filters = [{"labels": {"_contains": FLOWS_LABEL}}]

    if states:
        filters.append({"state": {"_in": states}})

    if max_state_datetime_utc:
        try:
            assert isinstance(max_state_datetime_utc, datetime)
        except AssertionError:
            raise ValueError("max_state_datetime_utc must be a datetime object")

        try:
            assert isinstance(max_state_datetime_utc.tzinfo, tzinfo)
        except AssertionError:
            raise ValueError("max_state_datetime_utc must be timezone aware")

        filters.append({"state_timestamp": {"_lt": max_state_datetime_utc.isoformat()}})

    query = {
        "query": {
            with_args("flow_run", {"where": {"_and": filters}},): {
                "id",
                "flow {name}",
                "state",
                "state_timestamp",
            }
        }
    }

    logger.info(f"Sending query {query}")
    response = prefect_client.graphql(query)

    logger.info("Parsing results")
    flow_runs = response.get("data", {}).get("flow_run", [])
    flow_runs = [
        FlowRun(
            flow_run_id=run["id"],
            flow_name=run["flow"]["name"],
            state=run["state"],
            state_timestamp=datetime.fromisoformat(run["state_timestamp"]),
        )
        for run in flow_runs
    ]

    logger.info(f"Returning {len(flow_runs)} flow runs.")

    return flow_runs


@task(checkpoint=False)
def cancel_flow_run(flow_run: FlowRun):
    logger = prefect.context.get("logger")
    prefect_client = prefect.Client(api_server=PREFECT_SERVER_URL)

    logger.info(
        (
            f"Cancelling flow run {flow_run.flow_run_id} of flow {flow_run.flow_name} "
            f"which has been in state {flow_run.state} since {flow_run.state_timestamp}."
        )
    )

    prefect_client.cancel_flow_run(flow_run.flow_run_id)


@task(checkpoint=False)
def check_flow_not_running() -> bool:
    """
    This task determines if the flow in which it runs has flow runs in a 'running'
    state. This may be used to stop a flow run from proceeding if the flow's previous
    run has not yet finished running and concurrency is not desired.

    Returns:
        bool: ``True`` if the flow does NOT already have flow runs in a "running"
          state, ``False`` if it does
    """

    prefect_client = prefect.Client()

    query = {
        "query": {
            with_args(
                "flow_run",
                {
                    "where": {
                        "flow_id": {"_eq": prefect.context.flow_id},
                        "id": {"_neq": prefect.context.flow_run_id},
                        "state": {"_eq": "Running"},
                    }
                },
            ): {"id"}
        }
    }
    response = prefect_client.graphql(query)
    active_flow_runs = response.get("data", {}).get("flow_run", [])

    flow_is_not_running = active_flow_runs == []

    if not flow_is_not_running:
        logger = prefect.context.get("logger")
        logger.info("This flow already has runs in a 'Running' state.")

    return flow_is_not_running


@task(checkpoint=False)
def str_to_path(path: str) -> Path:
    """Returns `Path` object corresponding to input `str`

    Args:
        path (str): 'stairway/to/heaven'

    Returns:
        Path: Path('stairway/to/heaven')
    """
    return Path(path)


filter_results = FilterTask(
    filter_func=lambda x: not isinstance(x, (BaseException, SKIP, type(None)))
)
