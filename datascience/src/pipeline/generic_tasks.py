import logging
from pathlib import Path
from typing import Union

import pandas as pd
import prefect
from prefect import task

from src.db_config import create_engine
from src.pipeline.processing import (
    df_values_to_psql_arrays,
    prepare_df_for_loading,
    to_json,
)
from src.pipeline.utils import delete, get_table, psql_insert_copy
from src.read_query import read_saved_query


def extract(
    db_name: str, query_filepath: Union[Path, str], dtypes: Union[None, dict] = None
) -> pd.DataFrame:

    res = read_saved_query(db_name, query_filepath)

    if dtypes:
        for c, t in dtypes.items():
            res[c] = res[c].astype(t)

    return res


def load(
    df: pd.DataFrame,
    table_name: str,
    schema: str,
    db_name: str,
    logger: Union[None, logging.Logger],
    delete_before_insert: bool = False,
    pg_array_columns: Union[None, list] = None,
    handle_array_conversion_errors: bool = True,
    value_on_array_conversion_error="{}",
    jsonb_columns: Union[None, list] = None,
):

    df_ = prepare_df_for_loading(
        df,
        logger,
        pg_array_columns=pg_array_columns,
        handle_array_conversion_errors=handle_array_conversion_errors,
        value_on_array_conversion_error=value_on_array_conversion_error,
        jsonb_columns=jsonb_columns,
    )

    e = create_engine(db_name)
    table = get_table(table_name, schema, e, logger)

    with e.begin() as connection:

        if delete_before_insert:
            # Delete all rows from table
            delete(table, connection, logger)

        # Insert data into table
        logger.info(f"Loading into {schema}.{table_name}")
        df_.to_sql(
            name=table_name,
            con=connection,
            schema=schema,
            index=False,
            method=psql_insert_copy,
            if_exists="append",
        )
