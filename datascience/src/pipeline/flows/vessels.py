import pandas as pd
from prefect import Flow, task
from prefect.engine.results import LocalResult
from prefect.engine.serializers import PandasSerializer
from sqlalchemy import ARRAY, Boolean, Column, Date, Float, Integer, String
from src.db_config import create_engine
from src.pipeline.processing import (combine_overlapping_columns,
                                     concatenate_columns,
                                     python_lists_to_psql_arrays)
from src.read_query import read_saved_query
from src.utils.database import psql_insert_copy

serializer = PandasSerializer(file_type="csv", serialize_kwargs={"index": False})

result = LocalResult(
    dir="/home/jovyan/work/data/pipeline/vessels",
    location="{task_name}_{date:%Y-%m-%d-%H:%M:%S}.csv",
    serializer=serializer,
)


@task
def extract_fr_vessels():
    return read_saved_query("ocani", "pipeline/queries/ocan/navires_fr.sql")


@task
def extract_cee_vessels():
    return read_saved_query("ocani", "pipeline/queries/ocan/navires_cee_peche.sql")


@task
def extract_non_cee_vessels():
    return read_saved_query("ocani", "pipeline/queries/ocan/navires_hors_cee_peche.sql")


@task
def extract_floats():
    return read_saved_query("ocani", "pipeline/queries/ocan/flotteurs.sql")


@task
def extract_nav_licences():
    return read_saved_query("ocani", "pipeline/queries/gina/permis_navigation.sql")


@task
def merge_fr(floats, fr_vessels):
    res = pd.merge(
        floats,
        fr_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_nf",
    )
    return res


@task
def merge_cee(floats, cee_vessels):
    res = pd.merge(
        floats,
        cee_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_ncp",
    )
    return res


@task
def merge_non_cee(floats, non_cee_vessels):
    res = pd.merge(
        floats,
        non_cee_vessels,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_nep",
    )
    return res


@task
def merge_licences(floats, licences):
    res = pd.merge(
        floats,
        licences,
        how="left",
        left_on="id_nav_flotteur_f",
        right_on="id_nav_flotteur_gin",
    )
    return res


@task
def concat_columns_into_list(all_vessels):

    concat_cols = {
        "fisher_phones": [
            "fisher_phone_1_nf",
            "fisher_phone_2_nf",
            "fisher_phone_3_nf",
            "fisher_phone_4_nf",
            "fisher_phone_5_nf",
            "fisher_phone_nf",
        ],
        "fisher_emails": ["fisher_email_1_nf", "fisher_email_2_nf", "fisher_email_nf"],
        "declared_fishing_gears": [
            "fishing_gear_main_ncp",
            "fishing_gear_main_nep",
            "fishing_gear_main_nfp",
            "fishing_gear_secondary_ncp",
            "fishing_gear_secondary_nfp",
            "fishing_gear_third_ncp",
            "fishing_gear_third_nfp",
        ],
        "shipowner_emails": ["shipowner_email_ncp", "shipowner_email_nf"],
        "shipowner_phones": ["shipowner_phone_1_nf", "shipowner_phone_nf"],
    }
    cols_to_drop = []
    res = all_vessels.copy(deep=True)
    for col_name, cols_list in concat_cols.items():
        res.loc[:, col_name] = concatenate_columns(res, cols_list)
        cols_to_drop += cols_list
    res = res.drop(columns=cols_to_drop)

    return res


@task
def combine_columns_into_value(all_vessels):
    combine_cols = {
        "gauge": ["gauge_nf", "gauge_ncp"],
        "shipowner_name": ["shipowner_name_nf", "shipowner_name_ncp"],
        "length": ["length_nf", "length_ncp"],
        "power": ["power_nf", "power_ncp"],
        "district": ["district_f", "district_ncp"],
        "vessel_type": ["vessel_type_ncp", "vessel_type_nf"],
    }

    cols_to_drop = []
    res = all_vessels.copy(deep=True)
    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = combine_overlapping_columns(res, cols_list)
        cols_to_drop += cols_list
    res = res.drop(columns=cols_to_drop)

    return res


@task
def rename_columns(all_vessels):

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
        "fisher_name_nf": "fisher_name",
    }

    all_vessels = all_vessels.rename(columns=renamed_columns)
    return all_vessels


@task
def drop_sort_columns(all_vessels):
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
        "weight_authorized_on_deck",
        "nav_licence_expiration_date",
        "shipowner_name",
        "shipowner_phones",
        "shipowner_emails",
        "fisher_name",
        "fisher_phones",
        "fisher_emails",
    ]

    all_vessels["weight_authorized_on_deck"] = None

    return all_vessels[columns]


@task()
def load_vessels(all_vessels):

    schema = "public"
    table = "vessels"

    all_vessels = python_lists_to_psql_arrays(
        all_vessels,
        [
            "declared_fishing_gears",
            "shipowner_phones",
            "shipowner_emails",
            "fisher_phones",
            "fisher_emails",
        ],
    )

    engine = create_engine("monitorfish_remote_i")

    with engine.begin() as connection:

        all_vessels.to_sql(
            name=table,
            con=connection,
            schema=schema,
            index=False,
            method=psql_insert_copy,
            if_exists="replace",
            dtype={
                "id": Integer,
                "imo": String(100),
                "cfr": String(100),
                "external_immatriculation": String(100),
                "mmsi": String(100),
                "ircs": String(100),
                "vessel_name": String(100),
                "flag_state": String(100),
                "width": Float,
                "length": Float,
                "district": String(100),
                "district_code": String(2),
                "gauge": Float,
                "registry_port": String(200),
                "power": Float,
                "vessel_type": String(200),
                "sailing_category": String(200),
                "sailing_type": String(200),
                "declared_fishing_gears": ARRAY(String(100)),
                "weight_authorized_on_deck": Float,
                "nav_licence_expiration_date": Date,
                "shipowner_name": String(200),
                "shipowner_phones": ARRAY(String(100)),
                "shipowner_emails": ARRAY(String(100)),
                "fisher_name": String(200),
                "fisher_phones": ARRAY(String(100)),
                "fisher_emails": ARRAY(String(100)),
            },
        )

        connection.execute(f"ALTER TABLE {schema}.{table} ADD PRIMARY KEY (id);")


with Flow("Extract vessels characteristics", result=result) as flow:
    # Extract
    fr_vessels = extract_fr_vessels()
    cee_vessels = extract_cee_vessels()
    non_cee_vessels = extract_non_cee_vessels()
    floats = extract_floats()
    licences = extract_nav_licences()

    # Transform
    fr_vessels_floats = merge_fr(floats, fr_vessels)
    fr_cee_vessels_floats = merge_cee(fr_vessels_floats, cee_vessels)
    all_vessels = merge_non_cee(fr_cee_vessels_floats, non_cee_vessels)
    all_vessels = merge_licences(all_vessels, licences)
    all_vessels = concat_columns_into_list(all_vessels)
    all_vessels = combine_columns_into_value(all_vessels)
    all_vessels = rename_columns(all_vessels)
    all_vessels = drop_sort_columns(all_vessels)

    # Load
    load_vessels(all_vessels)


if __name__ == "__main__":
    flow.run()
