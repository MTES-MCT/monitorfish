from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from config import CNSP_SIP_DEPARTMENT_EMAIL
from src.pipeline.generic_tasks import extract, load
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_foreign_fmcs_contacts() -> pd.DataFrame:
    """
    Extract foreign fmcs contact data from Poseidon.

    Returns:
        pd.DataFrame: foreign fmcs contact data.
    """
    return extract("fmc", "fmc/foreign_fmcs_contacts.sql")


@task(checkpoint=False)
def transform_foreign_fmcs_contacts(
    foreign_fmcs_contacts: pd.DataFrame,
) -> pd.DataFrame:
    """
    Remove `CNSP_SIP_DEPARTMENT_EMAIL` where present and aggregate countries' email addresses into arrays.

    Args:
        foreign_fmcs_contacts (pd.DataFrame): Extracted fmc data from Poseidon.

    Returns:
        pd.DataFrame: Transformed fmc data.
    """
    foreign_fmcs = (
        foreign_fmcs_contacts.groupby("country_code_iso3")[
            ["country_code_iso3", "country_name"]
        ]
        .head(1)
        .reset_index(drop=True)
    )
    foreign_fmcs_contacts = foreign_fmcs_contacts[
        foreign_fmcs_contacts.email_address != CNSP_SIP_DEPARTMENT_EMAIL
    ].dropna(subset=["email_address"])
    foreign_fmcs_contacts = (
        foreign_fmcs_contacts.groupby("country_code_iso3")["email_address"]
        .unique()
        .rename("email_addresses")
        .reset_index()
    )

    foreign_fmcs = pd.merge(
        foreign_fmcs, foreign_fmcs_contacts, on="country_code_iso3", how="left"
    )
    return foreign_fmcs


@task(checkpoint=False)
def load_foreign_fmcs(foreign_fmcs):
    load(
        foreign_fmcs,
        table_name="foreign_fmcs",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        pg_array_columns=["email_addresses"],
    )


with Flow("Foreign FMCs", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        foreign_fmcs_contacts = extract_foreign_fmcs_contacts()
        foreign_fmcs = transform_foreign_fmcs_contacts(foreign_fmcs_contacts)
        load_foreign_fmcs(foreign_fmcs)

flow.file_name = Path(__file__).name
