import pandas as pd
import prefect
from prefect import task
from sqlalchemy import Table

from src.pipeline.helpers.vessels import (
    make_add_vessels_columns_query,
    make_find_vessels_query,
    merge_vessel_id,
)
from src.read_query import read_query


@task(checkpoint=False)
def add_vessel_id(vessels: pd.DataFrame, vessels_table: Table) -> pd.DataFrame:
    """
    Adds a `vessel_id` column to the input `DataFrame` by:

      - querying all vessels in the `vessels` table that have a matching `cfr`, `ircs`
        or `external_immatriculation`
      - matching the found vessels to the input vessels using the `merge_vessel_id`
        helper.

    Args:
        vessels (pd.DataFrame): DataFrame of vessels. Must have columns `cfr`, `ircs`
        and `external_immatriculation`
        vessels_table (Table): sqlalchemy `Table` of vessels.

    Returns:
        pd.DataFrame: Same as input with an added `vessel_id` column.
    """
    logger = prefect.context.get("logger")

    if "vessel_id" in vessels:
        logger.warn(
            (
                "Column `vessel_id` already present in input DataFrame, "
                "returning unmodified input."
            )
        )
        return vessels

    query = make_find_vessels_query(vessels, vessels_table)
    found_vessels = read_query(query, db="monitorfish_remote")

    vessels_with_id = merge_vessel_id(vessels, found_vessels, logger)

    return vessels_with_id


@task(checkpoint=False)
def add_vessels_columns(
    vessels: pd.DataFrame,
    vessels_table: Table,
    vessels_columns_to_add: list = None,
    districts_table: Table = None,
    districts_columns_to_add: list = None,
) -> pd.DataFrame:
    """
    Adds the indicated columns to the input `vessels` DataFrame.

    Args:
        vessels (pd.DataFrame): DataFrame of vessels. Must have `vessel_id` column.
        vessels_table (Table): vessels table.
        vessels_columns_to_get (list, optional): List of columns from the `vessels`
          table to add. Defaults to None.
        districts_table (Table, optional): district table. Must ne supplied if
          `districts_columns_to_get` is given. Defaults to None.
        districts_columns_to_get (list, optional): List of columns from the `districts`
          table to add. Defaults to None.

    Returns:
        pd.DataFrame: Input DataFrame with added columns.
    """

    vessel_ids = vessels.vessel_id.unique().tolist()

    query = make_add_vessels_columns_query(
        vessel_ids=vessel_ids,
        vessels_table=vessels_table,
        vessels_columns_to_add=vessels_columns_to_add,
        districts_table=districts_table,
        districts_columns_to_add=districts_columns_to_add,
    )

    vessels_added_columns = read_query(query, db="monitorfish_remote")

    vessels = pd.merge(vessels, vessels_added_columns, on="vessel_id", how="left")

    return vessels
