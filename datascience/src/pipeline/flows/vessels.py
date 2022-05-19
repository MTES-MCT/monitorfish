from pathlib import Path

import numpy as np
import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import coalesce, concatenate_columns
from src.pipeline.shared_tasks.beacons import beaconStatus


@task(checkpoint=False)
def extract_fr_vessels():

    # Sparse data type takes up less memory - especially for float data type
    # For string data, pd.SparseDtype does not reduce memory usage much. Using
    # pd.Categorical reduces memory usage much more.

    dtypes = {
        "length_nf": pd.SparseDtype("float", None),
        "width_nf": pd.SparseDtype("float", None),
        "gauge_nf": pd.SparseDtype("float", None),
        "power_nf": pd.SparseDtype("float", None),
        "vessel_phone_1_nf": "category",
        "vessel_phone_2_nf": "category",
        "vessel_phone_3_nf": "category",
        "vessel_mobile_phone_nf": "category",
        "vessel_fax_nf": "category",
        "vessel_telex_nf": "category",
        "vessel_email_1_nf": "category",
        "vessel_email_2_nf": "category",
        "vessel_type_nf": "category",
        "registry_port_nf": "category",
        "sailing_types_nf": "category",
        "operator_name_nf": "category",
        "operator_email_nf": "category",
        "operator_phone_nf": "category",
        "operator_mobile_phone_nf": "category",
        "operator_fax_nf": "category",
        "proprietor_name_nf": "category",
        "proprietor_email_nf": "category",
        "proprietor_phone_nf": "category",
        "proprietor_mobile_phone_nf": "category",
        "fishing_gear_main_nfp": "category",
        "fishing_gear_secondary_nfp": "category",
        "fishing_gear_third_nfp": "category",
    }

    return extract("ocan", "ocan/navires_fr.sql", dtypes=dtypes)


@task(checkpoint=False)
def extract_foreign_vessels():

    dtypes = {
        "operator_email_1_ne": "category",
        "operator_email_2_ne": "category",
        "operator_fax_ne": "category",
        "operator_mobile_phone_ne": "category",
        "operator_name_ne": "category",
        "operator_phone_1_ne": "category",
        "operator_phone_2_ne": "category",
        "proprietor_name_ne": "category",
        "vessel_email_1_ne": "category",
        "vessel_email_2_ne": "category",
        "vessel_fax_ne": "category",
        "vessel_mobile_phone_ne": "category",
        "vessel_phone_1_ne": "category",
        "vessel_phone_2_ne": "category",
        "vessel_phone_3_ne": "category",
        "vessel_telex_ne": "category",
    }

    return extract("ocan", "ocan/navires_etrangers.sql", dtypes=dtypes)


@task(checkpoint=False)
def extract_cee_vessels():

    dtypes = {
        "fishing_gear_main_ncp": "category",
        "fishing_gear_secondary_ncp": "category",
        "fishing_gear_third_ncp": "category",
        "vessel_type_ncp": "category",
        "district_ncp": "category",
        "operator_name_ncp": "category",
        "operator_email_ncp": "category",
        "proprietor_email_ncp": "category",
        "length_ncp": pd.SparseDtype("float", None),
        "gauge_ncp": pd.SparseDtype("float", None),
        "power_ncp": pd.SparseDtype("float", None),
    }

    return extract("ocan", "ocan/navires_cee_peche.sql", dtypes=dtypes)


@task(checkpoint=False)
def extract_non_cee_vessels():
    dtypes = {"fishing_gear_main_nep": "category"}
    return extract("ocan", "ocan/navires_hors_cee_peche.sql", dtypes=dtypes)


@task(checkpoint=False)
def extract_floats():

    dtypes = {
        "imo_f": "category",
        "cfr_f": "category",
        "external_immatriculation_f": "category",
        "vessel_name_f": "category",
        "ircs_f": "category",
        "mmsi_f": "category",
        "flag_state_f": "category",
        "district_code_f": "category",
        "district_f": "category",
    }

    return extract("ocan", "ocan/flotteurs.sql", dtypes=dtypes)


@task(checkpoint=False)
def extract_nav_licences():
    dtypes = {"sailing_category": "category", "nav_licence_expiration_date": "category"}

    return extract("ocan", "ocan/permis_navigation.sql", dtypes=dtypes)


@task(checkpoint=False)
def extract_beacons() -> pd.DataFrame:
    """
    Extract beacon numbers of all vessels from Poseidon.
    """
    return extract("fmc", "fmc/beacons.sql")


@task(checkpoint=False)
def extract_control_charters() -> pd.DataFrame:
    """
    Extract vessels under control charter.
    """
    return extract("monitorfish_remote", "monitorfish/control_charter.sql")


@task(checkpoint=False)
def extract_poseidon_vessels():

    dtypes = {
        "operator_name_pos": "category",
        "operator_email_pos": "category",
        "operator_phone_1_pos": "category",
        "operator_phone_2_pos": "category",
        "operator_phone_3_pos": "category",
        "operator_mobile_phone_pos": "category",
        "operator_fax_pos": "category",
    }

    return extract("fmc", "fmc/vessels.sql", dtypes=dtypes)


@task(checkpoint=False)
def transform_beacons(beacons: pd.DataFrame) -> pd.DataFrame:
    """Maps Posedion beacon status to Monitorfish `beaconStatus`.

    Args:
        beacons (pd.DataFrame): DataFrame of beacons extracted from Poseidon

    Returns:
        pd.DataFrame: beacons with status mapped to `beaconStatus`
    """
    beacons = beacons.copy(deep=True)
    beacons["beacon_status"] = beacons.beacon_status.map(
        beaconStatus.from_poseidon_status, na_action="ignore"
    ).map(lambda beacon_status: beacon_status.value, na_action="ignore")
    return beacons


@task(checkpoint=False)
def merge_vessels(
    floats,
    fr_vessels,
    foreign_vessels,
    cee_vessels,
    non_cee_vessels,
    licences,
    beacons,
    control_charters,
    poseidon_vessels,
):
    res = pd.merge(
        floats,
        fr_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_nf",
    ).drop(columns=["id_nav_flotteur_nf"])

    res = pd.merge(
        res,
        foreign_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_ne",
    ).drop(columns=["id_nav_flotteur_ne"])

    res = pd.merge(
        res,
        cee_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_ncp",
    ).drop(columns=["id_nav_flotteur_ncp"])

    res = pd.merge(
        res,
        non_cee_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_nep",
    ).drop(columns=["id_nav_flotteur_nep"])

    res = pd.merge(
        res,
        licences,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_gin",
    ).drop(columns=["id_nav_flotteur_gin"])

    res = pd.merge(
        res,
        beacons,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_bn",
    ).drop(columns=["id_nav_flotteur_bn"])

    res = pd.merge(
        res,
        control_charters,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id",
    ).drop(columns=["id"])

    res = pd.merge(
        res,
        poseidon_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_pos",
    ).drop(columns=["id_nav_flotteur_pos"])

    return res


@task(checkpoint=False)
def clean_vessels(all_vessels):

    logger = prefect.context.get("logger")

    # Concatenate several columns into lists when several values can be kept.
    logger.info("Combining columns into lists: emails, phone numbers...")
    concat_cols = {
        "proprietor_phones": ["proprietor_phone_nf", "proprietor_mobile_phone_nf"],
        "proprietor_emails": ["proprietor_email_nf", "proprietor_email_ncp"],
        "operator_phones_nf": ["operator_phone_nf", "operator_mobile_phone_nf"],
        "operator_phones_ne": [
            "operator_phone_1_ne",
            "operator_phone_2_ne",
            "operator_mobile_phone_ne",
        ],
        "operator_phones_pos": [
            "operator_phone_1_pos",
            "operator_phone_2_pos",
            "operator_phone_3_pos",
            "operator_mobile_phone_pos",
        ],
        "vessel_phones": [
            "vessel_phone_1_nf",
            "vessel_phone_2_nf",
            "vessel_phone_3_nf",
            "vessel_mobile_phone_nf",
            "vessel_phone_1_ne",
            "vessel_phone_2_ne",
            "vessel_phone_3_ne",
            "vessel_mobile_phone_ne",
        ],
        "vessel_emails": [
            "vessel_email_1_nf",
            "vessel_email_2_nf",
            "vessel_email_1_ne",
            "vessel_email_2_ne",
        ],
        "declared_fishing_gears": [
            "fishing_gear_main_ncp",
            "fishing_gear_main_nep",
            "fishing_gear_main_nfp",
            "fishing_gear_secondary_ncp",
            "fishing_gear_secondary_nfp",
            "fishing_gear_third_ncp",
            "fishing_gear_third_nfp",
        ],
    }

    res = all_vessels.copy(deep=True)
    for col_name, cols_list in concat_cols.items():
        res.loc[:, col_name] = concatenate_columns(res, cols_list)

    # Replacing empty lists with None values is required to coalesce phones lists
    # properly
    res.operator_phones_pos = res.operator_phones_pos.where(
        res.operator_phones_pos.map(lambda x: x != []), None
    )
    res.operator_phones_nf = res.operator_phones_nf.where(
        res.operator_phones_nf.map(lambda x: x != []), None
    )
    res.operator_phones_ne = res.operator_phones_ne.where(
        res.operator_phones_ne.map(lambda x: x != []), None
    )

    logger.info("Columns combined into lists.")

    # Combine several columns into one value when only one value must be kept.
    logger.info("Combining columns into single values: names, characteristics...")
    combine_cols = {
        "gauge": ["gauge_nf", "gauge_ncp"],
        "operator_name": [
            "operator_name_pos",
            "operator_name_nf",
            "operator_name_ne",
            "operator_name_ncp",
        ],
        "operator_email": [
            "operator_email_pos",
            "operator_email_nf",
            "operator_email_1_ne",
            "operator_email_2_ne",
            "operator_email_ncp",
        ],
        "operator_phones": [
            "operator_phones_pos",
            "operator_phones_nf",
            "operator_phones_ne",
        ],
        "operator_fax": ["operator_fax_pos", "operator_fax_nf", "operator_fax_ne"],
        "operator_mobile_phone": [
            "operator_mobile_phone_pos",
            "operator_mobile_phone_nf",
            "operator_mobile_phone_ne",
        ],
        "proprietor_name": ["proprietor_name_nf", "proprietor_name_ne"],
        "length": ["length_nf", "length_ne", "length_ncp"],
        "power": ["power_nf", "power_ncp"],
        "district": ["district_f", "district_ncp"],
        "vessel_type": ["vessel_type_nf", "vessel_type_ncp"],
        "vessel_mobile_phone": ["vessel_mobile_phone_nf", "vessel_mobile_phone_ne"],
        "vessel_fax": ["vessel_fax_nf", "vessel_fax_ne"],
        "vessel_telex": ["vessel_telex_nf", "vessel_telex_ne"],
    }

    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = coalesce(res[cols_list])
    logger.info("Columns combined into single values.")

    # Rename columns as required in the final data format
    logger.info("Renaming columns...")
    renamed_columns = {
        "id_nav_flotteur_f": "id",
        "imo_f": "imo",
        "cfr_f": "cfr",
        "external_immatriculation_f": "external_immatriculation",
        "mmsi_f": "mmsi",
        "ircs_f": "ircs",
        "vessel_name_f": "vessel_name",
        "flag_state_f": "flag_state",
        "district_code_f": "district_code",
        "registry_port_nf": "registry_port",
        "sailing_types_nf": "sailing_type",
        "width_nf": "width",
    }

    res = res.rename(columns=renamed_columns)
    logger.info("Columns renamed.")

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
        "beacon_number",
        "beacon_status",
        "under_charter",
    ]
    res = res[columns]
    logger.info("Columns sorted.")

    # Fill Nones
    logger.info("Fill None values.")
    res = res.fillna({"under_charter": False})

    return res


@task(checkpoint=False)
def load_vessels(all_vessels):
    all_vessels = all_vessels.astype(
        {
            "imo": str,
            "cfr": str,
            "external_immatriculation": str,
            "mmsi": str,
            "ircs": str,
            "vessel_name": str,
            "flag_state": str,
            "width": float,
            "length": float,
            "district": str,
            "district_code": str,
            "gauge": float,
            "registry_port": str,
            "power": float,
            "vessel_type": str,
            "sailing_category": str,
            "sailing_type": str,
            "nav_licence_expiration_date": "datetime64[ns]",
            "proprietor_name": str,
            "operator_name": str,
            "operator_email": str,
            "operator_fax": str,
            "operator_mobile_phone": str,
            "vessel_mobile_phone": str,
            "vessel_fax": str,
            "vessel_telex": str,
        }
    )

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
    fr_vessels = extract_fr_vessels()
    foreign_vessels = extract_foreign_vessels()
    cee_vessels = extract_cee_vessels()
    non_cee_vessels = extract_non_cee_vessels()
    floats = extract_floats()
    poseidon_vessels = extract_poseidon_vessels()
    licences = extract_nav_licences()
    beacons = extract_beacons()
    control_charters = extract_control_charters()

    # Transform
    beacons = transform_beacons(beacons)
    all_vessels = merge_vessels(
        floats,
        fr_vessels,
        foreign_vessels,
        cee_vessels,
        non_cee_vessels,
        licences,
        beacons,
        control_charters,
        poseidon_vessels,
    )
    all_vessels = clean_vessels(all_vessels)

    # Load
    load_vessels(all_vessels)

flow.file_name = Path(__file__).name
