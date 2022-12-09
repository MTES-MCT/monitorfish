from pathlib import Path

from prefect import Flow, task
from prefect.engine.signals import SKIP

from src.pipeline.shared_tasks.control_flow import filter_results, str_to_path


def test_str_to_path():
    assert str_to_path.run("a/b/c") == Path("a/b/c")


@task(checkpoint=False)
def unstable_task(arg):
    if arg == 1:
        raise RuntimeError("Fail this task execution")
    if arg == 2:
        raise SKIP("Skip this task execution")
    if arg == 3:
        return None

    return arg


@task(checkpoint=False)
def add_one(arg):
    return arg + 1


@task(checkpoint=False)
def reduce(args):
    return args


with Flow("filter") as flow:
    raw = unstable_task.map([0, 1, 2, 3, 4])
    # raw is [0, RuntimeError, SKIP, None, 4] at this point

    filtered = filter_results(raw)
    mapped = add_one.map(filtered)
    reduced = reduce(mapped)


def test_filter_failed_tasks():
    flow.schedule = None
    state = flow.run()
    assert len(state.result[flow.get_tasks("unstable_task")[0]].result) == 5
    assert state.result[flow.get_tasks("FilterTask")[0]].result == [0, 4]
    assert state.result[flow.get_tasks("add_one")[0]].result == [1, 5]
    assert state.result[flow.get_tasks("reduce")[0]].result == [1, 5]
