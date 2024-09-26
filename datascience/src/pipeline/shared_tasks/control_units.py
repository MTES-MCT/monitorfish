from typing import List

import pandas as pd
import requests
from prefect import task

from config import MONITORENV_API_ENDPOINT
from src.pipeline.entities.control_units import ControlUnit
from src.pipeline.processing import remove_nones_from_list


@task(checkpoint=False)
def fetch_control_units() -> List[ControlUnit]:
    r = requests.get(MONITORENV_API_ENDPOINT + "control_units")

    r.raise_for_status()
    df = pd.DataFrame(r.json())

    columns = {
        "id": "control_unit_id",
        "name": "control_unit_name",
        "controlUnitContacts": "control_unit_contacts",
        "isArchived": "is_archived",
        "administration": "administration",
    }

    df = df[columns.keys()].rename(columns=columns)
    df["administration"] = df.administration.map(lambda d: d.get("name"))

    contacts = (
        df.loc[
            ~df.is_archived,
            [
                "control_unit_id",
                "control_unit_name",
                "administration",
                "control_unit_contacts",
            ],
        ]
        .explode("control_unit_contacts")
        .dropna()
        .reset_index(drop=True)
    )
    contacts["email"] = contacts["control_unit_contacts"].apply(
        lambda x: x.get("email")
        if x.get("email") and x.get("isEmailSubscriptionContact")
        else None
    )

    contacts["phone"] = contacts["control_unit_contacts"].apply(
        lambda x: x.get("phone")
        if x.get("phone") and x.get("isSmsSubscriptionContact")
        else None
    )

    email_and_phone_contacts = (
        contacts[
            ["control_unit_id", "control_unit_name", "administration", "email", "phone"]
        ]
        .dropna(subset=["email", "phone"], how="all")
        .groupby(["control_unit_id", "control_unit_name", "administration"])
        .agg({"email": "unique", "phone": "unique"})
        .rename(columns={"email": "emails", "phone": "phone_numbers"})
        .map(remove_nones_from_list)
        .map(sorted)
        .reset_index()
    )

    records = email_and_phone_contacts.to_dict(orient="records")
    return [ControlUnit(**control_unit) for control_unit in records]
