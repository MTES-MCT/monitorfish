import unittest
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

from src.pipeline.helpers.dates import Period, get_datetime_intervals, make_periods


class TestHelpersDatetime(unittest.TestCase):
    def test_get_datetime_intervals(self):

        s = pd.Series(
            [
                datetime(2021, 1, 1, 0, 0, 0),
                datetime(2021, 1, 1, 0, 10, 0),
                datetime(2021, 1, 1, 0, 0, 10),
                datetime(2021, 1, 1, 10, 0, 0),
                datetime(2021, 1, 1, 10, 0, 25),
            ],
            index=[1, 129, 4, 5, 0],
        )

        # Test default unit and computation method
        intervals = get_datetime_intervals(s)
        expected_intervals = pd.Series(
            [
                pd.NaT,
                timedelta(minutes=10),
                timedelta(minutes=-10, seconds=10),
                timedelta(hours=10, seconds=-10),
                timedelta(seconds=25),
            ],
            index=[1, 129, 4, 5, 0],
        )

        pd.testing.assert_series_equal(intervals, expected_intervals)

        # Test unit 'h' and computation method 'forward'
        intervals = get_datetime_intervals(s, unit="h", how="forward")
        expected_intervals = pd.Series(
            [
                0.16666666666666666,
                -0.1638888888888889,
                9.997222222222222,
                0.006944444444444445,
                np.nan,
            ],
            index=[1, 129, 4, 5, 0],
        )

        pd.testing.assert_series_equal(intervals, expected_intervals)

        # Test unit 'min' and computation method 'backward'
        intervals = get_datetime_intervals(s, unit="min", how="backward")
        expected_intervals = pd.Series(
            [
                np.nan,
                10,
                -9.833333333333334,
                599.8333333333334,
                0.4166666666666667,
            ],
            index=[1, 129, 4, 5, 0],
        )

        pd.testing.assert_series_equal(intervals, expected_intervals)

        # Test unit 's' and computation method 'backward'
        intervals = get_datetime_intervals(s, unit="s", how="backward")
        expected_intervals = pd.Series(
            [
                np.nan,
                600,
                -590,
                35990,
                25,
            ],
            index=[1, 129, 4, 5, 0],
        )

        pd.testing.assert_series_equal(intervals, expected_intervals)

        # Test unit 'incorrect'
        with self.assertRaises(ValueError):
            get_datetime_intervals(s, unit="incorrect")

        # Test how 'incorrect'
        with self.assertRaises(ValueError):
            get_datetime_intervals(s, how="incorrect")

    def test_make_periods(self):
        with self.assertRaises(ValueError):
            make_periods(
                start_datetime_utc=datetime(2021, 12, 1),
                end_datetime_utc=datetime(2021, 12, 10),
                period_duration=timedelta(days=1),
                overlap=timedelta(days=1),
            )

        with self.assertRaises(ValueError):
            make_periods(
                start_datetime_utc=datetime(2021, 12, 1),
                end_datetime_utc=datetime(2021, 12, 10),
                period_duration=timedelta(days=1),
                overlap=timedelta(days=2),
            )

        with self.assertRaises(ValueError):
            make_periods(
                start_datetime_utc=datetime(2021, 12, 1),
                end_datetime_utc=datetime(2021, 11, 10),
                period_duration=timedelta(days=1),
                overlap=timedelta(hours=4),
            )

        # Test with overlap specified
        periods = make_periods(
            start_datetime_utc=datetime(2021, 12, 1),
            end_datetime_utc=datetime(2021, 12, 3),
            period_duration=timedelta(days=1),
            overlap=timedelta(hours=4),
        )

        expected_periods = [
            Period(
                start=datetime(2021, 12, 1, 0, 0),
                end=datetime(2021, 12, 2, 0, 0),
            ),
            Period(
                start=datetime(2021, 12, 1, 20, 0),
                end=datetime(2021, 12, 2, 20, 0),
            ),
            Period(
                start=datetime(2021, 12, 2, 16, 0),
                end=datetime(2021, 12, 3, 0, 0),
            ),
        ]

        self.assertEqual(periods, expected_periods)

        # Test without overlap specified
        periods = make_periods(
            start_datetime_utc=datetime(2021, 12, 1),
            end_datetime_utc=datetime(2021, 12, 3),
            period_duration=timedelta(days=1),
        )

        expected_periods = [
            Period(
                start=datetime(2021, 12, 1, 0, 0),
                end=datetime(2021, 12, 2, 0, 0),
            ),
            Period(
                start=datetime(2021, 12, 2, 0, 0),
                end=datetime(2021, 12, 3, 0, 0),
            ),
        ]

        self.assertEqual(periods, expected_periods)
