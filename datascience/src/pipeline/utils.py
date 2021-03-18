import logging
import os
import pathlib
import shutil
from itertools import zip_longest
from typing import Iterable, Union

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


def grouper(iterable: Iterable, n: int, fillvalue: Union[None, str] = None) -> Iterable:
    """Collect data into fixed-length chunks or blocks"""
    args = [iter(iterable)] * n
    return zip_longest(*args, fillvalue=fillvalue)


def move(src_fp: pathlib.Path, dest_dirpath: pathlib.Path) -> None:
    """Moves a file to another directory. If the destination directory
    does not exist, it is created, as well as all intermediate directories."""
    if not dest_dirpath.exists():
        os.makedirs(dest_dirpath)
    shutil.move(src_fp.as_posix(), dest_dirpath.as_posix())
