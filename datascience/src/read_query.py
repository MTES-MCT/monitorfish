import os
from pathlib import Path
from typing import Union

import pandas as pd
from sqlalchemy import text

from config import QUERIES_LOCATION

from .db_config import create_engine


def read_saved_query(
    db: str,
    sql_filepath: Union[str, Path],
    parse_dates: Union[list, dict, None] = None,
    params=None,
    **kwargs
) -> pd.DataFrame:
    """Run saved SQLquery on a database. Supported databases :
    - 'ocan' : OCAN database
    - 'fmc': FMC database
    - 'monitorfish_remote': Monitorfish database
    - 'monitorfish_local': Monitorfish PostGIS database hosted in CNSP
    - 'cacem_local' : CACEM PostGIS database hosted in CNSP

    Database credentials must be present in the environement.

    Args:
        db (str): Database name. Possible values :
            'ocan', 'fmc', 'monitorfish_remote', 'monitorfish_local'
        sql_filepath (str): path to .sql file, starting from the saved queries folder.
            example : "ocan/nav_fr_peche.sql"
        parse_dates (Union[list, dict, None], optional):
            - List of column names to parse as dates.
            - Dict of ``{column_name: format string}`` where format string is
            strftime compatible in case of parsing string times or is one of
            (D, s, ns, ms, us) in case of parsing integer timestamps.
            - Dict of ``{column_name: arg dict}``, where the arg dict corresponds
            to the keyword arguments of :func:`pandas.to_datetime`
        params: dict of query parameters
        kwargs : passed to pd.read_sql

    Returns:
        pd.DataFrame: Query results
    """
    engine = create_engine(db=db)
    sql_filepath = QUERIES_LOCATION / sql_filepath
    with open(sql_filepath, "r") as sql_file:
        query = text(sql_file.read())
    return pd.read_sql(query, engine, parse_dates=parse_dates, params=params, **kwargs)


def read_query(
    db: str, query, chunksize: Union[None, str] = None, params=None, **kwargs
) -> pd.DataFrame:
    """Run SQLquery on a database. Supported databases :
    - 'ocan' : OCAN database
    - 'fmc': FMC database
    - 'monitorfish_remote': Monitorfish database
    - 'monitorfish_local': Monitorfish PostGIS database hosted in CNSP
    - 'cacem_local' : CACEM PostGIS database hosted in CNSP

    Database credentials must be present in the environement.

    Args:
        db (str): Database name. Possible values :
            'ocan', 'fmc', 'monitorfish_remote', 'monitorfish_local'
        query (str): Query string or SQLAlchemy Selectable
        kwargs : passed to pd.read_sql

    Returns:
        pd.DataFrame: Query results
    """
    engine = create_engine(db=db, execution_options=dict(stream_results=True))
    return pd.read_sql(query, engine, chunksize=chunksize, params=params, **kwargs)


def read_table(db: str, schema: str, table_name: str):
    """Loads database table into pandas Dataframe. Supported databases :
    - 'ocan' : OCAN database
    - 'fmc': FMC database
    - 'monitorfish_remote': Monitorfish database
    - 'monitorfish_local': Monitorfish PostGIS database hosted in CNSP
    - 'cacem_local' : CACEM PostGIS database hosted in CNSP

    Args:
        db (str): Database name. Possible values :
            'ocan', 'fmc', 'monitorfish_remote', 'monitorfish_local'
        schema (str): Schema name
        table_name (str): Table name

    Returns:
        pd.DataFrame: Dataframe containing the entire table
    """
    engine = create_engine(db=db)
    return pd.read_sql_table(table_name, engine, schema=schema)
