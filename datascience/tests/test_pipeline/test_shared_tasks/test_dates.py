import unittest
from datetime import datetime
from unittest.mock import patch

from src.pipeline.helpers.dates import Period
from src.pipeline.shared_tasks.dates import make_periods


class TestSharedTasksDates(unittest.TestCase):
    @patch("src.pipeline.shared_tasks.dates.datetime")
    def test_make_periods(self, mock_datetime):

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

        self.assertEqual(periods, expected_periods)
