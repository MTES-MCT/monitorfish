import unittest
from datetime import datetime

from src.utils.ers import make_datetime, make_datetime_json_serializable


class TestUtilsERS(unittest.TestCase):
    def test_make_datetime(self):
        self.assertEqual(make_datetime("2020-01-05"), datetime(2020, 1, 5))
        self.assertIs(make_datetime("2020-31-05"), None)
        self.assertEqual(
            make_datetime("2020-01-05", "12:59"), datetime(2020, 1, 5, 12, 59, 0)
        )

    def test_make_datetime_json_serializable(self):
        self.assertEqual(
            make_datetime_json_serializable("2020-01-05"), "2020-01-05T00:00:00Z"
        )
        self.assertIs(make_datetime_json_serializable("2020-31-05"), None)
        self.assertEqual(
            make_datetime_json_serializable("2020-01-05", "12:59"),
            "2020-01-05T12:59:00Z",
        )
