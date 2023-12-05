import os

import clickhouse_connect as ch
import sqlalchemy as sa
from clickhouse_connect.driver.httpclient import HttpClient

db_env = {
    "ocan": {
        "client": "ORACLE_CLIENT",
        "host": "ORACLE_HOST",
        "port": "ORACLE_PORT",
        "sid": "ORACLE_OCAN_SID",
        "usr": "ORACLE_OCAN_USER",
        "pwd": "ORACLE_OCAN_PASSWORD",
    },
    "fmc": {
        "client": "ORACLE_CLIENT",
        "host": "ORACLE_HOST",
        "port": "ORACLE_PORT",
        "sid": "ORACLE_FMC_SID",
        "usr": "ORACLE_FMC_USER",
        "pwd": "ORACLE_FMC_PASSWORD",
    },
    "monitorfish_remote": {
        "client": "MONITORFISH_REMOTE_DB_CLIENT",
        "host": "MONITORFISH_REMOTE_DB_HOST",
        "port": "MONITORFISH_REMOTE_DB_PORT",
        "sid": "MONITORFISH_REMOTE_DB_NAME",
        "usr": "MONITORFISH_REMOTE_DB_USER",
        "pwd": "MONITORFISH_REMOTE_DB_PWD",
    },
    "monitorenv_remote": {
        "client": "MONITORENV_REMOTE_DB_CLIENT",
        "host": "MONITORENV_REMOTE_DB_HOST",
        "port": "MONITORENV_REMOTE_DB_PORT",
        "sid": "MONITORENV_REMOTE_DB_NAME",
        "usr": "MONITORENV_REMOTE_DB_USER",
        "pwd": "MONITORENV_REMOTE_DB_PWD",
    },
    "monitorfish_local": {
        "client": "MONITORFISH_LOCAL_CLIENT",
        "host": "MONITORFISH_LOCAL_HOST",
        "port": "MONITORFISH_LOCAL_PORT",
        "sid": "MONITORFISH_LOCAL_NAME",
        "usr": "MONITORFISH_LOCAL_USER",
        "pwd": "MONITORFISH_LOCAL_PWD",
    },
    "cacem_local": {
        "client": "CACEM_LOCAL_CLIENT",
        "host": "CACEM_LOCAL_HOST",
        "port": "CACEM_LOCAL_PORT",
        "sid": "CACEM_LOCAL_NAME",
        "usr": "CACEM_LOCAL_USER",
        "pwd": "CACEM_LOCAL_PWD",
    },
    "data_warehouse": {
        "client": "DATA_WAREHOUSE_CLIENT",
        "host": "DATA_WAREHOUSE_HOST",
        "port": "DATA_WAREHOUSE_PORT",
        "sid": "DATA_WAREHOUSE_NAME",
        "usr": "DATA_WAREHOUSE_USER",
        "pwd": "DATA_WAREHOUSE_PWD",
    },
}


def make_connection_string(db: str) -> str:
    """Returns the connection string for the designated database.

    Args:
        db (str): Database name. Possible values :
            'ocan', 'fmc', 'monitorfish_remote', 'monitorenv_remote',
            'monitorfish_local', 'cacem_local', 'data_warehouse'

    Returns:
        str: connection string for selected database.

    Raises:
        ValueError: with credentials for the selected database are not found in
        environment variables.
    """

    import config  # To load env vars in "local test" and "local run" configurations

    try:
        CLIENT = os.environ[db_env[db]["client"]]
        HOST = os.environ[db_env[db]["host"]]
        PORT = os.environ[db_env[db]["port"]]
        SID = os.environ[db_env[db]["sid"]]
        USER = os.environ[db_env[db]["usr"]]
        PWD = os.environ[db_env[db]["pwd"]]
    except KeyError as e:
        raise KeyError(
            "Database connection credentials not found in environment: ", e.args
        )

    return f"{CLIENT}://{USER}:{PWD}@{HOST}:{PORT}/{SID}"


def create_engine(db: str, **kwargs) -> sa.engine.Engine:
    """Returns sqlalchemy engine for designated database.

    Args:
        db (str): Database name. Possible values :
            'ocan', 'fmc', 'monitorfish_remote', 'monitorenv_remote',
            'monitorfish_local', 'cacem_local'

    Returns:
        sa.engine.Engine: sqlalchemy engine for selected database.
    """
    connection_string = make_connection_string(db)

    engine = sa.create_engine(connection_string, **kwargs)

    return engine


def create_datawarehouse_client() -> HttpClient:
    """Returns clickhouse client for data_warehouse database.

    Returns:
        HttpClient]: clickhouse client for data_warehouse.
    """

    import config  # To load env vars in "local test" configurations

    credentials = db_env["data_warehouse"]
    client = ch.get_client(
        host=os.environ[credentials["host"]],
        port=os.environ[credentials["port"]],
        username=os.environ[credentials["usr"]],
        password=os.environ[credentials["pwd"]],
    )

    return client
