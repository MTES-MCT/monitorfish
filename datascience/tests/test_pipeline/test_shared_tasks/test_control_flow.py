from pathlib import Path

from prefect import Flow, case, task
from prefect.engine.signals import SKIP

from src.pipeline.shared_tasks.control_flow import filter_results, str_to_path


def test_str_to_path():
    assert str_to_path.run("a/b/c") == Path("a/b/c")


@task(checkpoint=False)
def some_list() -> list:
    return [0, 1, 2, 3, 4]


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
def add_two(arg):
    return arg + 2


@task(checkpoint=False)
def reduce(args):
    return args


@task(checkpoint=False)
def false() -> bool:
    return False


with Flow("filter") as flow:
    li_1 = some_list()
    li_1 = unstable_task.map(li_1)
    # raw is [0, RuntimeError, SKIP, None, 4] at this point

    filtered = filter_results(li_1)
    mapped = add_one.map(filtered)
    reduced = reduce(mapped)
    cond = false()

    with case(cond, True):
        li_2 = add_two(li_1)
        li_2 = filter_results(li_2)


def test_filter_failed_tasks():
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()
    assert len(state.result[flow.get_tasks("unstable_task")[0]].result) == 5
    assert state.result[flow.get_tasks("add_one")[0]].result == [1, 5]
    assert state.result[flow.get_tasks("reduce")[0]].result == [1, 5]

    filtered_results = (
        state.result[flow.get_tasks("filter_results")[0]],
        state.result[flow.get_tasks("filter_results")[1]],
    )
    if filtered_results[0].result == [0, 4]:
        assert filtered_results[1].is_skipped()
    else:
        assert filtered_results[0].is_skipped()
        assert filtered_results[1].result == [0, 4]
