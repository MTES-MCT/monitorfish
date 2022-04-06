from pathlib import Path

from src.pipeline.shared_tasks.control_flow import str_to_path


def test_str_to_path():
    assert str_to_path.run("a/b/c") == Path("a/b/c")
