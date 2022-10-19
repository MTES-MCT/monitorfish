from pathlib import Path

import numpy as np
import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import coalesce, concatenate_columns


@task(checkpoint=False)
def extract_french_vessels():
    return extract("ocan", "ocan/french_vessels.sql")


@task(checkpoint=False)
def extract_eu_vessels():
    return extract("ocan", "ocan/eu_vessels.sql")


@task(checkpoint=False)
def extract_non_eu_vessels():
    return extract("ocan", "ocan/non_eu_vessels.sql")


@task(checkpoint=False)
def extract_vessels_operators():
    return extract("fmc", "fmc/vessels_operators.sql")


@task(checkpoint=False)
def extract_french_vessels_navigation_licences():
    return extract("ocan", "ocan/french_vessels_navigation_licences.sql")


@task(checkpoint=False)
def extract_control_charters() -> pd.DataFrame:
    """
    Extract vessels under control charter.
    """
    return extract("monitorfish_remote", "monitorfish/control_charter.sql")


@task(checkpoint=False)
def concat_merge_vessels(
    french_vessels,
    eu_vessels,
    non_eu_vessels,
    vessels_operators,
    licences,
    control_charters,
):
    all_vessels = pd.concat([french_vessels, eu_vessels, non_eu_vessels])
    assert not all_vessels.duplicated(subset="id").any()

    all_vessels = pd.merge(all_vessels, vessels_operators, on="id", how="left")

    all_vessels = pd.merge(all_vessels, licences, on="id", how="left")

    all_vessels = pd.merge(all_vessels, control_charters, on="id", how="left")

    all_vessels = all_vessels.fillna({"under_charter": False})

    dtypes = {
        "imo": "category",
        "mmsi": "category",
        "flag_state": "category",
        "district_code": "category",
        "district": "category",
        "vessel_phone_1": "category",
        "vessel_phone_2": "category",
        "vessel_phone_3": "category",
        "vessel_mobile_phone": "category",
        "vessel_fax": "category",
        "vessel_telex": "category",
        "vessel_email_1": "category",
        "vessel_email_2": "category",
        "vessel_type": "category",
        "registry_port": "category",
        "sailing_category": "category",
        "sailing_type": "category",
        "operator_email": "category",
        "operator_phone": "category",
        "operator_mobile_phone": "category",
        "operator_fax": "category",
        "proprietor_name": "category",
        "proprietor_email": "category",
        "proprietor_phone": "category",
        "proprietor_mobile_phone": "category",
        "fishing_gear_main": "category",
        "fishing_gear_secondary": "category",
        "fishing_gear_third": "category",
        "operator_email_1": "category",
        "operator_email_2": "category",
        "operator_phone_1": "category",
        "operator_phone_2": "category",
        "operator_name_pos": "category",
        "operator_email_pos": "category",
        "operator_phone_1_pos": "category",
        "operator_phone_2_pos": "category",
        "operator_phone_3_pos": "category",
        "operator_mobile_phone_pos": "category",
        "operator_fax_pos": "category",
        "under_charter": bool,
    }

    all_vessels = all_vessels.astype(dtypes)

    return all_vessels


@task(checkpoint=False)
def clean_vessels(all_vessels):

    logger = prefect.context.get("logger")

    # Concatenate several columns into lists when several values can be kept.
    logger.info("Combining columns into lists: emails, phone numbers...")
    concat_cols = {
        "proprietor_phones": ["proprietor_phone", "proprietor_mobile_phone"],
        "proprietor_emails": ["proprietor_email"],
        "operator_phones_navpro": [
            "operator_phone",
            "operator_phone_1",
            "operator_phone_2",
            "operator_mobile_phone",
        ],
        "operator_phones_poseidon": [
            "operator_phone_1_pos",
            "operator_phone_2_pos",
            "operator_phone_3_pos",
            "operator_mobile_phone_pos",
        ],
        "vessel_phones": [
            "vessel_phone_1",
            "vessel_phone_2",
            "vessel_phone_3",
            "vessel_mobile_phone",
        ],
        "vessel_emails": [
            "vessel_email_1",
            "vessel_email_2",
        ],
        "declared_fishing_gears": [
            "fishing_gear_main",
            "fishing_gear_secondary",
            "fishing_gear_third",
        ],
    }

    res = all_vessels.copy(deep=True)
    for col_name, cols_list in concat_cols.items():
        res.loc[:, col_name] = concatenate_columns(res, cols_list)

    # Replacing empty lists with None values is required to coalesce phones lists
    # properly
    res.operator_phones_poseidon = res.operator_phones_poseidon.where(
        res.operator_phones_poseidon.map(lambda x: x != []), None
    )
    res.operator_phones_navpro = res.operator_phones_navpro.where(
        res.operator_phones_navpro.map(lambda x: x != []), None
    )

    logger.info("Columns combined into lists.")

    # Combine several columns into one value when only one value must be kept.
    logger.info("Combining columns into single values: names, characteristics...")
    combine_cols = {
        "operator_name": [
            "operator_name_pos",
            "operator_name",
        ],
        "operator_email": [
            "operator_email_pos",
            "operator_email",
            "operator_email_1",
            "operator_email_2",
        ],
        "operator_phones": [
            "operator_phones_poseidon",
            "operator_phones_navpro",
        ],
        "operator_fax": ["operator_fax_pos", "operator_fax"],
        "operator_mobile_phone": [
            "operator_mobile_phone_pos",
            "operator_mobile_phone",
        ],
    }

    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = coalesce(res[cols_list])
    logger.info("Columns combined into single values.")

    # Sort columns
    logger.info("Sorting columns...")

    columns = [
        "id",
        "imo",
        "cfr",
        "external_immatriculation",
        "mmsi",
        "ircs",
        "vessel_name",
        "flag_state",
        "width",
        "length",
        "district",
        "district_code",
        "gauge",
        "registry_port",
        "power",
        "vessel_type",
        "sailing_category",
        "sailing_type",
        "declared_fishing_gears",
        "nav_licence_expiration_date",
        "proprietor_name",
        "proprietor_phones",
        "proprietor_emails",
        "operator_name",
        "operator_phones",
        "operator_mobile_phone",
        "operator_email",
        "operator_fax",
        "vessel_phones",
        "vessel_mobile_phone",
        "vessel_emails",
        "vessel_fax",
        "vessel_telex",
        "under_charter",
    ]
    res = res[columns]
    logger.info("Columns sorted.")

    return res


@task(checkpoint=False)
def load_vessels(all_vessels):

    all_vessels["width"] = np.asarray(all_vessels["width"])

    load(
        all_vessels,
        table_name="vessels",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        pg_array_columns=[
            "declared_fishing_gears",
            "operator_phones",
            "proprietor_phones",
            "proprietor_emails",
            "vessel_phones",
            "vessel_emails",
        ],
    )


with Flow("Vessels") as flow:
    # Extract
    french_vessels = extract_french_vessels()
    eu_vessels = extract_eu_vessels()
    non_eu_vessels = extract_non_eu_vessels()
    vessels_operators = extract_vessels_operators()
    licences = extract_french_vessels_navigation_licences()
    control_charters = extract_control_charters()

    # Transform
    all_vessels = concat_merge_vessels(
        french_vessels,
        eu_vessels,
        non_eu_vessels,
        vessels_operators,
        licences,
        control_charters,
    )
    all_vessels = clean_vessels(all_vessels)

    # Load
    load_vessels(all_vessels)

flow.file_name = Path(__file__).name
