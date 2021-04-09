import prefect
from prefect import Flow, task
from sqlalchemy import String

from src.db_config import create_engine
from src.pipeline.utils import delete, get_table, psql_insert_copy
from src.read_query import read_saved_query


@task(checkpoint=False)
def extract_fishing_gear_codes():
    fishing_gear_codes = read_saved_query("ocan", "ocan/codes_engins.sql")

    return fishing_gear_codes


@task(checkpoint=False)
def clean(fishing_gear_codes):

    fishing_gear_codes = fishing_gear_codes.set_index("fishing_gear_code")

    # Manual changes
    name_changes = {
        "TBS": "Chaluts de fond à crevettes",
        "TMS": "Chaluts pélagiques à crevettes",
    }

    for (gear_code, name) in name_changes.items():
        fishing_gear_codes.loc[gear_code, "fishing_gear"] = name

    category_changes = {
        "OTP": "Chaluts",
        "NS": "Engin inconnu",
        "DRM": "Dragues",
        "OTS": "Engin inconnu",
        "SUX": "Filets tournants",
        "PS1": "Filets tournants",
        "PS2": "Filets tournants",
    }

    for (gear_code, category) in category_changes.items():
        fishing_gear_codes.loc[gear_code, "fishing_gear_category"] = category

    fishing_gear_codes = fishing_gear_codes.reset_index()

    return fishing_gear_codes


@task(checkpoint=False)
def load_fishing_gear_codes(fishing_gear_codes):

    logger = prefect.context.get("logger")

    schema = "public"
    table_name = "fishing_gear_codes"

    engine = create_engine("monitorfish_remote")
    gears_table = get_table(table_name, schema, engine, logger)

    with engine.begin() as connection:

        # Delete all rows from table
        delete(gears_table, connection, logger)

        # Insert data into
        fishing_gear_codes.to_sql(
            name=table_name,
            con=connection,
            schema=schema,
            index=False,
            method=psql_insert_copy,
            if_exists="append",
        )


with Flow("Update fishing gears reference") as flow:
    fishing_gear_codes = extract_fishing_gear_codes()
    fishing_gear_codes = clean(fishing_gear_codes)
    load_fishing_gear_codes(fishing_gear_codes)
