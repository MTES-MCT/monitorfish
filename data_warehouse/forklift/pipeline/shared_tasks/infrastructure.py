import prefect
from prefect import task
from sqlalchemy import Table

from forklift.db_engines import create_engine
from forklift.pipeline import utils


@task(checkpoint=False)
def get_table(
    table_name: str, schema: str = "public", database: str = "monitorfish_remote"
) -> Table:
    """
    Returns a `Table` representing the specified table.

    Args:
        table_name (str): Name of the table
        schema (str, optional): Schema of the table. Defaults to "public".
        database (str, optional): Database of the table, can be 'monitorfish_remote'
          or 'monitorfish_local'. Defaults to "monitorfish_remote".

    Returns:
        Table: `sqlalchemy.Table` representing the specified table.
    """

    logger = prefect.context.get("logger")

    return utils.get_table(
        table_name,
        schema=schema,
        conn=create_engine(database),
        logger=logger,
    )
