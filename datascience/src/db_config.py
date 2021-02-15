import logging
import os
from functools import wraps

import sqlalchemy as sa

import config

db_env = {
    "ocani": {
        "client": "ORACLE_CLIENT",
        "host": "ORACLE_HOST",
        "port": "ORACLE_PORT",
        "sid": "ORACLE_OCANI_SID",
        "usr": "ORACLE_OCANI_USER",
        "pwd": "ORACLE_OCANI_PASSWORD",
    },
    "fmcit": {
        "client": "ORACLE_CLIENT",
        "host": "ORACLE_HOST",
        "port": "ORACLE_PORT",
        "sid": "ORACLE_FMCIT_SID",
        "usr": "ORACLE_FMCIT_USER",
        "pwd": "ORACLE_FMCIT_PASSWORD",
    },
    "monitorfish_remote_i": {
        "client": "MONITORFISH_REMOTE_DB_CLIENT",
        "host": "MONITORFISH_REMOTE_DB_HOST",
        "port": "MONITORFISH_REMOTE_DB_PORT",
        "sid": "MONITORFISH_REMOTE_DB_NAME",
        "usr": "MONITORFISH_REMOTE_DB_USER",
        "pwd": "MONITORFISH_REMOTE_DB_PWD",
    },
    "monitorfish_local": {
        "client": "MONITORFISH_LOCAL_CLIENT",
        "host": "MONITORFISH_LOCAL_HOST",
        "port": "MONITORFISH_LOCAL_PORT",
        "sid": "MONITORFISH_LOCAL_NAME",
        "usr": "MONITORFISH_LOCAL_USER",
        "pwd": "MONITORFISH_LOCAL_PWD",
    },
}


def create_engine(db: str, **kwargs) -> sa.engine.Engine:
    """Returns sqlalchemy engine for designated database.

    Args:
        db (str): Database name. Possible values :
            'ocani', 'fmcit', 'monitorfish_remote_i', 'monistorfish_local'

    Returns:
        sa.engine.Engine: sqlalchemy engine for selected database.
    """
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

    engine = sa.create_engine(f"{CLIENT}://{USER}:{PWD}@{HOST}:{PORT}/{SID}", **kwargs)

    return engine
