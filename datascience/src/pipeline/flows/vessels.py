import numpy as np
import pandas as pd
import prefect
from prefect import Flow, task
from sqlalchemy import ARRAY, Date, Float, Integer, MetaData, String, Table
from sqlalchemy.exc import InvalidRequestError

from src.db_config import create_engine
from src.pipeline.processing import (
    combine_overlapping_columns,
    concatenate_columns,
    python_lists_to_psql_arrays,
)
from src.pipeline.utils import delete
from src.read_query import read_saved_query
from src.utils.database import psql_insert_copy


@task
def extract_fr_vessels():
    res = read_saved_query("ocan", "pipeline/queries/ocan/navires_fr.sql")

    # Sparse data type takes up less memory
    sparse_columns = {
        "length_nf": pd.SparseDtype("float", None),
        "width_nf": pd.SparseDtype("float", None),
        "gauge_nf": pd.SparseDtype("float", None),
        "power_nf": pd.SparseDtype("float", None),
    }

    for c, t in sparse_columns.items():
        res[c] = res[c].astype(t)

    # For string data, pd.SparseDtype does not reduce memory usage much.
    # Using pd.Categorical reduces memory usage much more.
    categorical_columns = [
        "vessel_phone_1_nf",
        "vessel_phone_2_nf",
        "vessel_phone_3_nf",
        "vessel_phone_4_nf",
        "vessel_email_1_nf",
        "vessel_email_2_nf",
        "operator_name_nf",
        "operator_email_nf",
        "operator_phone_1_nf",
        "operator_phone_2_nf",
        "proprietor_name_nf",
        "proprietor_email_nf",
        "proprietor_phone_1_nf",
        "proprietor_phone_2_nf",
        "vessel_type_nf",
        "registry_port_nf",
        "sailing_types_nf",
        "fishing_gear_main_nfp",
        "fishing_gear_secondary_nfp",
        "fishing_gear_third_nfp",
    ]

    for c in categorical_columns:
        res[c] = res[c].astype("category")

    return res


@task
def extract_cee_vessels():
    res = read_saved_query("ocan", "pipeline/queries/ocan/navires_cee_peche.sql")
    categorical_columns = [
        "fishing_gear_main_ncp",
        "fishing_gear_secondary_ncp",
        "fishing_gear_third_ncp",
        "vessel_type_ncp",
        "district_ncp",
        "operator_name_ncp",
        "operator_email_ncp",
        "proprietor_email_ncp",
    ]

    for c in categorical_columns:
        res[c] = res[c].astype("category")

    sparse_columns = {
        "length_ncp": pd.SparseDtype("float", None),
        "gauge_ncp": pd.SparseDtype("float", None),
        "power_ncp": pd.SparseDtype("float", None),
    }

    for c, t in sparse_columns.items():
        res[c] = res[c].astype(t)

    return res


@task
def extract_non_cee_vessels():
    res = read_saved_query("ocan", "pipeline/queries/ocan/navires_hors_cee_peche.sql")

    categorical_columns = ["fishing_gear_main_nep"]
    for c in categorical_columns:
        res[c] = res[c].astype("category")

    return res


@task
def extract_floats():
    res = read_saved_query("ocan", "pipeline/queries/ocan/flotteurs.sql")

    categorical_columns = [
        "imo_f",
        "cfr_f",
        "external_immatriculation_f",
        "vessel_name_f",
        "ircs_f",
        "mmsi_f",
        "flag_state_f",
        "district_code_f",
        "district_f",
    ]

    for c in categorical_columns:
        res[c] = res[c].astype("category")

    return res


@task
def extract_nav_licences():
    res = read_saved_query("ocan", "pipeline/queries/ocan/permis_navigation.sql")

    categorical_columns = ["sailing_category", "nav_licence_expiration_date"]

    for c in categorical_columns:
        res[c] = res[c].astype("category")

    return res


@task
def merge_vessels(floats, fr_vessels, cee_vessels, non_cee_vessels, licences):
    res = pd.merge(
        floats,
        fr_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_nf",
    )

    res = pd.merge(
        res,
        cee_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_ncp",
    )

    res = pd.merge(
        res,
        non_cee_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_nep",
    )

    res = pd.merge(
        res,
        licences,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_gin",
    )
    return res


@task
def clean(all_vessels):

    logger = prefect.context.get("logger")

    # Concatenate several columns into lists when several values can be kept.
    logger.info("Combining columns into lists: emails, phone numbers...")
    concat_cols = {
        "proprietor_phones": ["proprietor_phone_1_nf", "proprietor_phone_2_nf"],
        "proprietor_emails": ["proprietor_email_nf", "proprietor_email_ncp"],
        "operator_phones": ["operator_phone_1_nf", "operator_phone_2_nf"],
        "operator_emails": ["operator_email_ncp", "operator_email_nf"],
        "vessel_phones": [
            "vessel_phone_1_nf",
            "vessel_phone_2_nf",
            "vessel_phone_3_nf",
            "vessel_phone_4_nf",
        ],
        "vessel_emails": ["vessel_email_1_nf", "vessel_email_2_nf"],
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
    cols_to_drop = []
    res = all_vessels.copy(deep=True)
    for col_name, cols_list in concat_cols.items():
        res.loc[:, col_name] = concatenate_columns(res, cols_list)
        cols_to_drop += cols_list
    res = res.drop(columns=cols_to_drop)
    logger.info("Columns combined into lists.")

    # Combine several columns into one value when only one value must be kept.
    logger.info("Combining columns into single values: names, characteristics...")
    combine_cols = {
        "gauge": ["gauge_nf", "gauge_ncp"],
        "operator_name": ["operator_name_nf", "operator_name_ncp"],
        "length": ["length_nf", "length_ncp"],
        "power": ["power_nf", "power_ncp"],
        "district": ["district_f", "district_ncp"],
        "vessel_type": ["vessel_type_ncp", "vessel_type_nf"],
    }

    cols_to_drop = []
    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = combine_overlapping_columns(res, cols_list)
        cols_to_drop += cols_list
    res = res.drop(columns=cols_to_drop)
    logger.info("Columns combined into single values.")

    # Rename columns as required in the final data format
    logger.info("Renaming columns...")
    renamed_columns = {
        "cfr_f": "cfr",
        "flag_state_f": "flag_state",
        "id_nav_flotteur_f": "id",
        "imo_f": "imo",
        "ircs_f": "ircs",
        "mmsi_f": "mmsi",
        "external_immatriculation_f": "external_immatriculation",
        "registry_port_nf": "registry_port",
        "sailing_types_nf": "sailing_type",
        "vessel_name_f": "vessel_name",
        "width_nf": "width",
        "district_code_f": "district_code",
        "proprietor_name_nf": "proprietor_name",
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
        "operator_emails",
        "vessel_phones",
        "vessel_emails",
    ]
    res = res[columns]
    logger.info("Columns sorted.")
    return res


@task()
def load_vessels(all_vessels):

    schema = "public"
    table = "vessels"

    all_vessels = python_lists_to_psql_arrays(
        all_vessels,
        [
            "declared_fishing_gears",
            "operator_phones",
            "operator_emails",
            "proprietor_phones",
            "proprietor_emails",
            "vessel_phones",
            "vessel_emails",
        ],
    )

    engine = create_engine("monitorfish_remote")
    logger = prefect.context.get("logger")

    with engine.begin() as connection:
        meta = MetaData(schema=schema)
        meta.bind = connection
        try:
            logger.info("Searching for vessels table...")
            meta.reflect(only=[table])
            vessels_table = Table(table, meta, mustexist=True)
            logger.info("vessels table found.")
        except InvalidRequestError:
            logger.error(
                "vessels table must exist. Make appropriate migrations and try again."
            )
            raise

        logger.info("Deleting all rows from vessels table.")
        delete(vessels_table, connection, logger)

        # Sparse and Categorical data columns must be converted back to the original,
        # dense data types before being inserted into the database.
        # Doing so on the whole Dataframe takes too much memory, so the sparse /
        # categorically typed Dataframe is chunked into small pieces, and each chunk
        # is converted back to dense data and inserted into the database one at a time,
        # thus limiting the increase in memory usage.
        chunks = np.array_split(all_vessels, 150)
        for i, chunk in enumerate(chunks):
            logger.info(f"Inserting chunk {i}.")
            chunk = chunk.astype(
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
                    "proprietor_name": str,
                    "operator_name": str,
                    "nav_licence_expiration_date": "datetime64[ns]",
                }
            )

            chunk["width"] = np.asarray(chunk["width"])

            chunk.to_sql(
                name=table,
                con=connection,
                schema=schema,
                index=False,
                method=psql_insert_copy,
                if_exists="append",
            )


with Flow("Extract vessels characteristics") as flow:
    # Extract
    fr_vessels = extract_fr_vessels()
    cee_vessels = extract_cee_vessels()
    non_cee_vessels = extract_non_cee_vessels()
    floats = extract_floats()
    licences = extract_nav_licences()
    # Transform
    all_vessels = merge_vessels(
        floats, fr_vessels, cee_vessels, non_cee_vessels, licences
    )
    all_vessels = clean(all_vessels)

    # Load
    load_vessels(all_vessels)


if __name__ == "__main__":
    flow.run()
