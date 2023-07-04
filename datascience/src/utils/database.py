import os
from typing import List, Union

import pandas as pd
from sqlalchemy import inspect

from src.db_config import create_engine, make_connection_string
from src.read_query import read_query


def get_tables_sizes(db: str, table_names: List[str]) -> pd.DataFrame:
    """
    Returns a pandas DataFrame with the size of each table in tables_names, in Mb.

    Aegs:
        db : 'ocan', 'fmc'
        view_name : the name of the view to inspect.
    """

    query = f"""SELECT segment_name AS table_name, (bytes/1024/1024) AS size_Mb
    FROM dba_segments
    WHERE segment_name IN {tuple(table_names)}
    """

    table_sizes = read_query(query, db=db)
    return table_sizes


def print_view_query_string(db: str, view_name: str):
    """
    View the SQL query string that was used to create an existing view in an Oracle
    database.

    Args:
      db : 'ocan', 'fmc'
      view_name : the name of the view to inspect.
    """
    query = f"""SELECT TEXT
    FROM SYS.ALL_VIEWS
    WHERE view_name = '{view_name}'"""

    view_query = read_query(query, db=db)

    print(view_query.text.values[0])


def find_table_schema(db: str, table_name: str):
    """
    Looks for a table named table_name in all schemas of the designated database and
    returns the name of the schema in which the table is found.

    If the table is not found, returns None.

    Possible values for db : 'ocan', 'monitorfish_remote', 'fmc', 'monitorfish_local'
    """
    e = create_engine(db)
    insp = inspect(e)

    for schema in insp.get_schema_names():
        for table in insp.get_table_names(schema=schema):
            if table == table_name:
                return schema

    return None


def print_schemas_tables(db: str, schemas=None):
    """
    Prints all schemas and associated tables in a database.
    Optionnal argument 'schemas' takes a list of schemas to restrict the scan.

    Possible values for db : 'ocan', 'monitorfish_remote', 'fmc', 'monitorfish_local'
    """
    e = create_engine(db)
    insp = inspect(e)

    for schema in insp.get_schema_names():
        if schemas is None or schema in schemas:
            print(f"------------------------\n***{schema}***")
            for table in insp.get_table_names(schema=schema):
                print(table)


def pg_dump_table(
    db: str, table_name: str, what: Union[None, str] = None, inserts: bool = False
) -> str:
    """
    Runs ``pg_dump --schema-only`` on the selected database and returns the output as a
    string. Useful to generate DDL statements of tables and to output test data as sql
    scripts.

      * If ``db`` is ``monitorfish_local``, the ``pg_dump`` command will be run by the
        machine on which the command is run, so postres must be installed.
      * If ``db`` is ``monitorfish_remote``, the command in run through in the docker
        container with ``docker exec monitorfish_database``.

    Args:
        db (str): 'monitorfish_remote' or 'monitorfish_local'
        table_name (str): the name of the table to export.
        what (Union[None, str]): ``'data-only'`` ``'schema-only'`` or ``None``. If
          ``None``, output both data and schema definition. Defaults to ``None``.
        inserts (bool): if `True`, dumps data as INSERT statements instead of COPY.
          Defaults to `False`.

    Returns:
        str: output of ``pg_dump`` command
    """
    try:
        assert db in ("monitorfish_remote", "monitorfish_local")
    except AssertionError:
        e = f"'db' must be 'monitorfish_local' or 'monitorfish_remote' , got {db}"
        raise ValueError(e)

    what_options = {
        "data-only": "--data-only",
        "schema-only": "--schema-only",
        None: "",
    }

    try:
        assert what in what_options
    except AssertionError:
        e = f"'what' must be 'data-only', 'schema-only' or None, got {what}"
        raise ValueError(e)

    connection_string = make_connection_string(db)

    cmd = f"pg_dump --dbname={connection_string} {what_options[what]} --table {table_name}"

    if inserts:
        cmd = cmd + " --column-inserts"

    if db == "monitorfish_remote":
        cmd = "docker exec monitorfish_database " + cmd

    stream = os.popen(cmd)
    return stream.read()
