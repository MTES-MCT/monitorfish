import datetime
import logging
from functools import partial
from time import sleep
from typing import Any, Hashable, Iterable, List, Union

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

    NB : The same result could be obtained simply by checking pd.isna(x),
    but checking if x is None before checking pd.isna(x)
    improves performance on DataFrames containing many None values,
    since checking pd.isna(x) is slower than checking if x is None.

    Args:
        x : Anything

    Returns:
        bool: False if pd.isna(x), True otherwise
    """
    if x is not None and not pd.isna(x):
        return True
    else:
        return False


def concatenate_values(row: pd.Series) -> List:
    """Filters the input pandas Series to keep only distinct non null values
    and returns the result as a python list.

    Args:
        row (pd.Series): pandas Series

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
    """For each row in the input DataFrame, the distinct and non null values contained in
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
    """Combines the input DataFrame's columns into one by taking the non null value in
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

    res = pd.Series(index=df.index, data=[None] * len(df))
    res[non_null_rows.index] = res_values
    return res


def get_first_non_null_column_name(
    df: pd.DataFrame, result_labels: Union[None, dict] = None
) -> pd.Series:
    """Returns a Series with the same index as the input DataFrame, whose values are
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

    res = pd.Series(index=df.index, data=[None] * len(df))
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
        dict: the input dictionary, with all ``None``s removed.

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


def df_to_dict_series(
    df: pd.DataFrame, result_colname: str = "json_col", remove_nulls: bool = False
):
    """Converts a pandas DataFrame into a Series with the same index as the input
    DataFrame and whose values are dictionaries like :

        {'column_1' : value, 'column_2': value}

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

    res = pd.read_json(json_string, orient="index", typ="Series")
    res.name = result_colname

    if remove_nulls:
        res = res.map(remove_nones_from_dict)

    return res


def zeros_ones_to_bools(df: pd.DataFrame) -> pd.DataFrame:
    """Converts a pandas DataFrame containing "0", "1" and None values
    to a DataFrame with False, True and None values respectively.

    Useful to convert boolean data extracted from Oracle databases, since Oracle does
    not have a boolean data type and boolean data is often stored as "0"s and "1"s.
    """
    # /!\ Simply converting to float and then to bool results in None values being
    # converted into True
    # The conversion to 'category' makes it possible to preserve None values.
    return df.astype(float).astype("category").astype(bool)


def to_pgarr(
    x: Union[list, set, np.ndarray],
    handle_errors: bool = False,
    value_on_error: Union[str, None] = None,
) -> Union[str, None]:
    """Converts a python `list`, `set` or `numpy.ndarray` to a string with Postgresql
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
    """Returns a `pandas.DataFrame` with all values serialized as strings
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

    return df.applymap(serialize, na_action="ignore").fillna("{}")


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
    """Returns a `pandas.DataFrame` with all values serialized to json string.

    This is required before bulk loading into a Postgresql table with
    the psql_insert_copy method.

    See `to_json` function for details.

    Args:
        df (pd.DataFrame): pandas DataFrame

    Returns:
        pd.DataFrame: pandas DataFrame with the same shape and index, all values
            serialized as json strings.
    """
    return df.applymap(to_json, na_action="ignore").fillna("null")


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
    return df.applymap(lambda x: str(int(x)), na_action="ignore").where(
        df.notnull(), None
    )


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

    statement = select([getattr(table.c, table_column_name)]).where(
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
    pg_array_columns: Union[None, list] = None,
    handle_array_conversion_errors: bool = True,
    value_on_array_conversion_error="{}",
    jsonb_columns: Union[None, list] = None,
    nullable_integer_columns: Union[None, list] = None,
    timedelta_columns: Union[None, list] = None,
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

    return df_


def join_on_multiple_keys(
    left: pd.DataFrame, right: pd.DataFrame, on: list, how: str = "inner"
):
    """Join two pandas DataFrames, attempting to match rows on several keys by
    decreasing order of priority.

    Joins are performed successively with each of the keys listed in `on`, and results
    are then concatenated to form the final result. This is different from joining on a
    composite key where all keys must match simultaneously : here, rows of left and
    right DataFrames are joined if at least one of the keys match.

    Joins are performed on the keys listed in `on` by "decreasing order or priority" in
    the sense that rows of left and right that have been matched on one key are removed
    from ulterior joins perfomed on the next keys.

    During each of the joins on the individual keys, non-joining key pairs from left and
    right DataFrames are coalesced.

    Args:
        left (pd.DataFrame): pandas DataFrame
        right (pd.DataFrame): pandas DataFrame
        on (list): list of column names to use as join keys
        how (str): 'inner', 'left', 'right' or 'outer'. Defaults to 'inner'.

    Returns:
        pd.DataFrame: result of join operation
    """

    joins = []
    keys_already_joined = set()

    # Attempt to perform the join successively on each key
    for key in on:

        right_with_key = right.dropna(subset=[key])
        left_with_key = left.dropna(subset=[key])

        join = pd.merge(
            left_with_key,
            right_with_key,
            on=key,
            how="inner",
            suffixes=("_left", "_right"),
        )

        non_joining_keys = set(on) - {key}

        for non_joining_key in non_joining_keys:

            cols_to_coalesce = [f"{non_joining_key}_left", f"{non_joining_key}_right"]
            [l, r] = cols_to_coalesce

            if non_joining_key in keys_already_joined:
                join = join[(join[r].isna()) | (join[l].isna())]

            join[non_joining_key] = coalesce(join[cols_to_coalesce])

            join = join.drop(columns=cols_to_coalesce)

        left = left[~left[key].isin(join[key])]
        right = right[~right[key].isin(join[key])]

        keys_already_joined.add(key)
        joins.append(join)

    # Add unmatched rows if performing left, right or outer joins
    if how in ("left", "outer"):
        joins.append(left)

    if how in ("right", "outer"):
        joins.append(right)

    # Concatenate all join results
    res = pd.concat(joins, axis=0)
    res.index = np.arange(0, len(res))

    columns_order = list(left) + [col for col in list(right) if col not in on]
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
    if the columns of higher priority on those 2 rows have values that are either equal
    or null.

    Takes two DataFrames `left` and `right` with the same columns, returns a Series
    with the same index as the `left` DataFrame and whose values are :

    - `True` if the corresponding row in `left` has a match in `right' in at least one
    column
    - `False` if the corresponding row in `left` has no match in `right'

    This is typically useful to filter vessels' data based on some other vessels' data,
    both datasets being index with multiple identifiers (cfr, ircs, external immat...).

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

    res = join_on_multiple_keys(left, right, on=cols, how="left")
    res = (
        res.drop_duplicates(subset=[id_col])
        .sort_values(id_col)[isin_right_col]
        .fillna(False)
    )
    res.index = left.index

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
