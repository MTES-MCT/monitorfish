from pathlib import Path
from typing import Union

import geopandas as gpd
import pandas as pd
from clickhouse_connect.driver.httpclient import HttpClient
from sqlalchemy import text
from sqlalchemy.engine import Connection, Engine

from config import QUERIES_LOCATION

from .db_config import create_datawarehouse_client, create_engine


def read_saved_query(
    sql_filepath: Union[str, Path],
    *,
    db: str = None,
    con: Union[Connection, Engine, HttpClient] = None,
    chunksize: Union[None, str] = None,
    params: Union[dict, None] = None,
    backend: str = "pandas",
    geom_col: str = "geom",
    crs: Union[int, None] = None,
    parse_dates: Union[list, dict, None] = None,
    **kwargs,
) -> Union[pd.DataFrame, gpd.GeoDataFrame]:
    """Run saved SQLquery on a database. Supported databases :

      - 'ocan' : OCAN database
      - 'fmc': FMC database
      - 'monitorfish_remote': Monitorfish database
      - 'monitorenv_remote': Monitorenv database
      - 'monitorfish_local': Monitorfish PostGIS database hosted in CNSP
      - 'cacem_local' : CACEM PostGIS database hosted in CNSP
      - 'data_warehouse' : Data Warehouse database

    Database credentials must be present in the environement.

    Args:
        sql_filepath (str): path to .sql file, starting from the saved queries folder.
          example : 'ocan/nav_fr_peche.sql'
        db (str, optional): Database name. Possible values :
          'ocan', 'fmc', 'monitorfish_remote', 'monitorenv_remote', 'monitorfish_local',
          'cacem_local', 'data_warehouse'. If `db` is None, `con` must be passed.
        con (Union[Connection, Engine, HttpClient], optional) :
          `sqlalchemy.engine.Connection` or `sqlalchemy.engine.Engine` or
          `clickhouse_connect.driver.httpclient.HttpClient` object. Mandatory if no
          `db` is given. Ignored if `db` is given.
        chunksize (Union[None, str], optional): If specified, return an iterator where
          `chunksize` is the number of rows to include in each chunk. Defaults to
          None.
        params (Union[dict, None], optional): Parameters to pass to execute method.
          Defaults to None. Ignored for `data_warehouse` database.
        backend (str, optional) : 'pandas' to run a SQL query and return a
          `pandas.DataFrame` or 'geopandas' to run a PostGIS query and return a
          `geopandas.GeoDataFrame`. Defaults to 'pandas'. Ignored for `data_warehouse`
          database.
        geom_col (str, optional): column name to convert to shapely geometries when
          `backend` is 'geopandas'. Ignored when `backend` is 'pandas'. Defaults to
          'geom'. Ignored for `data_warehouse` database.
        crs (Union[None, str], optional) : CRS to use for the returned GeoDataFrame;
          if not set, tries to determine CRS from the SRID associated with the first
          geometry in the database, and assigns that to all geometries. Ignored when
          `backend` is 'pandas'. Defaults to None. Ignored for `data_warehouse`
          database.
        parse_dates (Union[list, dict, None], optional):

          - List of column names to parse as dates.
          - Dict of ``{column_name: format string}`` where format string is
            strftime compatible in case of parsing string times or is one of
            (D, s, ns, ms, us) in case of parsing integer timestamps.
          - Dict of ``{column_name: arg dict}``, where the arg dict corresponds
            to the keyword arguments of :func:`pandas.to_datetime`

          Ignored for `data_warehouse` database.
        kwargs : passed to pd.read_sql or gpd.read_postgis. Ignored for `data_warehouse`
          database.

    Returns:
        Union[pd.DataFrame, gpd.DataFrame]: Query results
    """
    sql_filepath = QUERIES_LOCATION / sql_filepath
    with open(sql_filepath, "r") as sql_file:
        query = text(sql_file.read())

    return read_query(
        query,
        db=db,
        con=con,
        chunksize=chunksize,
        params=params,
        backend=backend,
        geom_col=geom_col,
        crs=crs,
        parse_dates=parse_dates,
        **kwargs,
    )


def read_query(
    query,
    *,
    db: str = None,
    con: Union[Connection, Engine, HttpClient] = None,
    chunksize: Union[None, str] = None,
    params: Union[dict, None] = None,
    backend: str = "pandas",
    geom_col: str = "geom",
    crs: Union[int, None] = None,
    parse_dates: Union[list, dict, None] = None,
    **kwargs,
) -> Union[pd.DataFrame, gpd.GeoDataFrame]:
    """Run SQLquery on a database. Supported databases :

      - 'ocan' : OCAN database
      - 'fmc': FMC database
      - 'monitorfish_remote': Monitorfish database
      - 'monitorenv_remote': Monitorenv database
      - 'monitorfish_local': Monitorfish PostGIS database hosted in CNSP
      - 'cacem_local' : CACEM PostGIS database hosted in CNSP
      - 'data_warehouse' : Data Warehouse database

    Database credentials must be present in the environement.

    Args:
        query (str): Query string or SQLAlchemy Selectable
        db (str, optional): Database name. Possible values :
          'ocan', 'fmc', 'monitorfish_remote', 'monitorenv_remote',
          'monitorfish_local', 'monitorenv_local', 'data_warehouse'. If `db` is None,
          `con` must be passed.
        con (Union[Connection, Engine, HttpClient], optional) :
          `sqlalchemy.engine.Connection` or `sqlalchemy.engine.Engine` or
          `clickhouse_connect.driver.httpclient.HttpClient` object. Mandatory if no
          `db` is given. Ignored if `db` is given.
        chunksize (Union[None, str], optional): If specified, return an iterator where
          `chunksize` is the number of rows to include in each chunk. Defaults to
          None.
        params (Union[dict, None], optional): Parameters to pass to execute method.
          Defaults to None. Ignored for `data_warehouse` database.
        backend (str, optional) : 'pandas' to run a SQL query and return a
          `pandas.DataFrame` or 'geopandas' to run a PostGIS query and return a
          `geopandas.GeoDataFrame`. Defaults to 'pandas'. Ignored for `data_warehouse`
          database.
        geom_col (str, optional): column name to convert to shapely geometries when
          `backend` is 'geopandas'. Ignored when `backend` is 'pandas'. Defaults to
          'geom'. Ignored for `data_warehouse` database.
        crs (Union[None, str], optional) : CRS to use for the returned GeoDataFrame;
          if not set, tries to determine CRS from the SRID associated with the first
          geometry in the database, and assigns that to all geometries. Ignored when
          `backend` is 'pandas'. Defaults to None. Ignored for `data_warehouse`
          database.
        parse_dates (Union[list, dict, None], optional):

          - List of column names to parse as dates.
          - Dict of ``{column_name: format string}`` where format string is
            strftime compatible in case of parsing string times or is one of
            (D, s, ns, ms, us) in case of parsing integer timestamps.
          - Dict of ``{column_name: arg dict}``, where the arg dict corresponds
            to the keyword arguments of :func:`pandas.to_datetime`

          Ignored for `data_warehouse` database.
        kwargs : passed to pd.read_sql or gpd.read_postgis. Ignored for `data_warehouse`
          database.

    Returns:
        Union[pd.DataFrame, gpd.DataFrame]: Query results
    """
    if db == "data_warehouse":
        client = create_datawarehouse_client()
        return client.query_df(query)

    if db:
        con = create_engine(db=db, execution_options=dict(stream_results=True))
    elif con:
        assert isinstance(con, (Engine, Connection))
    else:
        raise ValueError("At least one of `db` or `con` must be passed.")

    if backend == "pandas":
        return pd.read_sql(
            query,
            con,
            chunksize=chunksize,
            parse_dates=parse_dates,
            params=params,
            **kwargs,
        )
    elif backend == "geopandas":
        return gpd.read_postgis(
            query,
            con,
            geom_col=geom_col,
            crs=crs,
            chunksize=chunksize,
            parse_dates=parse_dates,
            params=params,
            **kwargs,
        )
    else:
        raise ValueError(f"backend must be 'pandas' or 'geopandas', got {backend}")


def read_table(db: str, schema: str, table_name: str):
    """Loads database table into pandas Dataframe. Supported databases :

      - 'ocan' : OCAN database
      - 'fmc': FMC database
      - 'monitorfish_remote': Monitorfish database
      - 'monitorenv_remote': Monitorenv database
      - 'monitorfish_local': Monitorfish PostGIS database hosted in CNSP
      - 'cacem_local' : CACEM PostGIS database hosted in CNSP

    Args:
        db (str): Database name. Possible values : 'ocan', 'fmc', 'monitorfish_remote',
          'monitorenv_remote', 'monitorfish_local', 'monitorenv_local'
        schema (str): Schema name
        table_name (str): Table name

    Returns:
        pd.DataFrame: Dataframe containing the entire table
    """
    engine = create_engine(db=db)
    return pd.read_sql_table(table_name, engine, schema=schema)
