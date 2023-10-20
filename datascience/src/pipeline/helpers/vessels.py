from logging import Logger

import numpy as np
import pandas as pd
from sqlalchemy import Table, select
from sqlalchemy.sql import Select

from src.pipeline.processing import get_unused_col_name, join_on_multiple_keys


def make_add_vessels_columns_query(
    vessel_ids: list,
    vessels_table: Table,
    vessels_columns_to_add: list = None,
    districts_table: Table = None,
    districts_columns_to_add: list = None,
) -> Select:
    """
    Creates a `sqlalchemy.select` statement representing a query to fetch the
    designated columns from the `vessels` and / or `districts` tables for the
    indicated `vessel_ids`.

    Args:
        vessel_ids (list): List of vessels `id` to fetch data for.
        vessels_table (Table): vessels table.
        vessels_columns_to_add (list, optional): List of columns to get from the
          `vessels` table. Defaults to None.
        districts_table (Table, optional): districts table. Must be supplied if
          `districts_columns_to_get` is given. Defaults to None.
        districts_columns_to_add (list, optional): List of columns to get from the
          `districts` table. Defaults to None.

    Returns:
        Select: select statement to execute to get the indicated data.
    """

    from_table = vessels_table

    if districts_columns_to_add:
        assert isinstance(districts_table, Table)
        from_table = from_table.join(
            districts_table,
            from_table.c.district_code == districts_table.c.district_code,
            isouter=True,
        )

    columns = [vessels_table.c.id.label("vessel_id")]

    if vessels_columns_to_add:
        columns += [vessels_table.c.get(col) for col in vessels_columns_to_add]

    if districts_columns_to_add:
        columns += [districts_table.c.get(col) for col in districts_columns_to_add]

    q = (
        select(*columns)
        .select_from(from_table)
        .where(vessels_table.c.id.in_(vessel_ids))
    )

    return q


def make_find_vessels_query(
    vessels: pd.DataFrame,
    vessels_table: Table,
) -> Select:
    """
    Creates a `sqlalchemy.select` object representing a query to find `vessels` in
    the `vessels` table that match any of the lines in the input `DataFrame` on any of
    `cfr`, `ircs` or `external_immatriculation`.

    Args:
        vessels (pd.DataFrame): `DataFrame`. Must have columns `cfr`, `ircs` and
          `external_immatriculation`. If any other columns are present they are
          ignored.
        vessels_table (Table): `sqlalchemy.Table` object representing the `vessels`
          table. Must have columns `cfr`, `ircs` and `external_immatriculation`. If any
          other columns are present they are ignored.

    Returns:
        Select: query object with columns `vessel_id`, `cfr`, `ircs` and
          `external_immatriculation`.
    """
    assert "cfr" in vessels
    assert "ircs" in vessels
    assert "external_immatriculation" in vessels

    q = select(
        vessels_table.c.id.label("vessel_id"),
        vessels_table.c.cfr,
        vessels_table.c.ircs,
        vessels_table.c.external_immatriculation,
    ).where(
        vessels_table.c.cfr.in_(vessels.cfr.dropna().drop_duplicates().to_list())
        | vessels_table.c.external_immatriculation.in_(
            vessels.external_immatriculation.dropna().drop_duplicates().to_list()
        )
        | vessels_table.c.ircs.in_(vessels.ircs.dropna().drop_duplicates().to_list())
    )

    return q


def merge_vessel_id(
    vessels: pd.DataFrame, found_vessels: pd.DataFrame, logger: Logger
) -> pd.DataFrame:
    """
    The two input DataFrames are assumed to be:

      - a list of vessels with `cfr`, `ircs` and `external_immatriculation` identifiers
        (plus potential other columns) without a `vessel_id` column
      - a list of vessels with `cfr`, `ircs` and `external_immatriculation` and
        `vessel_id` columns (and no other columns). Typically these are the vessels
        that are found in the `vessels` table that match one of the identifiers of the
        `vessels` DataFrame by the `make_find_vessels_query` query.

    The idea is to add the `vessel_id` from the second DataFrame as a new column in the
    first DataFrame, by matching the right lines in both DataFrame.

    This is done by perfoming a left join of the input DataFrames using
    join_on_multiple_keys on ["cfr", "ircs", "external_immatriculation"].

    Additionnally, the returned `vessel_id` for each line in the first DataFrame is
    `None` if the following conditions are not met :

      - there is no ambiguity: only one vessel in the second DataFrame can be matched
        to a given line in the first DataFrame
      - there is no conflict: at most one vessel in the first DataFrame can be matched
        to a given line in the second DataFrame

    Lines in the second DataFrame that do not match a line in the first DataFrame are
    absent from the result.

    Lines in the first DataFrame that do not match a line in the second DataFrame are
    present in the result with a `vessel_id` of `None`.

    The result always has exactly the same lines as the first input DataFrame.

    Args:
        vessels (pd.DataFrame): Vessels to match to a found_vessel
        found_vessels (pd.DataFrame): found_vessels to match to a vessel
        logger (Logger): Logger instance

    Returns:
        pd.DataFrame: Same as vessels with an added `vessel_id` column.
    """
    initial_length = len(vessels)
    vessels = vessels.copy(deep=True)

    # Number rows of input DataFrame
    input_id = get_unused_col_name("input_row_number", vessels)
    vessels[input_id] = range(len(vessels))

    # Join
    vessels = join_on_multiple_keys(
        vessels,
        found_vessels,
        or_join_keys=["cfr", "ircs", "external_immatriculation"],
        how="left",
        coalesce_common_columns=False,
    )

    vessels["is_ambiguous"] = vessels.duplicated(subset=input_id, keep=False)
    vessels["is_in_conflict"] = vessels.duplicated(subset="vessel_id", keep=False)

    if vessels.is_ambiguous.any():
        ambiguous_vessels = vessels.loc[
            vessels.is_ambiguous,
            [input_id, "cfr", "ircs", "external_immatriculation", "vessel_id"],
        ].sort_values(input_id)

        warning_message = (
            "The following identifiers are ambiguous as they could correspond to "
            "more than one vessel:\n" + str(ambiguous_vessels.to_markdown(index=False))
        )

        logger.warning(warning_message)

    if vessels.is_in_conflict.any():
        vessels_in_conflict = vessels.loc[
            vessels.is_in_conflict,
            [input_id, "cfr", "ircs", "external_immatriculation", "vessel_id"],
        ].sort_values("vessel_id")

        warning_message = (
            "The following identifiers conflict with one another - "
            "more than one match the same vessel:\n"
            + str(vessels_in_conflict.to_markdown(index=False))
        )

        logger.warning(warning_message)

    vessels = vessels.drop_duplicates(subset=input_id)

    assert len(vessels) == initial_length

    vessels["vessel_id"] = vessels.vessel_id.where(
        ~(vessels[["is_ambiguous", "is_in_conflict"]].any(axis=1)), np.nan
    )

    return (
        vessels.sort_values(input_id)
        .drop(columns=[input_id, "is_ambiguous", "is_in_conflict"])
        .reset_index(drop=True)
    )
