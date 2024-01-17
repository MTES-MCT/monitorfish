import os
from pathlib import Path

from prefect import Flow, Parameter, case, task

from forklift.db_engines import create_datawarehouse_client, db_env
from forklift.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def mirror_pg_database(database: str, schema: str, database_name_in_dw: str):
    """
    Creates a PostgreSQL engine database in Clickhouse mirroring a remote Postgres
    database.

    Data is not physically copied to Clickhouse, this just creates a "mirror" in
    Clickhouse. This mirror can be queried from Clickhouse as if it were a database in
    Clickhouse, but the query is actually delegated to the original remote Postgres
    instance, and results are streamed back to Clickhouse.

    This allows to query various remote databases easily. Clickhouse also makes it
    possible to join data coming from multiple databases in this way by querying the
    various sources and performing the join in Clickhouse after collecting the data
    from the different sources.

    The performances of queries on these mirrored databases is however that of databses
    which actually execute the queries (plus network overhead), which will be much
    slower than querying data that actually resides in Clickhouse. It is therefore
    recommended to use this mechanism mainly for syncing to tables physically created
    in Clickhouse, and not for user-facing fonctionnality (i.e. dashboards).

    Args:
        database (str): Database to mirror. Possible values : 'monitorfish_remote',
          'monitorenv_remote'
        schema (str): schema to mirror.
        database_name_in_dw (str): Name of the mirror database to create in Clickhouse.

    Raises:
        ValueError: if database credentials for the database are not found in the
          environment
    """
    client = create_datawarehouse_client()

    try:
        host = os.environ[db_env[database]["host"]]
        port = os.environ[db_env[database]["port"]]
        sid = os.environ[db_env[database]["sid"]]
        usr = os.environ[db_env[database]["usr"]]
        pwd = os.environ[db_env[database]["pwd"]]
    except KeyError as e:
        raise KeyError(
            "Database connection credentials not found in environment: ", e.args
        )

    sql = f"""
        CREATE DATABASE IF NOT EXISTS {database_name_in_dw}
        ENGINE = PostgreSQL(
            '{host}:{port}',
            '{sid}',
            '{usr}',
            '{pwd}',
            '{schema}'
        )
    """

    client.command(sql)


with Flow("Mirror PostgreSQL database") as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        database = Parameter("database")
        schema = Parameter("schema")
        database_name_in_dw = Parameter("database_name_in_dw")
        mirror_pg_database(
            database=database, schema=schema, database_name_in_dw=database_name_in_dw
        )


flow.file_name = Path(__file__).name
