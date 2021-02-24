import json
from typing import List

import pandas as pd


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


def lst2pgarr(alist: List) -> str:
    """Converts a python list [1, 2, "a", "b"] to a string with Postgresql array
    syntax {1,2,a,b}.
    This transformation is required on DataFrame columns that contain python lists
    before bulk inserting the DataFrame into Postgresql with the psql_insert_copy
    method.

    Elements in the list are converted to string type, then stripped of leading and
    trailing blank spaces, and finally filtered to keep only non empty strings.

    Args:
        alist (List): python list

    Returns:
        str: string with Postgresql Array compatible syntax
    """
    res = (
        "{"
        + ",".join(filter(lambda x: len(x) > 0, map(str.strip, map(str, alist))))
        + "}"
    )
    return res


def dict2json(d):
    """Converts python dictionnary to json string. This is required when inserting
    a pandas DataFrame column containing dictionnaries into a Postgresql JSONB column.
    """
    return json.dumps(d, ensure_ascii=False)


def python_lists_to_psql_arrays(df: pd.DataFrame, array_cols: List) -> pd.DataFrame:
    """Transforms columns that contain python lists
    into columns that contain strings with Postgresql array syntax
    This is required before bulk loading into a Postgresql table with
    the psql_insert_copy method.

    Takes a DataFrame df and a list of column names array_cols which
    need to be tranformed.

    Returns a DataFrame with array_cols transformed and all other columns
    unchanged.

    Args:
        df (pd.DataFrame): pandas DataFrame
        array_cols (List): list of column names to transform

    Returns:
        pd.DataFrame: [description]
    """
    res = df.copy(deep=True)
    res[array_cols] = res[array_cols].applymap(lst2pgarr)
    return res
