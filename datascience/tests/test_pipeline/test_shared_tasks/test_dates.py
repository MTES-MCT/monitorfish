from datetime import datetime
from unittest.mock import patch

import pytest

from src.pipeline.helpers.dates import Period
from src.pipeline.shared_tasks.dates import date_trunc, make_periods


@patch("src.pipeline.shared_tasks.dates.datetime")
def test_make_periods(mock_datetime):
    mock_datetime.utcnow.return_value = datetime(2021, 10, 5)

    periods = make_periods.run(
        start_hours_ago=72,
        end_hours_ago=0,
        minutes_per_chunk=1560,
        chunk_overlap_minutes=120,
    )

    expected_periods = [
        Period(start=datetime(2021, 10, 2, 0, 0), end=datetime(2021, 10, 3, 2, 0)),
        Period(start=datetime(2021, 10, 3, 0, 0), end=datetime(2021, 10, 4, 2, 0)),
        Period(start=datetime(2021, 10, 4, 0, 0), end=datetime(2021, 10, 5, 0, 0)),
    ]

    assert periods == expected_periods


def test_date_trunc():
    d = datetime(2036, 5, 6, 12, 36, 23, 185)
    assert date_trunc.run(d, "YEAR") == datetime(2036, 1, 1, 0, 0, 0, 0)
    assert date_trunc.run(d, "MONTH") == datetime(2036, 5, 1, 0, 0, 0, 0)
    assert date_trunc.run(d, "DAY") == datetime(2036, 5, 6, 0, 0, 0, 0)
    assert date_trunc.run(d, "HOUR") == datetime(2036, 5, 6, 12, 0, 0, 0)
    assert date_trunc.run(d, "MINUTE") == datetime(2036, 5, 6, 12, 36, 0, 0)
    assert date_trunc.run(d, "SECOND") == datetime(2036, 5, 6, 12, 36, 23, 0)
    with pytest.raises(ValueError):
        date_trunc.run(d, "INCORRECT_UNIT")
