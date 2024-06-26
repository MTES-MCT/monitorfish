import datetime
import logging
import re
from functools import partial
from io import StringIO
from typing import Any, Hashable, List, Union

import numpy as np
import pandas as pd
import pytz
import simplejson
import sqlalchemy
from sqlalchemy import select


def get_unused_col_name(col_name: str, df: pd.DataFrame) -> str:
    """
    If `col_name` is not already a column name of the DataFrame `df`, returns
    `col_name`. Otherwise, appends a number to `col_name`, trying 0, 1, 2, ...
    until a unused column name if found.

    Args:
        col_name (str): desired column name
        df (pd.DataFrame): DataFrame for which we want to ensure the column name is not
          already used

    Returns:
        str: column name

    Examples:
        >>> get_unused_col_name("id", pd.DataFrame({"idx": [1, 2, 3]}))
        "id"
        >>> get_unused_col_name("id", pd.DataFrame({"id": [1, 2, 3]}))
        "id_0"
        >>> get_unused_col_name("id", pd.DataFrame({"id": [1, 2, 3], "id_0": [4, 5, 6]}))
        "id_1"
    """
    df_columns = list(df)
    attempt_col_name = col_name
    while attempt_col_name in df_columns:
        if "i" not in locals():
            i = 0
        else:
            i += 1
        attempt_col_name = f"{col_name}_{i}"

    return attempt_col_name


def is_a_value(x) -> bool:
    """Returns False if pd.isna(x), True otherwise.

    NB : The same result could be obtained simply by checking pd.isna(x), but checking
    if x is None before checking pd.isna(x) improves performance on DataFrames
    containing many None values, since checking pd.isna(x) is slower than checking if x
    is None.

    Args:
        x : Anything

    Returns:
        bool: `False` if pd.isna(x), `True` otherwise
    """
    if x is not None and not pd.isna(x):
        return True
    else:
        return False


def concatenate_values(row: pd.Series) -> List:
    """
    Filters the input pandas Series to keep only distinct non null values and returns
    the result as a python ``list``.

    Args:
        row (pd.Series): pandas ``Series``

    Returns:
        List: list of distinct non null values in row
    """
    result_set = set()
    res = []
    for x in row:
        if is_a_value(x) and x not in result_set:
            res.append(x)
            result_set.add(x)
    return res


def concatenate_columns(df: pd.DataFrame, input_col_names: List) -> pd.Series:
    """
    For each row in the input DataFrame, the distinct and non null values contained in
    the columns input_col_names are stored in a list. A pandas Series of the same length
    as the input DataFrame is then constructed with these lists as values.

    Args:
        df (pd.DataFrame): input DataFrame
        input_col_names (List): the names of the columns to use

    Returns:
        pd.Series: resulting Series
    """
    non_null_rows = df[input_col_names].dropna(how="all")
    res_non_null_rows = non_null_rows.apply(concatenate_values, axis=1)
    res = pd.Series(index=df.index, data=[[]] * len(df))
    res[res_non_null_rows.index] = res_non_null_rows.values
    return res


def coalesce(df: pd.DataFrame) -> pd.Series:
    """
    Combines the input DataFrame's columns into one by taking the non null value in
    each row, in the order of the DataFrame's columns from left to right.

    Returns a pandas Series with the combined results.

    Args:
        df (pd.DataFrame): input pandas DataFrame

    Returns:
        pd.Series: Series containing the first non null value in each row of the
        DataFrame, taken in order of the DataFrame's columns from left to right.
    """
    non_null_rows = df.dropna(how="all")
    first_non_null_values_idx = np.argmax(non_null_rows.notnull().values, axis=1)

    res_values = np.choose(first_non_null_values_idx, non_null_rows.values.T)

    res = pd.Series(index=df.index, data=[None] * len(df), dtype=object)
    res[non_null_rows.index] = res_values
    return res


def get_first_non_null_column_name(
    df: pd.DataFrame, result_labels: Union[None, dict] = None
) -> pd.Series:
    """
    Returns a Series with the same index as the input DataFrame, whose values are
    the name of the first column (or the corresponding label, if provided) with a
    non-null value in each row, from left to right.

    Rows with all null values return None.

    Args:
        df (pd.DataFrame): input pandas DataFrame
        result_labels (dict): if provided, must be a mapping of column names to the
          corresponding labels in the result.

    Returns:
        pd.Series: Series containing the name of the first column with a non-null value
        in each row of the DataFrame, from left to right
    """

    non_null_rows = df.dropna(how="all")
    first_non_null_values_idx = np.argmax(non_null_rows.notnull().values, axis=1)

    res_values = np.choose(first_non_null_values_idx, list(df))

    res = pd.Series(index=df.index, data=[None] * len(df), dtype=object)
    res[non_null_rows.index] = res_values

    if result_labels is not None:
        res = res.map(lambda s: result_labels.get(s))

    return res


def remove_nones_from_dict(d: dict) -> dict:
    """
    Takes a dictionary and removes ``None`` values from it.

    Args:
        d (dict): a dictionary

    Returns:
        dict: the input dictionary, with all `None` removed.

    Examples:
        >>> d = {
            "a" : 1,
            "b": [1, 2, None],
            "c": {"key": "value", "key2": None},
            "d": None
            }
        >>> remove_nones_from_dict(d)
        {"a" : 1, "b": [1, 2, None], "c": {"key": "value", "key2": None}}
    """
    return {k: v for k, v in d.items() if v is not None}


def remove_nones_from_list(li: list) -> list:
    """
    Takes a list and removes ``None`` values from it.

    Args:
        li (list): a list

    Returns:
        list: the input list, with all `None` removed.

    Examples:
        >>> li = [1, 3, None, "a", "b", None]
        >>> remove_nones_from_dict(li)
        [1, 3, "a", "b"]
    """
    return [x for x in li if x is not None]


def df_to_dict_series(
    df: pd.DataFrame, result_colname: str = "json_col", remove_nulls: bool = False
):
    """
    Converts a pandas DataFrame into a Series with the same index as the input
    DataFrame and whose values are dictionaries like :

    .. code-block:: python

      {
          "column_1" : value,
          "column_2": value,
      }


    Args:
        df (pd.DataFrame): input DataFrame
        result_colname (Union[str, None]): optionnal, name of result Series
        remove_nulls (bool): if set to ``True``, ``null`` values are recursively
          removed from the dictionaries

    Returns:
        pd.Series: pandas Series
    """
    res = df.copy(deep=True)
    json_string = res.to_json(orient="index")

    res = pd.read_json(StringIO(json_string), orient="index", typ="Series")
    res.name = result_colname

    if remove_nulls:
        res = res.map(remove_nones_from_dict)

    return res


def zeros_ones_to_bools(
    x: Union[pd.Series, pd.DataFrame]
) -> Union[pd.Series, pd.DataFrame]:
    """
    Converts a pandas DataFrame or Series containing `str`, `int` or `float` values,
    possibly including null (`None` and `np.nan`) values to a DataFrame with False,
    True and `np.nan` values respectively.

    Values 1, 1.0, "1", any non zero number... is converted to `True`.
    Values 0, 0.0, "0" are converted to `False`.
    Values `None` and `np.nan` are converted to `np.nan`.

    Useful to convert boolean data extracted from Oracle databases, since Oracle does
    not have a boolean data type and boolean data is often stored as "0"s and "1"s,
    or to handle sitations in which pandas data structures should contain nullable
    boolean data (in pandas / numpy, the `bool` dtype is not nullable, and this can
    be tricky to handle).
    """
    tmp = x.astype(float)
    return tmp.where(~((tmp > 0) | (tmp < 0)), True).replace([0.0], False)


def to_pgarr(
    x: Union[list, set, np.ndarray],
    handle_errors: bool = False,
    value_on_error: Union[str, None] = None,
) -> Union[str, None]:
    """
    Converts a python `list`, `set` or `numpy.ndarray` to a string with Postgresql
    array syntax.

    Elements of the list-like input argument are converted to `string` type, then
    stripped of leading and trailing blank spaces, and finally filtered to keep only
    non empty strings.

    This transformation is required on the elements of a DataFrame's columns that
    contain collections before bulk inserting the DataFrame into Postgresql with
    the psql_insert_copy method.

    Args:
        x (list, set or numpy.ndarray) : iterable to serialize as Postgres array
        handle_errors (bool): if ``True``, returns ``value_on_error`` instead of raising
          ``ValueError`` when the input is of an unexpected type
        value_on_error (str or None): value to return on errors, if ``handle_errors``
          is ``True``

    Returns:
        str: string with Postgresql Array compatible syntax

    Raises:
        ValueError : when ``handle_errors`` is False and ``x`` is not list-like.

    Examples:
        >>> to_pgarr([1, 2, "a ", "b", "", " "])
        "{1,2,'a','b'}"
        >>> to_pgarr(None)
        ValueError
        >>> to_pgarr(None, handle_errors=True, value_on_error="{}")
        "{}"
        >>> to_pgarr(np.nan, handle_errors=True, value_on_error=None)
    """
    try:
        assert isinstance(x, (list, set, np.ndarray))

    except AssertionError:
        if handle_errors:
            return value_on_error
        else:
            raise ValueError(f"Unexpected type for x: {type(x)}.")

    return (
        "{" + ",".join(filter(lambda x: len(x) > 0, map(str.strip, map(str, x)))) + "}"
    )


def df_values_to_psql_arrays(
    df: pd.DataFrame,
    handle_errors: bool = False,
    value_on_error: Union[str, None] = None,
) -> pd.DataFrame:
    """
    Returns a `pandas.DataFrame` with all values serialized as strings
    with Postgresql array syntax. All values must be of type list, set or numpy array.
    Other values raise errors, which may be handled if handle_errors is set to True.

    See `to_pgarr` for details on error handling.

    This is required before bulk loading a pandas.DataFrame into a Postgresql table
    with the psql_insert_copy method.


    Args:
        df (pd.DataFrame): pandas DataFrame

    Returns:
        pd.DataFrame: pandas DataFrame with the same shape and index, all values
        serialized as strings with Postgresql array syntax.

    Examples :
        >>> df_to_psql_arrays(pd.DataFrame({'a': [[1, 2], ['a', 'b']]}))
            a
        0   {1,2,3}
        1   {a,b}
    """

    serialize = partial(
        to_pgarr, handle_errors=handle_errors, value_on_error=value_on_error
    )

    return df.map(serialize, na_action="ignore").fillna("{}")


def json_converter(x):
    """Converter for types not natively handled by json.dumps"""
    if isinstance(x, np.ndarray):
        return x.tolist()
    if isinstance(x, pd._libs.tslibs.nattype.NaTType):
        return None
    if isinstance(x, datetime.datetime):
        if x.tzinfo:
            x = x.replace(tzinfo=pytz.timezone("UTC")) - x.utcoffset()
            return x.isoformat().replace("+00:00", "Z")  # UTC, ISO format
        else:
            return x.isoformat() + "Z"
    elif isinstance(x, datetime.date):
        return x.isoformat()


def to_json(x: Any) -> str:
    """Converts python object to json string."""

    res = simplejson.dumps(
        x, ensure_ascii=False, default=json_converter, ignore_nan=True
    )

    return res


def df_values_to_json(df: pd.DataFrame) -> pd.DataFrame:
    """
    Returns a `pandas.DataFrame` with all values serialized to json string.

    This is required before bulk loading into a Postgresql table with
    the psql_insert_copy method.

    See `to_json` function for details.

    Args:
        df (pd.DataFrame): pandas DataFrame

    Returns:
        pd.DataFrame: pandas DataFrame with the same shape and index, all values
        serialized as json strings.
    """
    return df.map(to_json, na_action="ignore").fillna("null")


def serialize_nullable_integer_df(df: pd.DataFrame) -> pd.DataFrame:
    """Serializes the values of a DataFrame that contains numbers that represent
    possibly null (np.nan or None) integers. This is useful to prepare data before
    loading to integer Postgres columns, as pandas automatically converts integer
    Series to float dtype if they contain nulls.

    Args:
        df (pd.DataFrame): DataFrame of integer, possibly with None and np.nan values

    Returns:
        pd.DataFrame: same DataFrame converted to string dtype
    """
    return df.map(lambda x: str(int(x)), na_action="ignore").where(df.notnull(), None)


def serialize_timedelta_df(df: pd.DataFrame) -> pd.DataFrame:
    """Serializes the values of a DataFrame that contains `timedelta` values.
    This is useful to prepare data before loading to `interval` Postgres columns, as
    sqlachemy does not support the timedelta dtype.

    Args:
        df (pd.DataFrame): DataFrame of timedeltas

    Returns:
        pd.DataFrame: same DataFrame converted to string dtype
    """
    return df.astype("timedelta64[ns]").astype(str).replace(["NaT"], [None])


def drop_rows_already_in_table(
    df: pd.DataFrame,
    df_column_name: str,
    table: sqlalchemy.Table,
    table_column_name: str,
    connection: sqlalchemy.engine.base.Connection,
    logger: logging.Logger,
) -> pd.DataFrame:
    """Removes rows from the input DataFrame `df` in which the column `df_column_name`
    contains values that are already present in the column `table_column_name` of the
    table `table`, and returns the filtered DataFrame."""

    df_n_rows = len(df)
    df_ids = tuple(df[df_column_name].unique())
    df_n_ids = len(df_ids)

    statement = select(getattr(table.c, table_column_name)).where(
        getattr(table.c, table_column_name).in_(df_ids)
    )

    df_ids_already_in_table = tuple(
        pd.read_sql(statement, connection)[table_column_name]
    )

    # Remove keys already present in the database table from df
    res = df[~df[df_column_name].isin(df_ids_already_in_table)]

    # Remove possible duplicate ids in df
    res = res[~res[df_column_name].duplicated()]

    res_n_rows = len(res)
    res_n_ids = res[df_column_name].nunique()

    log = (
        f"From {df_n_rows} rows with {df_n_ids} distinct {df_column_name} values, "
        + f"{res_n_rows} rows with {res_n_ids} distinct {df_column_name} values "
        + "are new and will be inserted in the database."
    )

    logger.info(log)
    return res


def prepare_df_for_loading(
    df: pd.DataFrame,
    logger: logging.Logger,
    pg_array_columns: list = None,
    handle_array_conversion_errors: bool = True,
    value_on_array_conversion_error="{}",
    jsonb_columns: list = None,
    nullable_integer_columns: list = None,
    timedelta_columns: list = None,
    enum_columns: list = None,
    bytea_columns: list = None,
):
    df_ = df.copy(deep=True)

    # Serialize columns to be loaded into JSONB columns
    if jsonb_columns:
        logger.info("Serializing json columns")
        df_[jsonb_columns] = df_values_to_json(df_[jsonb_columns])

    # Serialize columns to be loaded into Postgres ARRAY columns
    if pg_array_columns:
        logger.info("Serializing postgresql array columns")
        df_[pg_array_columns] = df_values_to_psql_arrays(
            df_[pg_array_columns],
            handle_errors=handle_array_conversion_errors,
            value_on_error=value_on_array_conversion_error,
        )

    # Serialize columns that contain nullable integers (stored an float in python)
    if nullable_integer_columns:
        logger.info("Serializing nullable integer columns")
        df_[nullable_integer_columns] = serialize_nullable_integer_df(
            df_[nullable_integer_columns]
        )

    if timedelta_columns:
        logger.info("Serializing timedelta columns")
        df_[timedelta_columns] = serialize_timedelta_df(df_[timedelta_columns])

    if enum_columns:
        logger.info("Serializing enum columns")
        for enum_column in enum_columns:
            df_[enum_column] = df_[enum_column].map(lambda x: x.value if x else None)

    if bytea_columns:
        logger.info("Hexing bytea columns")
        for c in bytea_columns:
            df_[c] = df_[c].map(lambda x: r"\x" + x.hex())

    return df_


def join_on_multiple_keys(
    left: pd.DataFrame,
    right: pd.DataFrame,
    or_join_keys: list,
    how: str = "inner",
    and_join_keys: list = None,
    coalesce_common_columns: bool = True,
):
    """
    Join two pandas DataFrames, attempting to match rows on several keys by
    decreasing order of priority.

    Joins are performed successively with each of the keys listed in `or_join_keys`,
    and results are then concatenated to form the final result. This is different from
    joining on a composite key where all keys must match simultaneously : here, rows of
    left and right DataFrames are joined if at least one of the keys match.

    Joins are performed on the keys listed in `or_join_keys` by "decreasing order of
    priority" in the sense that, in order to be matched, rows of left and
    right MUST match on their highest priority non null key (which come first in the
    list) but MIGHT not match on lower priority keys (which come later in the list).

    During each of the joins on the individual keys, non-joining key pairs and, if any,
    columns common to both left and right DataFrames, are coalesced (from left to
    right) if `coalesce_common_columns` is `True` (the default).

    Optionally, the join condition can contain an additional equality clause on keys
    listed in `and_join_keys`.

    If `or_join_keys` is `['A', 'B']` and `and_join_keys` is `['C', 'D']`, the SQL
    equivalent of the join condition is :

    .. code-block:: SQL

      ON
          (
              left.A = right.A AND
              left.C = right.C AND
              left.D = right.D
          ) OR
          (
              (
                  left.A IS NULL OR
                  right.A IS NULL
              ) AND
              left.B = right.B AND
              left.C = right.C AND
              left.D = right.D
          )

    Args:
        left (pd.DataFrame): pandas DataFrame
        right (pd.DataFrame): pandas DataFrame
        or_join_keys (list): list of column names to use as join keys
        how (str, optional): 'inner', 'left', 'right' or 'outer'. Defaults to 'inner'.
        and_join_keys (list, optional): list of column names to use as additional join
          keys
        coalesce_common_columns (bool, optional): whether to coalesce values in the
          columns that are present in both DataFrames. Defaults to `True`.

    Returns:
        pd.DataFrame: result of join operation
    """

    joins = []
    left = left.copy(deep=True)
    right = right.copy(deep=True)
    common_columns = set.intersection(set(left.columns), set(right.columns))
    keys_already_joined = set()
    and_join_keys = [] if and_join_keys is None else and_join_keys
    left_cols = list(left)
    right_cols = list(right)

    # Number rows for future use
    if how in ("left", "outer"):
        left_id = get_unused_col_name("left_row_number", left)
        left[left_id] = range(len(left))

    if how in ("right", "outer"):
        right_id = get_unused_col_name("right_row_number", right)
        right[right_id] = range(len(right))

    # Attempt to perform the join successively on each key
    for or_join_key in or_join_keys:
        join_keys = and_join_keys + [or_join_key]

        right_with_keys = right.dropna(subset=join_keys)
        left_with_keys = left.dropna(subset=join_keys)

        join = pd.merge(
            left_with_keys,
            right_with_keys,
            on=join_keys,
            how="inner",
            suffixes=("_left", "_right"),
        )

        columns_to_merge = common_columns - set(join_keys)

        for column_to_merge in columns_to_merge:
            [l, r] = [f"{column_to_merge}_left", f"{column_to_merge}_right"]

            if column_to_merge in keys_already_joined:
                join = join[(join[r].isna()) | (join[l].isna())]

            if coalesce_common_columns:
                join[column_to_merge] = coalesce(join[[l, r]])
            else:
                join[column_to_merge] = join[l]

            join = join.drop(columns=[l, r])

        keys_already_joined.add(or_join_key)

        joins.append(join)

    # Concatenate all join results
    res = pd.concat(joins, axis=0)

    # Add unmatched rows if performing left, right or outer joins
    if how in ("left", "outer"):
        res = pd.concat([res, left.loc[~left[left_id].isin(res[left_id])]], axis=0)

    if how in ("right", "outer"):
        res = pd.concat([res, right.loc[~right[right_id].isin(res[right_id])]], axis=0)

    res.index = np.arange(0, len(res))

    columns_order = left_cols + [col for col in right_cols if col not in left_cols]
    res = res[columns_order]

    return res


def left_isin_right_by_decreasing_priority(
    left: pd.DataFrame, right: pd.DataFrame
) -> pd.Series:
    """
    Performs an operation similar to `pandas.DataFrame.isin` on multiple columns, with
    the differences that :

    - the columns are tested one by one (instead of being tested simultaneously as in
      the case of `pandas.DataFrame.isin`), the first column of `left` being tested
      against the first column of `right`, the second column of `left` being tested
      against the second column of `right`...
    - columns are considered to be sorted by decreasing priority, meaning that a match
      on 2 rows of `left` and `right` on a given column will be taken into account only
      if the columns of higher priority on those 2 rows have values that are either
      equal or null.

    Takes two DataFrames `left` and `right` with the same columns, returns a Series
    with the same index as the `left` DataFrame and whose values are :

    - `True` if the corresponding row in `left` has a match in `right` in at least one
      column
    - `False` if the corresponding row in `left` has no match in `right`

    This is typically useful to filter vessels' data based on some other vessels' data,
    both datasets being indexed with multiple identifiers (vessel_id, cfr, ircs,
    external immat...).

    Args:
        left (pd.DataFrame): DataFrame
        right (pd.DataFrame): DataFrame with values for which to test if they are
          present in `left`

    Returns:
        List[bool]: list of booleans with the same length as `left`
    """

    assert list(left) == list(right)

    left = left.copy(deep=True)
    right = right.copy(deep=True)
    cols = list(left)

    id_col = get_unused_col_name("id", left)
    left[id_col] = np.arange(len(left))

    isin_right_col = get_unused_col_name("isin_right", right)
    right[isin_right_col] = True

    res = join_on_multiple_keys(left, right, or_join_keys=cols, how="left")
    res = (
        res.drop_duplicates(subset=[id_col])
        .sort_values(id_col)[isin_right_col]
        .fillna(False)
    )
    res.index = left.index

    return res


def drop_duplicates_by_decreasing_priority(
    df: pd.DataFrame, subset: List[str]
) -> pd.DataFrame:
    """Similar to `pandas.DataFrame.drop_duplicates(subset=subset)`, with the
    differences that:

    - the rows are deduplicated based on their values in the columns in `subset` one
      after the other and by decreasing priority, and not simultaneously
    - `NA` values on a key are not considered

    Rows having all `NA` values in all columns of `subset` are dropped.

    What is meant by "by decreasing priority" is that keys in `subset` are considered
    to be sorted by decreasing level of priority (for instance `A` and `B`, with `A`
    having the highest level of priority), and rows with distinct values on `B` but
    identical values on `A` will be considered duplicated, whereas rows with distinct
    values on `A` and identical values on `B` will not be considered duplicates. Hence,
    the first key in `subset` entirely determines whether rows are duplicates or not on
    all rows with non null `A`, and subsequent keys in `subset` only come into play on
    rows where `A` is null.

    This is typically useful to deduplicate data containing one row per vessel with
    potential duplicates but with multiple identifier columns (cfr, external
    immatriculation, ircs), some identifiers being more reliable than others. For
    instance, if two rows have the same CFR but different external immatriculation, it
    is reasonable to assume that it is a one the same vessel, whereas two rows wihout
    any information on CFR and different external immats should be considered as two
    distinct vessels.

    Args:
        df (pd.DataFrame): Input DataFrame
        id_cols (List[str]): List of column names to use as keys for the
          `drop_duplicates` operation, by decreasing level of priority

    Returns:
        pd.DataFrame: Copy of the input DataFrame with duplicate rows removed.
    """
    try:
        assert isinstance(subset, list)
    except AssertionError:
        raise TypeError("`subset` must be a list.")

    try:
        assert len(subset) >= 1
    except AssertionError:
        raise TypeError("`subset` must not be empty.")

    if len(subset) == 1:
        res = df.dropna(subset=subset).drop_duplicates(subset=subset)

    else:
        first_key_not_null = df.dropna(subset=[subset[0]]).drop_duplicates(
            subset=[subset[0]]
        )

        first_key_null = drop_duplicates_by_decreasing_priority(
            df[df[subset[0]].isna()], subset=subset[1:]
        )

        first_key_null = first_key_null[
            ~left_isin_right_by_decreasing_priority(
                first_key_null[subset], first_key_not_null[subset]
            )
        ]

        res = pd.concat([first_key_not_null, first_key_null])

    return res


def try_get_factory(key: Hashable, error_value: Any = None):
    def try_get(d: Any) -> Any:
        """
        Attempt to fetch an element from what is supposed to be dict (but may not be),
        return error_value if it fails (for any reason).

        This is useful to extract values from a series of dictionnaries which may not all
        contain the searched key. It is faster than checking for the presence of the key
        each time.
        """

        try:
            return d[key]
        except:
            return error_value

    return try_get


def array_equals_row_on_window(
    arr: np.array, row: np.array, window_length: int
) -> np.array:
    """
    Tests whether each row of an input 2D array is the last of a sequence of
    `window_length` consecutive rows equal to a given `row` 1D array, and returns the
    result as a float array with the same length as the input array.

    The output array is of `float` dtype and not `bool` dtype, because numpy `bool`
    arrays cannot contain null values. The values are `0.0` (representing `False`),
    `1.0` (representing `True`) and `np.nan` representing nulls.

    The first (`window_length` - 1) rows evaluate to `np.nan`, since the sliding window
    would need to know the values of the previous rows which are not given.

    Args:
        arr (np.array): 2D numpy array
        row (np.array): 1D numpy array with the same length as the number of columns in
          `arr`
        window_length (int): number of consecutive rows that must be equal to `row` for
          the result to be `True`

    Returns:
        np.array: 1D boolean array of the same length as the input arrays


    Examples:
        >>> arr = np.array([
            [False, True],
            [False, True],
            [True, True],
            [False, True],
            [False, True],
        ])
        >>> row = np.array([False, True])
        >>> array_equals_row_on_window(arr, row, 2)
        array([nan,  1.,  0.,  0.,  1.])
    """

    n_rows, n_columns = arr.shape

    # When the sliding window has more rows that the input array, return all nulls
    if n_rows < window_length:
        res = np.array([np.nan] * n_rows)

    else:
        strides = np.lib.stride_tricks.sliding_window_view(
            arr, (window_length, n_columns)
        )

        res = (strides == row).all(axis=(1, 2, 3))

        number_na_rows_to_add = window_length - 1

        na_rows_to_add = np.array([np.nan] * number_na_rows_to_add)

        res = np.concatenate((na_rows_to_add, res))

    return res.astype(float)


def back_propagate_ones(arr: np.array, steps: int) -> np.array:
    """
    Given a 1D array with values `0.0`, `1.0` and `np.nan`, propagates `1.0` backward
    `steps` times.

    Args:
        arr (np.array): array containing `0.0`, `1.0` and `np.nan` values
        steps (int): number of steps that ones should be back-propagated

    returns:
        np.array: 1D array with the same dimensions as input, with ones back-propagated
        `steps` times.

    Examples:
        >>> arr = np.array([np.nan,  0.,  0.,  1.,  0.,  0.,  1.,  1.,  0.,  1.])
        >>> back_propagate_ones(arr, 1)
        array([nan,  0.,  1.,  1.,  0.,  1.,  1.,  1.,  1.,  1.])
    """
    if steps == 0:
        return arr
    else:
        previous_step = back_propagate_ones(np.append(arr[1:], np.nan), steps - 1)
        tmp = np.concatenate((arr[:, None], previous_step[:, None]), axis=1)

        ones = np.equal(tmp, 1).any(axis=1)
        nans = np.isnan(tmp).any(axis=1)
        res = np.where((nans & (~ones)), np.nan, ones)
        return res


def rows_belong_to_sequence(
    arr: np.array, row: np.array, window_length: int
) -> np.array:
    """
    Tests whether each row of an input 2D array belongs to a sequence of
    `window_length` consecutive rows equal to a given `row` 1D array, and returns the
    result as a float array with the same length as the input array.

    The output array is of `float` dtype and not `bool` dtype, because numpy `bool`
    arrays cannot contain null values. The values are `0.0` (representing `False`),
    `1.0` (representing `True`) and `np.nan` representing nulls.

    The first and last (`window_length` - 1) rows may be `np.nan`, since the rows
    before the beginning and after the end of the array are not known and might be
    needed to determine the result.

    Args:
        arr (np.array): 2D numpy array
        row (np.array): 1D numpy array with the same length as the number of columns in
          `arr`
        window_length (int): number of consecutive rows that must be equal to `row` for
            the result to be `True`

    Returns:
        np.array: 1D boolean array of the same length as the input arrays

    Examples:
        >>> arr = np.array([
            [False, True],
            [False, True],
            [True, True],
            [False, True],
            [False, True],
        ])
        >>> row = np.array([False, True])
        >>> rows_belong_to_sequence(arr, row, 2)
        array([1., 1., 0., 1., 1.])

        >>> arr = np.array([
            [False, True],
            [True, True],
            [True, True],
            [False, True],
            [False, True],
            [False, False]
        ])
        >>> row = np.array([False, True])
        >>> rows_belong_to_sequence(arr, row, 2)
        array([nan,  0.,  0.,  1.,  1., 0.])
    """
    ends_of_sequences = array_equals_row_on_window(
        arr,
        row,
        window_length=window_length,
    )

    rows_known = back_propagate_ones(ends_of_sequences, steps=window_length - 1)

    # To test if rows at the beginning and at the end of the array could possibly
    # belong to a sequence `row` exceeding the boundaries of the array, we add rows to
    # the array and test again
    extended_arr = np.concatenate(
        (
            row * np.ones((window_length - 1, len(row))),
            arr,
            row * np.ones((window_length - 1, len(row))),
        )
    )

    ends_of_sequences_extended = array_equals_row_on_window(
        extended_arr,
        row,
        window_length=window_length,
    )

    rows_maybe = back_propagate_ones(
        ends_of_sequences_extended, steps=window_length - 1
    )[window_length - 1 : -(window_length - 1)]

    res = np.where(np.isnan(rows_known) & rows_maybe.astype(bool), np.nan, rows_maybe)

    return res


def get_matched_groups(string: str, regex: re.Pattern) -> pd.Series:
    """
    Matches the input `str` with the input `Pattern` and returns a pandas `Series`
    with the matched data.

    The index labels of the result `Series` are the group names `(?<group_name>...)`
    of the pattern.

    The values of the result `Series` are:

      - the match's group values, if the string matches the pattern
      - `None`, if the string does not matches the pattern

    Args:
        string (str): string to match
        regex (re.Pattern): pattern against which to match the string

    Returns:
        pd.Series: the match's group data
    """

    assert isinstance(regex, re.Pattern)
    if isinstance(string, str):
        m = regex.match(string)
    else:
        m = None

    if m:
        result = pd.Series(m.groupdict())
    else:
        result = pd.Series({i: None for i in regex.groupindex})
    return result
