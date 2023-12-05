import datetime
import logging
import re
from enum import Enum
from unittest.mock import Mock, patch

import numpy as np
import pandas as pd
import pytest
import pytz
from sqlalchemy import Column, Integer, MetaData, Table

from forklift.pipeline.processing import (
    array_equals_row_on_window,
    back_propagate_ones,
    coalesce,
    concatenate_columns,
    concatenate_values,
    df_to_dict_series,
    df_values_to_json,
    df_values_to_psql_arrays,
    drop_duplicates_by_decreasing_priority,
    drop_rows_already_in_table,
    get_matched_groups,
    get_unused_col_name,
    is_a_value,
    join_on_multiple_keys,
    left_isin_right_by_decreasing_priority,
    prepare_df_for_loading,
    remove_nones_from_list,
    rows_belong_to_sequence,
    to_json,
    to_pgarr,
    zeros_ones_to_bools,
)


def test_get_unused_col_name():
    assert get_unused_col_name("id", pd.DataFrame({"id": [1, 2, 3]})) == "id_0"
    assert (
        get_unused_col_name("id", pd.DataFrame({"id": [1, 2, 3], "id_0": [1, 2, 3]}))
        == "id_1"
    )
    assert get_unused_col_name("id", pd.DataFrame({"idx": [1, 2, 3]})) == "id"


def test_is_a_value():
    assert is_a_value(1)
    assert is_a_value("")
    assert is_a_value("a")
    assert not is_a_value(None)
    assert not is_a_value(np.nan)


def test_remove_nones_from_list():
    assert remove_nones_from_list([1, 2, 3, None, 4]) == [1, 2, 3, 4]
    assert remove_nones_from_list([1, 2, 3, 4]) == [1, 2, 3, 4]
    assert remove_nones_from_list([1, None, None, None, 4]) == [1, 4]
    assert remove_nones_from_list([None, None, None]) == []
    assert remove_nones_from_list([]) == []
    assert remove_nones_from_list([1, None, np.nan, None, 4]) == [1, np.nan, 4]


def test_concatenate_values():
    row = pd.Series(["a", "a", 1, 2, None, "abc", 3, 2, None])
    assert concatenate_values(row) == ["a", 1, 2, "abc", 3]


def test_concatenate_columns():
    test_df_1 = pd.DataFrame(
        {"a": [1, "a", 2], "b": ["a", "b", None], "c": ["a", "c", 2]}
    )

    test_df_2 = pd.DataFrame(
        {"a": [None, None, None], "b": [None, None, None], "c": [None, None, None]}
    )

    res1 = concatenate_columns(test_df_1, ["a"])
    assert res1[0] == [1]
    assert res1[1] == ["a"]
    assert res1[2] == [2]

    res2 = concatenate_columns(test_df_1, ["a", "b", "c"])
    assert res2[0] == [1, "a"]
    assert res2[1] == ["a", "b", "c"]
    assert res2[2] == [2]

    res3 = concatenate_columns(test_df_2, ["a", "c"])
    assert res3[0] == []
    assert res3[1] == []
    assert res3[2] == []


def test_combine_overlapping_columns():
    df = pd.DataFrame(
        {
            "a": [1, 2, 3, None, np.nan, None, np.nan],
            "b": [None, None, "a", "b", None, None, np.nan],
            "c": ["c", None, None, "c", "c", None, np.nan],
            "d": ["d", "d", "d", "d", "d", None, np.nan],
        }
    )

    res = coalesce(df[["b", "c", "a"]])
    assert res.values[0] == "c"
    assert res.values[1] == 2
    assert res.values[2] == "a"
    assert res.values[3] == "b"
    assert res.values[4] == "c"
    assert res.values[5] is None
    assert res.values[6] is None


def test_df_to_dict_series():
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

    assert isinstance(res, pd.Series)
    assert res.name == "my_column_name"
    assert (res.index == [0, 1, 4, 123, 3]).all()
    assert res.values.tolist() == expected_values


def test_zeros_ones_to_bools():
    # Test with DataFrame
    df = pd.DataFrame(
        {
            "ints_0_1": [0, 1, 0, 1, 1],
            "ints_0_1_2": [0, 1, 0, 2, 1],
            "floats_0_1": [0.0, 1.0, 0.0, 1.0, 1.0],
            "floats_0_1_2": [0.0, 1.0, 0.0, 2.0, 1.0],
            "str_0_1": ["0", "1", "0", "1", "1"],
            "str_0_1_2": ["0", "1", "0", "2", "1"],
            "ints_0_1_nan": [0, 1, np.nan, 1, None],
            "ints_0_1_2_nan": [0, 1, np.nan, 2, None],
            "str_0_1_nan": ["0", "1", np.nan, "1", None],
            "str_0_1_2_nan": ["0", "1", np.nan, "2", None],
            "all_nan": [np.nan, np.nan, np.nan, np.nan, np.nan],
            "all_none": [None, None, None, None, None],
        }
    )

    res = zeros_ones_to_bools(df)
    expected_res = pd.DataFrame(
        {
            "ints_0_1": [False, True, False, True, True],
            "ints_0_1_2": [False, True, False, True, True],
            "floats_0_1": [False, True, False, True, True],
            "floats_0_1_2": [False, True, False, True, True],
            "str_0_1": [False, True, False, True, True],
            "str_0_1_2": [False, True, False, True, True],
            "ints_0_1_nan": [False, True, np.nan, True, np.nan],
            "ints_0_1_2_nan": [False, True, np.nan, True, np.nan],
            "str_0_1_nan": [False, True, np.nan, True, np.nan],
            "str_0_1_2_nan": [False, True, np.nan, True, np.nan],
            "all_nan": [np.nan, np.nan, np.nan, np.nan, np.nan],
            "all_none": [np.nan, np.nan, np.nan, np.nan, np.nan],
        }
    )

    pd.testing.assert_frame_equal(res, expected_res)

    # Test with Series
    s = pd.Series([0, 0.0, "0", "0.0", None, np.nan, 1, 1.0, 23.1, -2.3, "1", "12.1"])
    res = zeros_ones_to_bools(s)
    expected_res = pd.Series(
        [
            False,
            False,
            False,
            False,
            np.nan,
            np.nan,
            True,
            True,
            True,
            True,
            True,
            True,
        ]
    )

    pd.testing.assert_series_equal(res, expected_res)


def test_to_pgarr():
    a = [1, 2, 3]
    b = ["a", "b", "c"]
    c = [1, "a", None]
    d = []
    e = None

    res_a = to_pgarr(a)
    res_b = to_pgarr(b)
    res_c = to_pgarr(c)
    res_d = to_pgarr(d)
    with pytest.raises(ValueError):
        to_pgarr(e)

    res_e = to_pgarr(e, handle_errors=True)

    assert res_a == "{1,2,3}"
    assert res_b == "{a,b,c}"
    assert res_c == "{1,a,None}"
    assert res_d == "{}"
    assert res_e is None


def test_to_json():
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

    assert res_a == "[1, 2, 3]"
    assert res_b == '{"a": 1, "b": 2}'
    assert res_c == "null"
    assert res_d == "null"
    assert res_e == '{"a": 1, "2": "b"}'
    assert res_f == '{"a": {"b": [1, null, null], "c": 4}, "b": 2}'
    assert res_e == '{"a": 1, "2": "b"}'
    assert res_f == '{"a": {"b": [1, null, null], "c": 4}, "b": 2}'
    assert res_g == "[1, 2, 3]"
    assert res_h == "[[1, 2, 3], [4, 5, 6]]"
    assert res_i == '"2020-03-11T20:05:12Z"'
    assert res_j == '"2020-03-11T20:05:12Z"'
    assert res_k == '"2020-03-12T01:05:12Z"'
    assert res_m == '"2020-12-05"'
    assert res_n == (
        '{"a": {"int": 1, "None": null, "np.nan": null, "pandas NaT": null, '
        '"numpy array": [1, 2, 3], "date": "2020-12-05", '
        '"datetime": "2020-03-11T20:05:12Z", '
        '"datetime_tz_est": "2020-03-12T01:05:12Z"}}'
    )


def test_df_values_to_json():
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
    assert isinstance(res, pd.DataFrame)
    assert res.shape == (3, 5)
    assert list(res) == ["a", "b", "c", "d", "e"]
    assert res.values.tolist() == expected_values


def test_df_values_to_psql_arrays():
    df = pd.DataFrame(
        {
            "a": [1, 2, 3, 4],
            "b": [[1, 2], ["a", "b"], [1, 3], ["a", "a"]],
            "c": ["This string shouldn't be here", np.nan, ["", 5, " "], None],
        }
    )

    with pytest.raises(ValueError):
        df_values_to_psql_arrays(df[["b", "c"]])
    res = df_values_to_psql_arrays(
        df[["b", "c"]], handle_errors=True, value_on_error="caught"
    )

    assert list(res) == ["b", "c"]

    expected_values = [
        ["{1,2}", "caught"],
        ["{a,b}", "{}"],
        ["{1,3}", "{5}"],
        ["{a,a}", "{}"],
    ]

    assert res.values.tolist() == expected_values


@patch("forklift.pipeline.processing.pd")
def test_drop_rows_already_in_table(mock_pandas):
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

    assert isinstance(res, pd.DataFrame)
    assert res.shape == (2, 4)
    assert res.values.tolist() == expected_values


def test_prepare_df_for_loading():
    class MyEnum(Enum):
        A = "AAA"
        B = "BBB"

    df = pd.DataFrame(
        columns=pd.Index(
            [
                "id",
                "column_1",
                "pg_array_1",
                "pg_array_2",
                "json_1",
                "json_2",
                "int",
                "timedelta",
                "timedelta_only_nulls",
                "enum_col",
            ]
        ),
        data=[
            [
                1,
                "some value",
                [1, 2, 3],
                ["a", "b", "c"],
                {"a": 1, "b": 2},
                {"a": 1, "b": None},
                2.0,
                datetime.timedelta(days=1, seconds=21),
                None,
                MyEnum.A,
            ],
            [
                2,
                "some other value",
                [1, 2, 5],
                [1, 5, 7],
                {"a": 1, "b": None, "c": np.nan},
                {"a": 1, "b": [datetime.datetime(2021, 1, 23, 12, 56, 7), np.nan]},
                np.nan,
                None,
                None,
                None,
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
        nullable_integer_columns=["int"],
        timedelta_columns=["timedelta", "timedelta_only_nulls"],
        enum_columns=["enum_col"],
    )

    expected_res = pd.DataFrame(
        columns=pd.Index(
            [
                "id",
                "column_1",
                "pg_array_1",
                "pg_array_2",
                "json_1",
                "json_2",
                "int",
                "timedelta",
                "timedelta_only_nulls",
                "enum_col",
            ]
        ),
        data=[
            [
                1,
                "some value",
                "{1,2,3}",
                "{a,b,c}",
                '{"a": 1, "b": 2}',
                '{"a": 1, "b": null}',
                "2",
                "1 days 00:00:21",
                None,
                "AAA",
            ],
            [
                2,
                "some other value",
                "{1,2,5}",
                "{1,5,7}",
                '{"a": 1, "b": null, "c": null}',
                '{"a": 1, "b": ["2021-01-23T12:56:07Z", null]}',
                None,
                None,
                None,
                None,
            ],
        ],
    )

    pd.testing.assert_frame_equal(res, expected_res)


def test_join_on_multiple_keys():
    left = pd.DataFrame(
        {
            "key_1": [1, 2, None, 4, None, 6, None, np.nan, "conflict"],
            "key_2": ["a", None, "c", "d", "e", None, None, np.nan, None],
            "key_3": ["A", "B", np.nan, "D", "E", None, None, np.nan, "H"],
            "value_left_1": [9, 8, 7, 6, 5, 4, 3, 2, 42],
            "value_left_2": [90, 80, "70", None, 5.025, "left", 40, 30, 48],
        }
    )

    right = pd.DataFrame(
        {
            "key_1": [1, 2, 3, 4, 5, 7, np.nan, "conflicting"],
            "key_2": ["a", None, "c", "ddd", np.nan, None, np.nan, None],
            "key_3": ["A", "B", "C", "DDD", "E", None, np.nan, "H"],
            "value_right": ["R1", "R2", "R3", "R4", "R5", "right", np.nan, "ABC"],
        }
    )

    # Test inner join
    res_inner = join_on_multiple_keys(
        left, right, or_join_keys=["key_1", "key_2", "key_3"], how="inner"
    ).fillna("null")

    expected_values = [
        [1.0, "a", "A", 9, 90, "R1"],
        [2.0, "null", "B", 8, 80, "R2"],
        [4.0, "d", "D", 6, "null", "R4"],
        [3.0, "c", "C", 7, "70", "R3"],
        [5.0, "e", "E", 5, 5.025, "R5"],
    ]

    assert res_inner.values.tolist() == expected_values

    # Test left join
    res_left = join_on_multiple_keys(
        left, right, or_join_keys=["key_1", "key_2", "key_3"], how="left"
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
        ["conflict", "null", "H", 42, 48, "null"],
    ]

    assert res_left.values.tolist() == expected_values

    # Test right join
    res_right = join_on_multiple_keys(
        left, right, or_join_keys=["key_1", "key_2", "key_3"], how="right"
    ).fillna("null")

    expected_values = [
        [1.0, "a", "A", 9.0, 90, "R1"],
        [2.0, "null", "B", 8.0, 80, "R2"],
        [4.0, "d", "D", 6.0, "null", "R4"],
        [3.0, "c", "C", 7.0, "70", "R3"],
        [5.0, "e", "E", 5.0, 5.025, "R5"],
        [7.0, "null", "null", "null", "null", "right"],
        ["null", "null", "null", "null", "null", "null"],
        ["conflicting", "null", "H", "null", "null", "ABC"],
    ]

    assert res_right.values.tolist() == expected_values

    # Test outer join
    res_outer = join_on_multiple_keys(
        left, right, or_join_keys=["key_1", "key_2", "key_3"], how="outer"
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
        ["conflict", "null", "H", 42, 48, "null"],
        [7.0, "null", "null", "null", "null", "right"],
        ["null", "null", "null", "null", "null", "null"],
        ["conflicting", "null", "H", "null", "null", "ABC"],
    ]

    assert res_outer.values.tolist() == expected_values

    # Test join with and_join_keys
    res_and_join_keys = join_on_multiple_keys(
        left,
        right,
        or_join_keys=["key_1", "key_2"],
        and_join_keys=["key_3"],
        how="inner",
    )

    expected_res_and_join_keys = pd.DataFrame(
        {
            "key_1": [1, 2],
            "key_2": ["a", None],
            "key_3": ["A", "B"],
            "value_left_1": [9, 8],
            "value_left_2": [90, 80],
            "value_right": ["R1", "R2"],
        }
    )

    pd.testing.assert_frame_equal(
        res_and_join_keys, expected_res_and_join_keys, check_dtype=False
    )

    # Test join with coalesce_common_columns=False
    res_no_coalesce_common_columns = join_on_multiple_keys(
        left,
        right,
        or_join_keys=["key_1", "key_2"],
        coalesce_common_columns=False,
        how="inner",
    )

    expected_res_no_coalesce_common_columns = pd.DataFrame(
        {
            "key_1": [1, 2, 4, None],
            "key_2": ["a", None, "d", "c"],
            "key_3": ["A", "B", "D", None],
            "value_left_1": [9, 8, 6, 7],
            "value_left_2": [90, 80, None, "70"],
            "value_right": ["R1", "R2", "R4", "R3"],
        }
    )

    pd.testing.assert_frame_equal(
        res_no_coalesce_common_columns.convert_dtypes(),
        expected_res_no_coalesce_common_columns.convert_dtypes(),
    )


def test_left_isin_right_by_decreasing_priority():
    left = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D", None, None, None, "H"],
            "external_immatriculation": [
                "AA",
                None,
                None,
                "DD",
                "EE",
                None,
                None,
                "HH",
            ],
            "ircs": ["AAA", None, "CCC", None, None, "FFF", None, "HHH"],
        },
        index=pd.Index([1, 2, 5, 12, 4, 23, 11, 120]),
    )

    right = pd.DataFrame(
        {
            "cfr": [
                "A",
                "A",
                None,
                "B",
                "C",
                "D",
                "E",
                None,
                "no conflict F",
                None,
                "conflict H",
            ],
            "external_immatriculation": [
                "AA",
                "AA",
                "AA",
                "BB",
                None,
                "DD",
                "EE",
                "EE",
                None,
                None,
                "HH",
            ],
            "ircs": [
                "AAA",
                "AAA",
                "AAA",
                None,
                "no conflic CCC",
                None,
                None,
                None,
                "FFF",
                None,
                "HHH",
            ],
        }
    )

    res = left_isin_right_by_decreasing_priority(left, right)

    expected = pd.Series(
        index=left.index,
        data=[True, True, True, True, True, True, False, False],
        name="isin_right",
    )

    pd.testing.assert_series_equal(res, expected)


def test_drop_duplicates_by_decreasing_priority():
    df = pd.DataFrame(
        {
            "A": [1, 2, 3, None, 1, 2, 3, 4, None, 22, None, None, None],
            "B": [1, 2, 3, None, 1, 22, 3, 4, None, 2, None, None, 6],
            "C": [1, 2, 3, 4, 1, 2, 33, 4, None, 2, 2, 5, 6],
            "D": ["W", "h", "a", "t", "e", "v", "e", "r", "d", "a", "t", "a", "a"],
        },
        index=[1, 2, 4, 14, 4, 32, 41, 2, 9, 13, 31, 4, 7],
    )

    res = drop_duplicates_by_decreasing_priority(df, subset=["A", "B", "C"])

    expected_res = df.iloc[[0, 1, 2, 7, 9, 12, 11]]

    pd.testing.assert_frame_equal(res, expected_res)

    with pytest.raises(TypeError):
        drop_duplicates_by_decreasing_priority(df, {"not", "a", "list"})

    with pytest.raises(TypeError):
        empty_list = []
        drop_duplicates_by_decreasing_priority(df, empty_list)


def test_array_equals_row_on_window():
    arr = np.array(
        [
            [True, True, True],
            [True, True, False],
            [True, True, False],
            [True, True, True],
            [True, True, False],
            [True, False, False],
        ]
    )

    row = np.array([True, True, False])

    res = array_equals_row_on_window(arr, row, window_length=1)
    expected_res = np.array([0.0, 1.0, 1.0, 0.0, 1.0, 0.0])
    np.testing.assert_array_equal(res, expected_res)

    res = array_equals_row_on_window(arr, row, window_length=2)
    expected_res = np.array([np.nan, 0.0, 1.0, 0.0, 0.0, 0.0])
    np.testing.assert_array_equal(res, expected_res)

    res = array_equals_row_on_window(arr, row, window_length=3)
    expected_res = np.array([np.nan, np.nan, 0.0, 0.0, 0.0, 0.0])
    np.testing.assert_array_equal(res, expected_res)

    res = array_equals_row_on_window(arr, row, window_length=7)
    expected_res = np.array([np.nan, np.nan, np.nan, np.nan, np.nan, np.nan])
    np.testing.assert_array_equal(res, expected_res)


def test_back_propagate_ones():
    arr = np.array([0.0, np.nan, 1.0, 0.0, np.nan, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0])

    # Test steps=0
    np.testing.assert_array_equal(arr, back_propagate_ones(arr, 0))

    # Test steps=1
    res = back_propagate_ones(arr, 1)
    expected_res = np.array(
        [np.nan, 1.0, 1.0, np.nan, np.nan, 1.0, 1.0, 1.0, 1.0, 0.0, np.nan]
    )
    np.testing.assert_array_equal(res, expected_res)

    # Test steps=2
    res = back_propagate_ones(arr, 2)
    expected_res = np.array(
        [1.0, 1.0, 1.0, np.nan, 1.0, 1.0, 1.0, 1.0, 1.0, np.nan, np.nan]
    )
    np.testing.assert_array_equal(res, expected_res)


def test_rows_belong_to_sequence():
    row = np.array([False, True])

    arr = np.array(
        [
            [False, True],
            [False, True],
            [True, True],
            [False, True],
            [False, True],
        ]
    )
    res = rows_belong_to_sequence(arr, row, 2)
    expected_res = np.array([1.0, 1.0, 0.0, 1.0, 1.0])
    np.testing.assert_array_equal(res, expected_res)

    arr = np.array(
        [
            [False, True],
            [True, True],
            [True, True],
            [False, True],
            [False, True],
        ]
    )
    res = rows_belong_to_sequence(arr, row, 2)
    expected_res = np.array([np.nan, 0.0, 0.0, 1.0, 1.0])
    np.testing.assert_array_equal(res, expected_res)

    arr = np.array(
        [
            [True, True],
            [True, True],
            [True, True],
            [False, True],
            [False, True],
            [False, False],
        ]
    )
    res = rows_belong_to_sequence(arr, row, 2)
    expected_res = np.array([0.0, 0.0, 0.0, 1.0, 1.0, 0.0])
    np.testing.assert_array_equal(res, expected_res)

    res = rows_belong_to_sequence(arr, row, 7)
    expected_res = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
    np.testing.assert_array_equal(res, expected_res)

    row = np.array([True, True])
    res = rows_belong_to_sequence(arr, row, 7)
    expected_res = np.array([np.nan, np.nan, np.nan, 0.0, 0.0, 0.0])
    np.testing.assert_array_equal(res, expected_res)


def test_get_matched_groups():
    regex = re.compile(
        (
            r"^This is a ((?P<optionnal_word_1>[a-z]*) )?"
            r"(?P<word_2>[a-z]*) (?P<word_3>[a-z]*)\.$"
        )
    )

    s_1 = "This is a test string."
    series_1 = get_matched_groups(s_1, regex)
    expected_series_1 = pd.Series(
        {
            "optionnal_word_1": None,
            "word_2": "test",
            "word_3": "string",
        }
    )
    pd.testing.assert_series_equal(series_1, expected_series_1)

    s_2 = "This is a new test string."
    series_2 = get_matched_groups(s_2, regex)
    expected_series_2 = pd.Series(
        {
            "optionnal_word_1": "new",
            "word_2": "test",
            "word_3": "string",
        }
    )
    pd.testing.assert_series_equal(series_2, expected_series_2)

    s_3 = "This is a non-matching test string."
    series_3 = get_matched_groups(s_3, regex)
    default_series = pd.Series(
        {
            "optionnal_word_1": None,
            "word_2": None,
            "word_3": None,
        }
    )
    pd.testing.assert_series_equal(series_3, default_series)

    s_4 = None
    series_4 = get_matched_groups(s_4, regex)
    pd.testing.assert_series_equal(series_4, default_series)
