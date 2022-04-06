from datetime import datetime

from src.pipeline.parsers.utils import make_datetime, make_datetime_json_serializable


def test_make_datetime():
    assert make_datetime("2020-01-05") == datetime(2020, 1, 5)
    assert make_datetime("2020-31-05") is None
    assert make_datetime("2020-01-05", "12:59") == datetime(2020, 1, 5, 12, 59, 0)


def test_make_datetime_json_serializable():
    assert make_datetime_json_serializable("2020-01-05") == "2020-01-05T00:00:00Z"
    assert make_datetime_json_serializable("2020-31-05") is None
    assert (
        make_datetime_json_serializable("2020-01-05", "12:59") == "2020-01-05T12:59:00Z"
    )
