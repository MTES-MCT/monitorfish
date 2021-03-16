import logging

import prefect
import sqlalchemy
from sqlalchemy import func, select


def delete(
    table: sqlalchemy.Table,
    connection: sqlalchemy.engine.base.Connection,
    logger: logging.Logger,
):
    """Deletes all row from a table.
    Useful to wipe a table before re-inserting fresh data in ETL jobs."""
    count_statement = select([func.count()]).select_from(table)
    n = connection.execute(count_statement).fetchall()[0][0]
    if logger:
        logger.info(f"Found existing table {table.name} with {n} rows.")
        logger.info(f"Deleting table {table.name}...")
    connection.execute(table.delete())
    count_statement = select([func.count()]).select_from(table)
    n = connection.execute(count_statement).fetchall()[0][0]
    if logger:
        logger.info(f"Rows after deletion: {n}.")
