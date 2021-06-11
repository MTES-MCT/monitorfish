import datetime
import logging
import unittest
from unittest.mock import Mock, patch

import numpy as np
import pandas as pd
import pytz
from sqlalchemy import Column, Integer, MetaData, Table

from src.pipeline.processing import (
    combine_overlapping_columns,
    concatenate_columns,
    concatenate_values,
    df_to_dict_series,
    df_values_to_json,
    df_values_to_psql_arrays,
    drop_rows_already_in_table,
    is_a_value,
    join_on_multiple_keys,
    prepare_df_for_loading,
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

    def test_df_to_dict_series(self):
        df = pd.DataFrame(
            data={
                "a": [1, 2, 3, 4, 5],
                "b": ["a", 1.0, None, np.nan, [1, 2, 3]],
                "c": [None, None, None, None, None],
                "d": [
                    1,
                    [1, "a", None],
                    [{"a": 1, "b": None, "c": np.nan}],
                    {"a": 1, "b": [1, np.nan, None, ["a", "b"]]},
                    None,
                ],
            },
            index=pd.Index([0, 1, 4, 123, 3]),
        )

        expected_values = [
            {"a": 1, "b": "a", "c": None, "d": 1},
            {"a": 2, "b": 1.0, "c": None, "d": [1, "a", None]},
            {"a": 3, "b": None, "c": None, "d": [{"a": 1, "b": None, "c": None}]},
            {
                "a": 4,
                "b": None,
                "c": None,
                "d": {"a": 1, "b": [1, None, None, ["a", "b"]]},
            },
            {"a": 5, "b": [1, 2, 3], "c": None, "d": None},
        ]

        res = df_to_dict_series(df, result_colname="my_column_name")

        self.assertTrue(isinstance(res, pd.Series))
        self.assertEqual(res.name, "my_column_name")
        self.assertTrue((res.index == [0, 1, 4, 123, 3]).all())
        self.assertEqual(res.values.tolist(), expected_values)

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
        m = datetime.date(2020, 12, 5)

        # Test nested dict containing None, np.nan, pandas `NaT`
        n = {
            "a": {
                "int": 1,
                "None": None,
                "np.nan": np.nan,
                "pandas NaT": pd._libs.tslibs.nattype.NaTType(),
                "numpy array": np.array([1, 2, 3]),
                "date": datetime.date(2020, 12, 5),
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
        res_n = to_json(n)

        self.assertEqual(res_a, "[1, 2, 3]")
        self.assertEqual(res_b, '{"a": 1, "b": 2}')
        self.assertEqual(res_c, "null")
        self.assertEqual(res_d, "null")
        self.assertEqual(res_e, '{"a": 1, "2": "b"}')
        self.assertEqual(res_f, '{"a": {"b": [1, null, null], "c": 4}, "b": 2}')
        self.assertEqual(res_e, '{"a": 1, "2": "b"}')
        self.assertEqual(res_f, '{"a": {"b": [1, null, null], "c": 4}, "b": 2}')
        self.assertEqual(res_g, "[1, 2, 3]")
        self.assertEqual(res_h, "[[1, 2, 3], [4, 5, 6]]")
        self.assertEqual(res_i, '"2020-03-11T20:05:12Z"')
        self.assertEqual(res_j, '"2020-03-11T20:05:12Z"')
        self.assertEqual(res_k, '"2020-03-12T01:05:12Z"')
        self.assertEqual(res_m, '"2020-12-05"')
        self.assertEqual(
            res_n,
            '{"a": {"int": 1, "None": null, "np.nan": null, "pandas NaT": null, '
            '"numpy array": [1, 2, 3], "date": "2020-12-05", '
            '"datetime": "2020-03-11T20:05:12Z", '
            '"datetime_tz_est": "2020-03-12T01:05:12Z"}}',
        )

    def test_df_values_to_json(self):
        df = pd.DataFrame(
            [
                [1, 2, 3, 4, 5],
                [[1, 2, 3], {"a": 1, "b": None}, None, np.nan, "null"],
                [
                    {"a": [1, 2, 3], "b": {"a": 1, "b": None, "c": np.nan}},
                    2,
                    3,
                    "null",
                    None,
                ],
            ],
            columns=pd.Index(["a", "b", "c", "d", "e"]),
        )

        expected_values = [
            ["1", "2", "3.0", "4", "5"],
            ["[1, 2, 3]", '{"a": 1, "b": null}', "null", "null", '"null"'],
            [
                '{"a": [1, 2, 3], "b": {"a": 1, "b": null, "c": null}}',
                "2",
                "3.0",
                '"null"',
                "null",
            ],
        ]

        res = df_values_to_json(df)
        self.assertTrue(isinstance(res, pd.DataFrame))
        self.assertEqual(res.shape, (3, 5))
        self.assertEqual(list(res), ["a", "b", "c", "d", "e"])
        self.assertEqual(res.values.tolist(), expected_values)

    def test_df_values_to_psql_arrays(self):
        df = pd.DataFrame(
            {
                "a": [1, 2, 3, 4],
                "b": [[1, 2], ["a", "b"], [1, 3], ["a", "a"]],
                "c": ["This string shouldn't be here", np.nan, ["", 5, " "], None],
            }
        )

        with self.assertRaises(ValueError):
            df_values_to_psql_arrays(df[["b", "c"]])
        res = df_values_to_psql_arrays(
            df[["b", "c"]], handle_errors=True, value_on_error="caught"
        )

        self.assertEqual(list(res), ["b", "c"])
        #         self.assertTrue((res["b"] == ["{1,2}", "{a,b}", "{1,3}", "{a,a}"]).all())
        #         self.assertTrue((res["c"] == ["caught", "{}", "{5}", "{}"]).all())

        expected_values = [
            ["{1,2}", "caught"],
            ["{a,b}", "{}"],
            ["{1,3}", "{5}"],
            ["{a,a}", "{}"],
        ]

        self.assertEqual(res.values.tolist(), expected_values)

    @patch("src.pipeline.processing.pd")
    def test_drop_rows_already_in_table(self, mock_pandas):

        df = pd.DataFrame(
            data=[
                [1, 2, 3, 4],
                [1, "b", "c", "d"],
                [2, "first_value", 0, None],
                [2, "second_value_gets_dropped", None, 1],
                [3, 2, 3, 4],
            ],
            columns=pd.Index(["df_id_column", "a", "b", "c"]),
        )

        meta = MetaData()
        table = Table("my_test_table", meta, Column("table_id_column", Integer))
        mock_connection = Mock()
        logger = logging.Logger("test_logger")

        mock_pandas.read_sql.return_value = pd.DataFrame(
            [1], columns=pd.Index(["table_id_column"])
        )

        res = drop_rows_already_in_table(
            df=df,
            df_column_name="df_id_column",
            table=table,
            table_column_name="table_id_column",
            connection=mock_connection,
            logger=logger,
        )

        expected_values = [[2, "first_value", 0, None], [3, 2, 3, 4]]

        self.assertTrue(isinstance(res, pd.DataFrame))
        self.assertEqual(res.shape, (2, 4))
        self.assertEqual(res.values.tolist(), expected_values)

    def test_prepare_df_for_loading(self):
        df = pd.DataFrame(
            columns=pd.Index(
                ["id", "column_1", "pg_array_1", "pg_array_2", "json_1", "json_2"]
            ),
            data=[
                [
                    1,
                    "some value",
                    [1, 2, 3],
                    ["a", "b", "c"],
                    {"a": 1, "b": 2},
                    {"a": 1, "b": None},
                ],
                [
                    2,
                    "some other value",
                    [1, 2, 5],
                    [1, 5, 7],
                    {"a": 1, "b": None, "c": np.nan},
                    {"a": 1, "b": [datetime.datetime(2021, 1, 23, 12, 56, 7), np.nan]},
                ],
            ],
        )

        logger = logging.Logger("test_logger")

        res = prepare_df_for_loading(
            df,
            logger,
            pg_array_columns=["pg_array_1", "pg_array_2"],
            handle_array_conversion_errors=True,
            value_on_array_conversion_error="{}",
            jsonb_columns=["json_1", "json_2"],
        )

        expected_values = [
            [
                1,
                "some value",
                "{1,2,3}",
                "{a,b,c}",
                '{"a": 1, "b": 2}',
                '{"a": 1, "b": null}',
            ],
            [
                2,
                "some other value",
                "{1,2,5}",
                "{1,5,7}",
                '{"a": 1, "b": null, "c": null}',
                '{"a": 1, "b": ["2021-01-23T12:56:07Z", null]}',
            ],
        ]

        self.assertTrue(isinstance(res, pd.DataFrame))
        self.assertEqual(res.shape, (2, 6))
        self.assertEqual(expected_values, res.values.tolist())

    def test_join_on_multiple_keys(self):
        left = pd.DataFrame(
            {
                "key_1": [1, 2, None, 4, None, 6, None, np.nan],
                "key_2": ["a", None, "c", "d", "e", None, None, np.nan],
                "key_3": ["A", "B", np.nan, "D", "E", None, None, np.nan],
                "value_left_1": [9, 8, 7, 6, 5, 4, 3, 2],
                "value_left_2": [90, 80, "70", None, 5.025, "left", 40, 30],
            }
        )

        right = pd.DataFrame(
            {
                "key_1": [1, 2, 3, 4, 5, 7, np.nan],
                "key_2": ["a", None, "c", "ddd", np.nan, None, np.nan],
                "key_3": ["A", "B", "C", "DDD", "E", None, np.nan],
                "value_right": ["R1", "R2", "R3", "R4", "R5", "right", np.nan],
            }
        )

        # Test inner join
        res_inner = join_on_multiple_keys(
            left, right, on=["key_1", "key_2", "key_3"], how="inner"
        ).fillna("null")

        expected_values = [
            [1.0, "a", "A", 9, 90, "R1"],
            [2.0, "null", "B", 8, 80, "R2"],
            [4.0, "d", "D", 6, "null", "R4"],
            [3.0, "c", "C", 7, "70", "R3"],
            [5.0, "e", "E", 5, 5.025, "R5"],
        ]

        self.assertEqual(res_inner.values.tolist(), expected_values)

        # Test left join
        res_left = join_on_multiple_keys(
            left, right, on=["key_1", "key_2", "key_3"], how="left"
        ).fillna("null")

        expected_values = [
            [1.0, "a", "A", 9, 90, "R1"],
            [2.0, "null", "B", 8, 80, "R2"],
            [4.0, "d", "D", 6, "null", "R4"],
            [3.0, "c", "C", 7, "70", "R3"],
            [5.0, "e", "E", 5, 5.025, "R5"],
            [6.0, "null", "null", 4, "left", "null"],
            ["null", "null", "null", 3, 40, "null"],
            ["null", "null", "null", 2, 30, "null"],
        ]

        self.assertEqual(res_left.values.tolist(), expected_values)

        # Test right join
        res_right = join_on_multiple_keys(
            left, right, on=["key_1", "key_2", "key_3"], how="right"
        ).fillna("null")

        expected_values = [
            [1.0, "a", "A", 9.0, 90, "R1"],
            [2.0, "null", "B", 8.0, 80, "R2"],
            [4.0, "d", "D", 6.0, "null", "R4"],
            [3.0, "c", "C", 7.0, "70", "R3"],
            [5.0, "e", "E", 5.0, 5.025, "R5"],
            [7.0, "null", "null", "null", "null", "right"],
            ["null", "null", "null", "null", "null", "null"],
        ]

        self.assertEqual(res_right.values.tolist(), expected_values)

        # Test outer join
        res_outer = join_on_multiple_keys(
            left, right, on=["key_1", "key_2", "key_3"], how="outer"
        ).fillna("null")

        expected_values = [
            [1.0, "a", "A", 9.0, 90, "R1"],
            [2.0, "null", "B", 8.0, 80, "R2"],
            [4.0, "d", "D", 6.0, "null", "R4"],
            [3.0, "c", "C", 7.0, "70", "R3"],
            [5.0, "e", "E", 5.0, 5.025, "R5"],
            [6.0, "null", "null", 4.0, "left", "null"],
            ["null", "null", "null", 3.0, 40, "null"],
            ["null", "null", "null", 2.0, 30, "null"],
            [7.0, "null", "null", "null", "null", "right"],
            ["null", "null", "null", "null", "null", "null"],
        ]

        self.assertEqual(res_outer.values.tolist(), expected_values)
