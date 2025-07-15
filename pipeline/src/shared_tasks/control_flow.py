from pathlib import Path
from typing import List

from prefect import task


@task
def str_to_path(path: str) -> Path:
    """Returns `Path` object corresponding to input `str`

    Args:
        path (str): 'stairway/to/heaven'

    Returns:
        Path: Path('stairway/to/heaven')
    """
    return Path(path)


@task
def filter_results(task_results) -> List:
    """
    Filters invalid results from an input mapped results list.

    Args:
        task_results: List of (mapped) task results.

    Raises:
        AssertionError: If input is not a list.

    Returns:
        List: Filtered list with SKIPs, Nones and Errors removed
    """
    try:
        assert isinstance(task_results, list)
    except AssertionError as e:
        raise ValueError from e

    return [r for r in task_results if not isinstance(r, (Exception, type(None)))]
