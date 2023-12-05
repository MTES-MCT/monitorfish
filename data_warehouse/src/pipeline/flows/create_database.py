from pathlib import Path

from prefect import Flow, Parameter, case, task

from src.db_config import create_datawarehouse_client
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def create_database(database_name: str):
    """
    Creates a database in Clickhouse with the default database engine (Atomic) if it
    does not exist.

    If it already exists, does nothing.

    Args:
        database_name (str): Name of the database to create in Clickhouse.
    """
    client = create_datawarehouse_client()
    sql = "CREATE DATABASE IF NOT EXISTS {database_name:Identifier}"
    client.command(sql, parameters={"database_name": database_name})


with Flow("Create database") as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        database_name = Parameter("database_name")
        create_database(database_name=database_name)


flow.file_name = Path(__file__).name
