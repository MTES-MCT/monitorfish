from typing import List

import pandas as pd
from sqlalchemy import inspect

from src.db_config import create_engine
from src.read_query import read_query


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
