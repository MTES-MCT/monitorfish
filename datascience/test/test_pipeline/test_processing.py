import datetime
import unittest

import numpy as np
import pandas as pd
import pytz

from src.pipeline.processing import (
    combine_overlapping_columns,
    concatenate_columns,
    concatenate_values,
    df_values_to_psql_arrays,
    first_valid_value,
    is_a_value,
    to_json,
    to_pgarr,
)


class TestProcessingMethods(unittest.TestCase):
    def test_is_a_value(self):
        self.assertTrue(is_a_value(1))
        self.assertTrue(is_a_value(""))
        self.assertTrue(is_a_value("a"))
        self.assertFalse(is_a_value(None))
        self.assertFalse(is_a_value(np.nan))

    def test_concatenate_values(self):
        row = pd.Series(["a", "a", 1, 2, None, "abc", 3, 2, None])
        self.assertEqual(concatenate_values(row), ["a", 1, 2, "abc", 3])

    def test_concatenate_columns(self):
        test_df_1 = pd.DataFrame(
            {"a": [1, "a", 2], "b": ["a", "b", None], "c": ["a", "c", 2]}
        )

        test_df_2 = pd.DataFrame(
            {"a": [None, None, None], "b": [None, None, None], "c": [None, None, None]}
        )

        res1 = concatenate_columns(test_df_1, ["a"])
        self.assertEqual(res1[0], [1])
        self.assertEqual(res1[1], ["a"])
        self.assertEqual(res1[2], [2])

        res2 = concatenate_columns(test_df_1, ["a", "b", "c"])
        self.assertEqual(res2[0], [1, "a"])
        self.assertEqual(res2[1], ["a", "b", "c"])
        self.assertEqual(res2[2], [2])

        res3 = concatenate_columns(test_df_2, ["a", "c"])
        self.assertEqual(res3[0], [])
        self.assertEqual(res3[1], [])
        self.assertEqual(res3[2], [])

    def test_first_valid_value_1(self):
        row = pd.Series([None, np.nan, None, "a", 1, 2, None, "c"])
        self.assertEqual(first_valid_value(row), "a")

    def test_first_valid_value_2(self):
        row = pd.Series([None, np.nan, None])
        self.assertEqual(first_valid_value(row), None)

    def test_combine_overlapping_columns(self):
        df = pd.DataFrame(
            {
                "a": [1, 2, 3, None, np.nan, None, np.nan],
                "b": [None, None, "a", "b", None, None, np.nan],
                "c": ["c", None, None, "c", "c", None, np.nan],
                "d": ["d", "d", "d", "d", "d", None, np.nan],
            }
        )

        res = combine_overlapping_columns(df, ["b", "c", "a"])
        self.assertEqual(res.values[0], "c")
        self.assertEqual(res.values[1], 2)
        self.assertEqual(res.values[2], "a")
        self.assertEqual(res.values[3], "b")
        self.assertEqual(res.values[4], "c")
        self.assertEqual(res.values[5], None)
        self.assertEqual(res.values[6], None)

    def test_to_json(self):

        # Test basic dicts and lists serialization
        a = [1, 2, 3]
        b = {"a": 1, "b": 2}

        # Test None and np.nan serialization
        c = None
        d = np.nan
        e = [1, 2, 3, None, np.nan]
        f = [1, 2, {"a": 1, "b": None, "c": np.nan}]
        e = {"a": 1, 2: "b"}
        f = {"a": {"b": [1, None, np.nan], "c": 4}, "b": 2}

        # Test numpy array serialization
        g = np.array([1, 2, 3])
        h = np.array([[1, 2, 3], [4, 5, 6]])

        # Test date and datetime serialization
        i = datetime.datetime(2020, 3, 11, 20, 5, 12)
        utc_tz = pytz.timezone("utc")
        j = utc_tz.localize(datetime.datetime(2020, 3, 11, 20, 5, 12))
        est_tz = pytz.timezone("est")
        k = est_tz.localize(datetime.datetime(2020, 3, 11, 20, 5, 12))

        # Test nested dict containing None, np.nan, pandas `NaT`
        m = {
            "a": {
                "int": 1,
                "None": None,
                "np.nan": np.nan,
                "pandas NaT": pd._libs.tslibs.nattype.NaTType(),
                "numpy array": np.array([1, 2, 3]),
                "datetime": datetime.datetime(2020, 3, 11, 20, 5, 12),
                "datetime_tz_est": est_tz.localize(
                    datetime.datetime(2020, 3, 11, 20, 5, 12)
                ),
            }
        }

        res_a = to_json(a)
        res_b = to_json(b)
        res_c = to_json(c)
        res_d = to_json(d)
        res_e = to_json(e)
        res_f = to_json(f)
        res_e = to_json(e)
        res_f = to_json(f)
        res_g = to_json(g)
        res_h = to_json(h)
        res_i = to_json(i)
        res_j = to_json(j)
        res_k = to_json(k)
        res_m = to_json(m)

        self.assertEqual(res_a, "[1, 2, 3]")
        self.assertEqual(res_b, '{"a": 1, "b": 2}')
        self.assertEqual(res_c, "null")
        self.assertEqual(res_d, "NaN")
        self.assertEqual(res_e, '{"a": 1, "2": "b"}')
        self.assertEqual(res_f, '{"a": {"b": [1, null, NaN], "c": 4}, "b": 2}')
        self.assertEqual(res_e, '{"a": 1, "2": "b"}')
        self.assertEqual(res_f, '{"a": {"b": [1, null, NaN], "c": 4}, "b": 2}')
        self.assertEqual(res_g, "[1, 2, 3]")
        self.assertEqual(res_h, "[[1, 2, 3], [4, 5, 6]]")
        self.assertEqual(res_i, '"2020-03-11T20:05:12Z"')
        self.assertEqual(res_j, '"2020-03-11T20:05:12Z"')
        self.assertEqual(res_k, '"2020-03-12T01:05:12Z"')
        self.assertEqual(
            res_m,
            '{"a": {"int": 1, "None": null, "np.nan": NaN, "pandas NaT": null, '
            '"numpy array": [1, 2, 3], "datetime": "2020-03-11T20:05:12Z", '
            '"datetime_tz_est": "2020-03-12T01:05:12Z"}}',
        )

    def test_to_pgarr(self):
        a = [1, 2, 3]
        b = ["a", "b", "c"]
        c = [1, "a", None]
        d = []
        e = None

        res_a = to_pgarr(a)
        res_b = to_pgarr(b)
        res_c = to_pgarr(c)
        res_d = to_pgarr(d)
        with self.assertRaises(ValueError):
            to_pgarr(e)

        res_e = to_pgarr(e, handle_errors=True)

        self.assertEqual(res_a, "{1,2,3}")
        self.assertEqual(res_b, "{a,b,c}")
        self.assertEqual(res_c, "{1,a,None}")
        self.assertEqual(res_d, "{}")
        self.assertIsNone(res_e)

    def test_df_values_to_psql_arrays(self):
        df = pd.DataFrame(
            {
                "a": [1, 2, 3, 4],
                "b": [[1, 2], ["a", "b"], [1, 3], ["a", "a"]],
                "c": [None, [], ["", " "], [" ", 5]],
            }
        )

        with self.assertRaises(ValueError):
            df_values_to_psql_arrays(df[["b", "c"]])
        res = df_values_to_psql_arrays(
            df[["b", "c"]], handle_errors=True, value_on_error="caught"
        )

        self.assertEqual(list(res), ["b", "c"])
        self.assertTrue((res["b"] == ["{1,2}", "{a,b}", "{1,3}", "{a,a}"]).all())
        self.assertTrue((res["c"] == ["caught", "{}", "{}", "{5}"]).all())
