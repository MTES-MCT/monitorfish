import logging
from pathlib import Path
from typing import List, Union

import geopandas as gpd
import pandas as pd
from prefect import task
from sqlalchemy import DDL
from sqlalchemy.engine import Connection
from sqlalchemy.sql import Select

from src.db_config import create_engine
from src.pipeline import utils
from src.pipeline.processing import prepare_df_for_loading
from src.pipeline.utils import get_table, psql_insert_copy
from src.read_query import read_query, read_saved_query


def extract(
    db_name: str,
    query_filepath: Path | str,
    dtypes: dict = None,
    parse_dates: list | dict = None,
    params: dict = None,
    backend: str = "pandas",
    geom_col: str = "geom",
    crs: int = None,
) -> Union[pd.DataFrame, gpd.GeoDataFrame]:
    """Run SQL query against the indicated database and return the result as a
    `pandas.DataFrame`.

    Args:
        db_name (str): name of the database to extract from. Possible values :
          - 'fmc'
          - 'ocan'
          - 'monitorfish_local'
          - 'monitorfish_remote'
          - 'monitorenv_remove'
          - 'cacem_local'
          - 'data_warehouse'

        query_filepath (Union[Path, str]): path to .sql file, starting from the saved
          queries folder. example : "ocan/nav_fr_peche.sql"
        dtypes (Union[None, dict], optional): If specified, use {col: dtype, …}, where
          col is a column label and dtype is a numpy.dtype or Python type to cast
          one or more of the DataFrame’s columns to column-specific types.
          Defaults to None.
        parse_dates (Union[list, dict, None], optional):

          - List of column names to parse as dates.
          - Dict of ``{column_name: format string}`` where format string is
            strftime compatible in case of parsing string times or is one of
            (D, s, ns, ms, us) in case of parsing integer timestamps.
          - Dict of ``{column_name: arg dict}``, where the arg dict corresponds
            to the keyword arguments of :func:`pandas.to_datetime`

          Defaults to None.
        params (Union[dict, None], optional): Parameters to pass to execute method.
            Defaults to None.
        backend (str, optional) : 'pandas' to run a SQL query and return a
            `pandas.DataFrame` or 'geopandas' to run a PostGIS query and return a
            `geopandas.GeoDataFrame`. Defaults to 'pandas'.
        geom_col (str, optional): column name to convert to shapely geometries when
            `backend` is 'geopandas'. Ignored when `backend` is 'pandas'. Defaults to
            'geom'.
        crs (str, optional) : CRS to use for the returned GeoDataFrame;
            if not set, tries to determine CRS from the SRID associated with the first
            geometry in the database, and assigns that to all geometries. Ignored when
            `backend` is 'pandas'. Defaults to None.

    Returns:
        Union[pd.DataFrame, gpd.GeoDataFrame]: Query results
    """

    res = read_saved_query(
        query_filepath,
        db=db_name,
        parse_dates=parse_dates,
        params=params,
        backend=backend,
        geom_col=geom_col,
        crs=crs,
    )

    if dtypes:
        res = res.astype(dtypes)

    return res


def load(
    df: Union[pd.DataFrame, gpd.GeoDataFrame],
    *,
    table_name: str,
    schema: str,
    logger: logging.Logger,
    how: str = "replace",
    replace_with_truncate: bool = False,
    db_name: str = None,
    pg_array_columns: list = None,
    handle_array_conversion_errors: bool = True,
    value_on_array_conversion_error: str = "{}",
    jsonb_columns: list = None,
    table_id_column: str = None,
    df_id_column: str = None,
    nullable_integer_columns: list = None,
    timedelta_columns: list = None,
    enum_columns: list = None,
    connection: Connection = None,
    init_ddls: List[DDL] = None,
    end_ddls: List[DDL] = None,
    bytea_columns: list = None,
):
    r"""
    Load a DataFrame or GeoDataFrame to a database table using sqlalchemy. The table
    must already exist in the database.

    Args:
        df (Union[pd.DataFrame, gpd.GeoDataFrame]): data to load
        table_name (str): name of the table
        schema (str): database schema of the table
        logger (logging.Logger): logger instance
        how (str): one of

          - 'replace' to truncate the table before loading
          - 'append' to append the data to rows already in the table
          - 'upsert' to append the rows to the table, replacing the rows whose id is
            already present in the table
        replace_with_truncate (bool): if `how` is `replace`, and
          `replace_with_truncate` is `True`, the table to replace will be truncated
          before loading the new data. If `how` is `replace`, and
          `replace_with_truncate` is `False` (the default), the table to replace will
          be deleted before loading the new data. If `how` is anything but `replace`,
          `replace_with_truncate` is ignored.
          TRUNCATE is more efficient than DELETE as the whole file holding table data
          is dropped, rather than deleting rows one by one as DELETE does.
          It also results in reallocating new pages and therefore results in table data
          without any bloat (dead or free space in data pages). However, TRUNCATE
          requires an ACCESS EXCLUSIVE lock on the table, which may conflict with other
          database operations, notably `pg_dump` and `ALTER TABLE` commands, and result
          in a deadlock and therefore downtime of the entire system during database
          backup or migration. Use only if you know what you're doing.
        db_name (str, optional): Required if a `connection` is not provided.
          'monitorfish_remote', 'monitorenv_remote' or 'monitorfish_local'.
          Defaults to None.
        pg_array_columns (list, optional): columns containing sequences that must be
          serialized before loading into columns with Postgresql `Array` type
        handle_array_conversion_errors (bool): whether to handle or raise upon error
          during the serialization of columns to load into Postgresql `Array` columns.
          Defaults to True.
        value_on_array_conversion_error (str, optional): if
          `handle_array_conversion_errors`, the value to use when an error must be
          handled. Defaults to '{}'.
        jsonb_columns (list, optional): columns containing values that must be
          serialized before loading into columns with Postgresql `JSONB` type
        table_id_column (str, optional): name of the table column to use an id.
          Required if `how` is "upsert".
        df_id_column (str, optional): name of the DataFrame column to use an id.
          Required if `how` is "upsert".
        nullable_integer_columns (list, optional): columns containing values
          that must loaded into columns with Postgresql `Integer` type. If these
          columns contain `NA` values, pandas will automatically change the dtype to
          `float` and the loading into Postgreql `Integer` columns will fail, so it is
          necessary to serialize these values as `Integer`-compatible `str` objects.
        timedelta_columns (list, optional): columns containing `Timedelta` values to
          load into Postgresql `Interval` columns. If these columns contain `NaT`
          values, the loading will fail, so it is necessary to serialize these values
          as `Interval`-compatible `str` objects.
        enum_columns (list, optional): columns containing Enum values to
          load into Postgresql. Values in these columns will be converted to string
          using the enum's `.value`. Null values will remain null.
        connection (Connection, optional): Databse connection to use for the insert
          operation. If not provided, `db_name` must be given and a connection to the
          designated database will be created for the insert operation.
          Defaults to None.
        init_ddls: (List[DDL], optional): If given, these DDLs will be executed before
          the loading operation. Defaults to None.
        end_ddls: (List[DDL], optional): If given, these DDLs will be executed after
          the loading operation. Defaults to None.
        bytea_columns (list, optional): columns containing bytes that must be
          serialized before loading into columns with Postgresql `BYTEA` type.
          Serialization is done following Postgresql `Hex` format, which consists in
          representing each byte by two hexadecimal digits and prefixing the whole hex
          string by '\x'.
          For example, for a two-byte sequence (01011001, 11000001) :

            - the hex representation of each byte is computed :

                - '59' for 01011001
                - 'c1' for 11000001

            - the Postgresql hex string will be '\x59c1'
    """

    df = prepare_df_for_loading(
        df,
        logger,
        pg_array_columns=pg_array_columns,
        handle_array_conversion_errors=handle_array_conversion_errors,
        value_on_array_conversion_error=value_on_array_conversion_error,
        jsonb_columns=jsonb_columns,
        nullable_integer_columns=nullable_integer_columns,
        timedelta_columns=timedelta_columns,
        enum_columns=enum_columns,
        bytea_columns=bytea_columns,
    )

    if connection is None:
        e = create_engine(db_name)
        with e.begin() as connection:
            load_with_connection(
                df=df,
                connection=connection,
                table_name=table_name,
                schema=schema,
                logger=logger,
                how=how,
                replace_with_truncate=replace_with_truncate,
                table_id_column=table_id_column,
                df_id_column=df_id_column,
                init_ddls=init_ddls,
                end_ddls=end_ddls,
            )
    else:
        load_with_connection(
            df=df,
            connection=connection,
            table_name=table_name,
            schema=schema,
            logger=logger,
            how=how,
            replace_with_truncate=replace_with_truncate,
            table_id_column=table_id_column,
            df_id_column=df_id_column,
            init_ddls=init_ddls,
            end_ddls=end_ddls,
        )


def load_with_connection(
    df: Union[pd.DataFrame, gpd.GeoDataFrame],
    *,
    connection: Connection,
    table_name: str,
    schema: str,
    logger: logging.Logger,
    how: str = "replace",
    replace_with_truncate: bool = False,
    table_id_column: str = None,
    df_id_column: str = None,
    init_ddls: List[DDL] = None,
    end_ddls: List[DDL] = None,
):
    if init_ddls:
        for ddl in init_ddls:
            connection.execute(ddl)

    table = get_table(table_name, schema, connection, logger)
    if how == "replace":
        # Delete table
        utils.delete([table], connection, logger, truncate=replace_with_truncate)

    elif how == "upsert":
        # Delete rows that are in the DataFrame from the table

        try:
            assert df_id_column is not None
        except AssertionError:
            raise ValueError("df_id_column cannot be null if how='upsert'")
        try:
            assert table_id_column is not None
        except AssertionError:
            raise ValueError("table_id_column cannot be null if how='upsert'")

        ids_to_delete = set(df[df_id_column].unique())

        utils.delete_rows(
            table=table,
            id_column=table_id_column,
            ids_to_delete=ids_to_delete,
            connection=connection,
            logger=logger,
        )

    elif how == "append":
        # Nothing to do
        pass

    else:
        raise ValueError(f"how must be 'replace', 'upsert' or 'append', got {how}")

    # Insert data into table
    logger.info(
        f"Loading {len(df)} row{'s' if len(df) > 1 else ''} into {schema}.{table_name}"
    )

    if isinstance(df, gpd.GeoDataFrame):
        logger.info("GeodateFrame detected, using to_postgis")
        df.to_postgis(
            name=table_name,
            con=connection,
            schema=schema,
            index=False,
            if_exists="append",
        )

    elif isinstance(df, pd.DataFrame):
        df.to_sql(
            name=table_name,
            con=connection,
            schema=schema,
            index=False,
            method=psql_insert_copy,
            if_exists="append",
        )

    else:
        raise ValueError("df must be DataFrame or GeoDataFrame.")

    if end_ddls:
        for ddl in end_ddls:
            connection.execute(ddl)


def delete_rows(
    *,
    table_name: str,
    schema: str,
    db_name: str,
    table_id_column: str,
    ids_to_delete: set,
    logger: logging.Logger,
):
    """
    Delete rows from a database table.

    Args:
        table_name (str): name of the table
        schema (str): database schema of the table
        db_name (str): name of the database. One of
          - 'monitorfish_remote'
          - 'monitorfish_local'
        table_id_column (str): name of the id column in the database.
        ids_to_delete (set): the ids of the rows to delete.
        logger (logging.Logger): logger instance.
    """

    e = create_engine(db_name)
    table = get_table(table_name, schema, e, logger)

    with e.begin() as connection:
        n_rows = len(ids_to_delete)
        if n_rows == 0:
            logger.info("No rows to delete, skipping.")

        else:
            utils.delete_rows(
                table=table,
                id_column=table_id_column,
                ids_to_delete=ids_to_delete,
                connection=connection,
                logger=logger,
            )


@task(checkpoint=False)
def read_query_task(database: str, query: Select) -> pd.DataFrame:
    """
    Prefect `task` decorated version of `read_query`.
    """

    return read_query(query, db=database)
