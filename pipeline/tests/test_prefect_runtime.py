import subprocess
import sys


def test_prefect_cli_is_importable():
    """
    Production flow runs are executed by the Prefect worker through the ``prefect``
    CLI (``prefect flow-run execute``), which imports ``prefect.cli`` ->
    ``prefect.workers``. Our other tests only import flows in-process and never
    exercise that path, so a missing (usually transitive) dependency on the CLI
    import chain goes unnoticed until it breaks every flow run in production.

    Regression test for Prefect 3.6.9 importing ``importlib_metadata`` in
    ``prefect/workers/base.py`` without declaring it as a dependency.
    """
    import prefect.cli  # noqa: F401
    import prefect.workers.process  # noqa: F401


def test_prefect_cli_runs_as_subprocess():
    """
    Same guard as above, but going through the actual ``prefect`` entrypoint the
    worker uses, so packaging issues that only show up in a fresh interpreter are
    caught too.
    """
    result = subprocess.run(
        [sys.executable, "-m", "prefect", "version"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
