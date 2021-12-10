import prefect
from prefect import Task, task
from prefect.tasks.control_flow.conditional import Merge
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


def merge(*tasks: Task, flow=None, mapped: bool = False, **kwargs) -> Task:
    """
    Taken from prefect source code, copied here to add **kwargs.

    Merges conditional branches back together.
    A conditional branch in a flow results in one or more tasks proceeding and one or
    more tasks skipping. It is often convenient to merge those branches back into a
    single result. This function is a simple way to achieve that goal. By default this
    task will skip if all its upstream dependencies are also skipped.
    The merge will return the first real result it encounters, or `None`. If multiple
    tasks might return a result, group them with a list.
    Example:
        ```python
        with Flow("My Flow"):
            true_branch = ActionIfTrue()
            false_branch = ActionIfFalse()
            ifelse(CheckCondition(), true_branch, false_branch)
            merged_result = merge(true_branch, false_branch)
        ```
    Args:
        - *tasks (Task): tasks whose results should be merged into a single result. The tasks are
            assumed to all sit downstream of different `switch` branches, such that only
            one of them will contain a result and the others will all be skipped.
        - flow (Flow, optional): The flow to use, defaults to the current flow
            in context if no flow is specified
        - mapped (bool, optional): If true, the `merge` operation will be mapped over the
            arguments instead of applied directly. Defaults to `False`.
    Returns:
        - Task: a Task representing the merged result.
    """
    return Merge(**kwargs).bind(
        **{"task_{}".format(i + 1): t for i, t in enumerate(tasks)},
        flow=flow,
        mapped=mapped
    )
