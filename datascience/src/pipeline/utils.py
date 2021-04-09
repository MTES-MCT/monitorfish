import csv
import logging
import os
import pathlib
import shutil
from io import StringIO
from itertools import zip_longest
from typing import Iterable, Union

import prefect
import sqlalchemy
from sqlalchemy import MetaData, Table, func, select
from sqlalchemy.exc import InvalidRequestError

# ***************************** Database operations utils *****************************


def get_table(
    table_name: str,
    schema: str,
    engine: sqlalchemy.engine.base.Engine,
    logger: logging.Logger,
) -> sqlalchemy.Table:
    """Performs reflection to get a sqlalchemy Table object with metadata reflecting
    the table found in the databse. Returns resulting Table object.

    If the table is not found in the database, raises an error.
    """

    meta = MetaData(schema=schema)
    meta.bind = engine
    try:
        logger.info(f"Searching for table {schema}.{table_name}...")
        meta.reflect(only=[table_name])
        table = Table(table_name, meta, mustexist=True)
        logger.info(f"Table {schema}.{table_name} found.")
    except InvalidRequestError:
        logger.error(
            f"Table {schema}.{table_name} must exist. Make appropriate migrations "
            + "and try again."
        )
        raise

    return table


def delete(
    table: sqlalchemy.Table,
    connection: sqlalchemy.engine.base.Connection,
    logger: logging.Logger,
):
    """Deletes all row from a table.
    Useful to wipe a table before re-inserting fresh data in ETL jobs."""
    count_statement = select([func.count()]).select_from(table)
    n = connection.execute(count_statement).fetchall()[0][0]
    if logger:
        logger.info(f"Found existing table {table.name} with {n} rows.")
        logger.info(f"Deleting table {table.name}...")
    connection.execute(table.delete())
    count_statement = select([func.count()]).select_from(table)
    n = connection.execute(count_statement).fetchall()[0][0]
    if logger:
        logger.info(f"Rows after deletion: {n}.")


def psql_insert_copy(table, conn, keys, data_iter):
    """
    Execute SQL statement inserting data

    Parameters
    ----------
    table : pandas.io.sql.SQLTable
    conn : sqlalchemy.engine.Engine or sqlalchemy.engine.Connection
    keys : list of str
        Column names
    data_iter : Iterable that iterates the values to be inserted
    """
    # gets a DBAPI connection that can provide a cursor
    dbapi_conn = conn.connection
    with dbapi_conn.cursor() as cur:
        s_buf = StringIO()
        writer = csv.writer(s_buf)
        writer.writerows(data_iter)
        s_buf.seek(0)

        columns = ", ".join('"{}"'.format(k) for k in keys)
        if table.schema:
            table_name = "{}.{}".format(table.schema, table.name)
        else:
            table_name = table.name

        sql = "COPY {} ({}) FROM STDIN WITH CSV".format(table_name, columns)
        cur.copy_expert(sql=sql, file=s_buf)


def grouper(iterable: Iterable, n: int, fillvalue: Union[None, str] = None) -> Iterable:
    """Collect data into fixed-length chunks or blocks"""
    args = [iter(iterable)] * n
    return zip_longest(*args, fillvalue=fillvalue)


def move(src_fp: pathlib.Path, dest_dirpath: pathlib.Path) -> None:
    """Moves a file to another directory. If the destination directory
    does not exist, it is created, as well as all intermediate directories."""
    if not dest_dirpath.exists():
        os.makedirs(dest_dirpath)
    shutil.move(src_fp.as_posix(), dest_dirpath.as_posix())
