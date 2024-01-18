from pathlib import Path

from prefect import Flow, Parameter, case, task

from forklift.db_engines import create_datawarehouse_client
from forklift.pipeline.helpers.generic import run_sql_script
from forklift.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def create_database_if_not_exists(database: str):
    """
    Creates a database in Clickhouse with the default database engine (Atomic) if it
    does not exist.

    If it already exists, does nothing.

    Args:
        database (str): Name of the database to create in Clickhouse.
    """
    sql = "CREATE DATABASE IF NOT EXISTS {database:Identifier}"
    run_sql_script(sql=sql, parameters={"database": database})


@task(checkpoint=False)
def drop_table_if_exists(database: str, table: str):
    """
    Drops designated table from data_warehouse if it exists.
    If the table does not exist, does nothing.

    Args:
        database (str): Database name in data_warehouse.
        table (str): Name of the table to drop.
    """
    sql = "DROP TABLE IF EXISTS  {database:Identifier}.{table:Identifier}"
    run_sql_script(sql=sql, parameters={"database": database, "table": table})


@task(checkpoint=False)
def create_table(ddl_script_path: str, database: str, table: str):
    """
    Runs DDL script at designated location with `database`  and `table` parameters.

    Args:
        ddl_script_path (str): DDL script location, relative to ddl directory
        database (str): database name, passed as `database` parameter to the client
        table (str): table name, passed as `table` parameter to the client
    """
    run_sql_script(
        sql_script_filepath=Path("ddl") / ddl_script_path,
        parameters={
            "database": database,
            "table": table,
        },
    )


@task(checkpoint=False)
def insert_data_from_source_to_destination(
    source_database: str,
    source_table: str,
    destination_database: str,
    destination_table: str,
):
    client = create_datawarehouse_client()

    # Check for the existence of source and destination databases
    databases = client.query_df("SHOW DATABASES")
    try:
        assert source_database in set(databases.name)
    except AssertionError:
        raise ValueError(
            (
                f"Source database {source_database} not found. "
                f"Available databases : {set(databases.name)}"
            )
        )

    try:
        assert destination_database in set(databases.name)
    except AssertionError:
        raise ValueError(
            (
                f"Destination database {destination_database} not found. "
                f"Available databases : {set(databases.name)}"
            )
        )

    # Check for the existence of destination tables. Source table cannot be check in this
    # way, because it can be a view, and `SHOW TABLES` does not include views.
    destination_tables = client.query_df(
        "SHOW TABLES FROM {destination_database:Identifier}",
        parameters={"destination_database": destination_database},
    )
    try:
        assert destination_table in set(destination_tables.name)
    except AssertionError:
        raise ValueError(
            (
                f"Destination table {destination_table} not found in destination database "
                f"{destination_database}. Available tables : {set(destination_tables.name)}"
            )
        )

    sql = """
    INSERT INTO {destination_database:Identifier}.{destination_table:Identifier}
    SELECT *
    FROM {source_database:Identifier}.{source_table:Identifier}
    """

    run_sql_script(
        sql=sql,
        parameters={
            "source_database": source_database,
            "source_table": source_table,
            "destination_database": destination_database,
            "destination_table": destination_table,
        },
    )


with Flow("Sync table") as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        source_database = Parameter("source_database")
        source_table = Parameter("source_table")
        destination_database = Parameter("destination_database")
        destination_table = Parameter("destination_table")
        ddl_script_path = Parameter("ddl_script_path")

        create_database = create_database_if_not_exists(destination_database)
        drop_table = drop_table_if_exists(
            destination_database, destination_table, upstream_tasks=[create_database]
        )
        created_table = create_table(
            ddl_script_path,
            database=destination_database,
            table=destination_table,
            upstream_tasks=[drop_table],
        )
        insert_data_from_source_to_destination(
            source_database,
            source_table,
            destination_database,
            destination_table,
            upstream_tasks=[created_table],
        )


flow.file_name = Path(__file__).name
