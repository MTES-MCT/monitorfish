import unittest

import numpy as np
import pandas as pd

from src.pipeline.processing import (
    combine_overlapping_columns,
    concatenate_columns,
    concatenate_values,
    first_valid_value,
    is_a_value,
    lst2pgarr,
    python_lists_to_psql_arrays,
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

    def test_lst2pgarr(self):
        a = [1, 2, 3]
        b = ["a", "b", "c"]
        c = [1, "a", None]
        d = []

        res_a = lst2pgarr(a)
        res_b = lst2pgarr(b)
        res_c = lst2pgarr(c)
        res_d = lst2pgarr(d)

        self.assertEqual(res_a, "{1,2,3}")
        self.assertEqual(res_b, "{a,b,c}")
        self.assertEqual(res_c, "{1,a,None}")
        self.assertEqual(res_d, "{}")

    def test_python_lists_to_psql_arrays(self):
        df = pd.DataFrame(
            {
                "a": [1, 2, 3, 4],
                "b": [[1, 2], ["a", "b"], [1, 3], ["a", "a"]],
                "c": [[1, 2], [], ["", " "], [" ", 5]],
            }
        )
        res = python_lists_to_psql_arrays(df, ["b", "c"])

        self.assertTrue((res["a"] == [1, 2, 3, 4]).all())
        self.assertTrue((res["b"] == ["{1,2}", "{a,b}", "{1,3}", "{a,a}"]).all())
        self.assertTrue((res["c"] == ["{1,2}", "{}", "{}", "{5}"]).all())
