import csv
import logging
from io import StringIO
from typing import List, Tuple

import pandas as pd
import sqlalchemy
from sqlalchemy import MetaData, Table, inspect
from sqlalchemy.exc import InvalidRequestError

from src.db_config import create_engine
from src.read_query import read_query


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
    meta.reflect(only=[table_name])
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


def get_tables_sizes(db: str, table_names: List[str]) -> pd.DataFrame:
    """Returns a pandas DataFrame with the size of each table in tables_names, in Mb.

    db : 'ocan', 'fmc'
    view_name : the name of the view to inspect.
    """

    query = f"""SELECT segment_name AS table_name, (bytes/1024/1024) AS size_Mb
    FROM dba_segments
    WHERE segment_name IN {tuple(table_names)}
    """

    table_sizes = read_query(db=db, query=query)
    return table_sizes


def print_view_query_string(db: str, view_name: str):
    """View the SQL query string that was used to create an existing view in an Oracle
    database.

        db : 'ocan', 'fmc'
        view_name : the name of the view to inspect.
    """
    query = f"""SELECT TEXT
    FROM SYS.ALL_VIEWS
    WHERE view_name = '{view_name}'"""

    view_query = read_query(db=db, query=query)

    print(view_query.text.values[0])


def find_table_schema(db: str, table_name: str):
    """Looks for a table named table_name in all schemas of
    the designated database and return the name of the schema
    in which the table is found.

    If the table is not found, returns None.

    Possible values for db : 'ocan', 'monitorfish_remote',
                             'fmc', 'monitorfish_local'
    """
    e = create_engine(db)
    insp = inspect(e)

    for schema in insp.get_schema_names():
        for table in insp.get_table_names(schema=schema):
            if table == table_name:
                return schema

    return None


def print_schemas_tables(db: str, schemas=None):
    """Prints all schemas and associated tables in a database.
    Optionnal argument 'schemas' takes a list of schemas to restrict the scan.

    Possible values for db :
        'ocan', 'monitorfish_remote', 'fmc', 'monitorfish_local'
    """
    e = create_engine(db)
    insp = inspect(e)

    for schema in insp.get_schema_names():
        if schemas is None or schema in schemas:
            print(f"------------------------\n***{schema}***")
            for table in insp.get_table_names(schema=schema):
                print(table)


def delete_if_exists_then_create_table(
    db: str, table_name: str, schema: str = "public", *cols
):
    e = create_engine(db)
    meta = MetaData()
    meta.bind = e
    meta.reflect()

    if table_name in meta.tables:
        vessels_table = meta.tables[table_name]
        vessels_table.drop()

    table = Table(table_name, meta, *cols, schema=schema)
    table.create(e)


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
