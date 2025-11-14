import pandas as pd
from prefect import flow, get_run_logger, task

from src.generic_tasks import delete_rows, extract, load


@task
def extract_local_hashes() -> pd.DataFrame:
    return extract("monitorfish_local", "cross/hashes.sql")


@task
def extract_remote_hashes() -> pd.DataFrame:
    return extract("monitorfish_remote", "monitorfish/regulations_hashes.sql")


@task
def merge_hashes(
    local_hashes: pd.DataFrame, remote_hashes: pd.DataFrame
) -> pd.DataFrame:
    return pd.merge(local_hashes, remote_hashes, on="id", how="outer")


@task
def select_ids_to_update(hashes: pd.DataFrame) -> set:
    ids_to_update = set(
        hashes.loc[
            (hashes.local_row_hash.notnull())
            & (hashes.local_row_hash != hashes.remote_row_hash),
            "id",
        ]
    )

    return ids_to_update


@task
def select_ids_to_delete(hashes: pd.DataFrame) -> set:
    return set(hashes.loc[hashes.local_row_hash.isna(), "id"])


@task
def update_required(ids_to_update: set) -> bool:
    logger = get_run_logger()
    n = len(ids_to_update)
    if n > 0:
        logger.info(f"Found {n} row(s) to add or update.")
        res = True
    else:
        logger.info("No row to add or update was found.")
        res = False
    return res


@task
def delete_required(ids_to_delete: set) -> bool:
    logger = get_run_logger()
    n = len(ids_to_delete)
    if n > 0:
        logger.info(f"Found {n} row(s) to delete.")
        res = True
    else:
        logger.info("No row to delete was found.")
        res = False
    return res


@task
def delete(ids_to_delete: set):
    logger = get_run_logger()
    delete_rows(
        table_name="regulations",
        schema="public",
        db_name="monitorfish_remote",
        table_id_column="id",
        ids_to_delete=ids_to_delete,
        logger=logger,
    )


@task
def extract_new_regulations(ids_to_update: set) -> pd.DataFrame:
    return extract(
        "monitorfish_local",
        "cross/regulations.sql",
        params={"ids": tuple(ids_to_update)},
    )


@task
def load_new_regulations(new_regulations: pd.DataFrame):
    """Load the output of ``extract_rows_to_update`` task into ``regulations``
    table.

    Args:
        new_regulations (pd.DataFrame): output of ``extract_rows_to_update`` task.
    """
    load(
        new_regulations,
        table_name="regulations",
        schema="public",
        db_name="monitorfish_remote",
        logger=get_run_logger(),
        jsonb_columns=[
            "regulatory_references",
            "fishing_period",
            "species",
            "gears",
            "tags",
        ],
        how="upsert",
        table_id_column="id",
        df_id_column="id",
    )


@flow(name="Regulations")
def regulations_flow():
    local_hashes = extract_local_hashes()
    remote_hashes = extract_remote_hashes()
    hashes = merge_hashes(local_hashes, remote_hashes)

    ids_to_delete = select_ids_to_delete(hashes)
    cond_delete = delete_required(ids_to_delete)
    if cond_delete:
        delete(ids_to_delete)

    ids_to_update = select_ids_to_update(hashes)
    cond_update = update_required(ids_to_update)
    if cond_update:
        new_regulations = extract_new_regulations(ids_to_update)
        load_new_regulations(new_regulations)
