import datetime
import json
import logging
from functools import partial
from time import sleep
from typing import Any, Iterable, List, Union

import numpy as np
import pandas as pd
import pytz
import sqlalchemy
from sqlalchemy import select


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


def first_valid_value(row: pd.Series):
    """Returns the value that is_a_value in the input pandas Series.

    Args:
        row (pd.Series): pandas Series

    Returns:
        : the first valid value in the Series
    """
    for x in row.values:
        if is_a_value(x):
            return x
    return None


def combine_overlapping_columns(df: pd.DataFrame, ordered_cols_list: List) -> pd.Series:
    """Combines several columns into one by taking the first_valid_value in each row,
    in the order of the ordered_cols_list.

    Returns a pandas Series with the combined results.

    Args:
        df (pd.DataFrame): input pandas DataFrame
        ordered_cols_list (List): list of column names

    Returns:
        pd.Series: Series containing the first valid value in each row of the DataFrame,
            taken in the ordered_cols_list columns.
    """
    non_null_rows = df[ordered_cols_list].dropna(how="all")
    res_non_null_rows = non_null_rows.apply(first_valid_value, axis=1)
    res = pd.Series(index=df.index, data=[None] * len(df))
    res[res_non_null_rows.index] = res_non_null_rows.values
    return res


def df_to_dict_series(
    df: pd.DataFrame, dropna_cols: Union[List, None], result_colname: str = "json_col"
):
    """Converts a pandas DataFrame into a Series with the same index as the input
    DataFrame and whose values are dictionnaries like :

        {'column_1' : value, 'column_2': value}

    Args:
        df (pd.DataFrame): input DataFrame
        dropna_cols (Union[List, None]): optionnal, list of columns for which rows
            containing Na values should be dropped
        result_colname (Union[str, None]): optionnal, name of result Series

    Returns:
        pd.Series: pandas Series
    """
    res = df.copy(deep=True)
    if dropna_cols:
        res = res.dropna(subset=dropna_cols)

    res = pd.read_json(res.to_json(orient="index"), orient="index", typ="Series")
    res.name = result_colname

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

    If the input is not a `list`, a `set` or a `numpy.ndarray`:
        - if `handle_errors` is False (default), raises a `ValueError`
        - if `handle_errors` is True, then `value_on_error` is returned

    This transformation is required on the elements of a DataFrame's columns that
    contain collections before bulk inserting the DataFrame into Postgresql with
    the psql_insert_copy method.

    Examples:
    >> to_pgarr([1, 2, "a ", "b", "", " "])
    "{1,2,'a','b'}"

    >> to_pgarr(None)
    ValueError

    >> to_pgarr(None, handle_errors=True, value_on_error="{}")
    "{}"

    >> to_pgarr(np.nan, handle_errors=True, value_on_error=None)

    Args:
        x (list, set or numpy.ndarray) : iterable to serialize as Postgres array
        handle_errors (bool): if True, returns value_on_error instead of raising
            ValueError when the input is of an unexpected type
        value_on_error (str or None): value to return on errors, if `handle_errors`
            is True

    Returns:
        str: string with Postgresql Array compatible syntax
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
    return json.dumps(x, ensure_ascii=False, default=json_converter)


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

    Example :

    >> df_to_psql_arrays(pd.DataFrame({'a': [[1, 2], ['a', 'b']]}))
    | a       |
    |---------|
    | {1,2,3} |
    | {a,b}   |

    Args:
        df (pd.DataFrame): pandas DataFrame

    Returns:
        pd.DataFrame: pandas DataFrame with the same shape and index, all values
            serialized as strings with Postgresql array syntax.
    """

    serialize = partial(
        to_pgarr, handle_errors=handle_errors, value_on_error=value_on_error
    )

    return df.applymap(serialize)


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

    return df_
