from pathlib import Path

from prefect import Flow, Parameter, task

from src.db_config import create_datawarehouse_client


@task(checkpoint=False)
def drop_data_warehouse_table(database: str, table: str):
    """
    Drops designated table from data_warehouse if it exists.
    If the table does not exist, does nothing.

    Args:
        database (str): Database name in data_warehouse.
        table (str): Name of the table to drop.
    """
    client = create_datawarehouse_client()
    sql = "DROP TABLE IF EXISTS  {database:Identifier}.{table:Identifier}"
    client.command(sql, parameters={"database": database, "table": table})


@task(checkpoint=False)
def create_data_warehouse_table(
    database: str,
    table: str,
):
    """
    Creates designated table in the data_warehouse if it exists.
    If the table does not exist, does nothing.

    Args:
        database (str): Database name in data_warehouse.
        table (str): Name of the table to drop.
    """
    client = create_datawarehouse_client()
    sql = "DROP TABLE IF EXISTS  {database:Identifier}.{table:Identifier}"
    client.command(sql, parameters={"database": database, "table": table})


with Flow("Sync table") as flow:
    source_database = Parameter("source_database")
    source_table = Parameter("source_table")
    destination_database = Parameter("destination_database")
    destination_table = Parameter("destination_table")


flow.file_name = Path(__file__).name
