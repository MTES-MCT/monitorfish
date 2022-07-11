from pathlib import Path

import prefect
from prefect import task
from prefect.engine.signals import SKIP
from prefect.tasks.control_flow.filter import FilterTask
from prefect.utilities.graphql import with_args


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
