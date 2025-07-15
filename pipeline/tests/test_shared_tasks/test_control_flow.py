from pathlib import Path

from prefect import allow_failure, flow, task

from src.shared_tasks.control_flow import filter_results, str_to_path


def test_str_to_path():
    assert str_to_path("a/b/c") == Path("a/b/c")


@task
def some_list() -> list:
    return [0, 1, 2, 3, 4]


@task
def unstable_task(arg):
    if arg == 1:
        raise RuntimeError("Fail this task execution")
    if arg == 2:
        raise Exception("Another error occurred")
    if arg == 3:
        return None

    return arg


@task
def add_one(arg):
    return arg + 1


@task
def add_two(arg):
    return arg + 2


@task
def reduce(args):
    return sum(args)


@task
def false() -> bool:
    return False


@flow(name="Filter flow")
def filter_flow():
    li = some_list()
    funky_li = unstable_task.map(li)
    filtered_li = filter_results(allow_failure(funky_li))
    added_li = add_one.map(filtered_li)
    reduced_li = reduce(added_li)
    return (li, funky_li, filtered_li, added_li, reduced_li)


def test_filter_failed_tasks():
    state = filter_flow(return_state=True)
    assert state.is_completed()
    li, funky_li, filtered_li, added_li, reduced_li = state.result()
    assert li == [0, 1, 2, 3, 4]
    assert len(funky_li) == 5
    assert filtered_li == [0, 4]
    assert added_li.result() == [1, 5]
    assert reduced_li == 6
