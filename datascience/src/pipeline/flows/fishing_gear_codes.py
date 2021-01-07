import pandas as pd
from prefect import Flow, task
from sqlalchemy import String
from src.db_config import create_engine
from src.read_query import read_saved_query


@task
def extract_fishing_gear_codes():
    fishing_gear_codes = read_saved_query(
        "ocani", "pipeline/queries/ocan/codes_engins.sql"
    )

    return fishing_gear_codes


@task
def fill_missing_categories(fishing_gear_codes):

    fishing_gear_codes = fishing_gear_codes.set_index("fishing_gear_code")

    missing_categories = set(
        fishing_gear_codes[fishing_gear_codes["fishing_gear_category"].isna()].index
    )

    backup_categories = {
        "OTP": "Chaluts",
        "NS": "Engin inconnu",
        "DRM": "Dragues",
        "OTS": "Engin inconnu",
        "SUX": "Filets tournants",
    }

    to_fill_categories = {
        gear_code: category
        for gear_code, category in backup_categories.items()
        if gear_code in missing_categories
    }

    for (gear_code, category) in to_fill_categories.items():
        fishing_gear_codes.loc[gear_code, "fishing_gear_category"] = category

    fishing_gear_codes = fishing_gear_codes.reset_index()

    return fishing_gear_codes


@task
def load_fishing_gear_codes(fishing_gear_codes):

    schema = "public"
    table = "fishing_gear_codes"

    # Ensure column order
    fishing_gear_codes = fishing_gear_codes[
        ["fishing_gear_code", "fishing_gear", "fishing_gear_category"]
    ]

    engine = create_engine("monitorfish_remote_i")

    with engine.begin() as connection:
        fishing_gear_codes.to_sql(
            name=table,
            con=connection,
            schema=schema,
            if_exists="replace",
            index=False,
            dtype={
                "fishing_gear_code": String(100),
                "fishing_gear": String(200),
                "fishing_gear_category": String(200),
            },
        )

        connection.execute(
            f"ALTER TABLE {schema}.{table} ADD PRIMARY KEY (fishing_gear_code);"
        )


with Flow("Update fishing gears reference") as flow:
    fishing_gear_codes = extract_fishing_gear_codes()
    fishing_gear_codes = fill_missing_categories(fishing_gear_codes)
    load_fishing_gear_codes(fishing_gear_codes)


if __name__ == "__main__":
    flow.run()
