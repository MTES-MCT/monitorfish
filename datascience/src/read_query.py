import os

import pandas as pd

from config import LIBRARY_LOCATION

# from .db_config import connect_fmcit, connect_monitorfish_remote_i, connect_ocani
from .db_config import create_engine


def read_saved_query(db: str, sql_filepath: str) -> pd.DataFrame:
    """Run saved SQLquery on a database. Supported databases :
    - 'ocani' : OCAN integration database
    - 'fmcit': FMC integration database
    - 'monitorfish_remote_i': Monitorfish integration database

    Database credentials must be present in the environement.

    Args:
        db (str): Database name. Possible values :
            'ocani', 'fmcit', 'monitorfish_remote_i'
        sql_filepath (str): path to .sql file, starting from datascience library folder.
            example : "pipeline/queries/ocan/nav_fr_peche.sql"

    Returns:
        pd.DataFrame: Query results
    """
    engine = create_engine(db=db)
    sql_filepath = os.path.join(LIBRARY_LOCATION, sql_filepath)
    with open(sql_filepath, "r") as sql_file:
        query = sql_file.read()
    return pd.read_sql(query, engine)


def read_query(db: str, query: str) -> pd.DataFrame:
    """Run SQLquery on a database. Supported databases :
    - 'ocani' : OCAN integration database
    - 'fmcit': FMC integration database
    - 'monitorfish_remote_i': Monitorfish integration database

    Database credentials must be present in the environement.

    Args:
        db (str): Database name. Possible values :
            'ocani', 'fmcit', 'monitorfish_remote_i'
        query (str): Query string

    Returns:
        pd.DataFrame: Query results
    """
    engine = create_engine(db=db)
    return pd.read_sql(query, engine)


def read_table(db: str, schema: str, table_name: str):
    """Loads database table into pandas Dataframe. Supported databases :
    - 'ocani' : OCAN integration database
    - 'fmcit': FMC integration database
    - 'monitorfish_remote_i': Monitorfish integration database

    Args:
        db (str): Database name. Possible values :
            'ocani', 'fmcit', 'monitorfish_remote_i'
        schema (str): Schema name
        table_name (str): Table name

    Returns:
        pd.DataFrame: Dataframe containing the entire table
    """
    engine = create_engine(db=db)
    return pd.read_sql_table(table_name, engine, schema=schema)
