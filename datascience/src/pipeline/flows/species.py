import pandas as pd
from prefect import Flow, task
from sqlalchemy import Integer, MetaData, String

from src.db_config import create_engine
from src.read_query import read_saved_query
from src.utils.database import psql_insert_copy


@task
def extract_species():
    return read_saved_query("fmcit", "pipeline/queries/fmc/species.sql")


@task
def load_species(species: pd.DataFrame):

    schema = "public"
    table_name = "species"
    engine = create_engine("monitorfish_remote_i")

    if engine.has_table(table_name=table_name, schema=schema):
        table_already_exists = True
        meta = MetaData(engine)
        meta.reflect(schema=schema, only=[table_name])
        table = meta.tables[f"{schema}.{table_name}"]
    else:
        table_already_exists = False

    with engine.begin() as connection:
        if table_already_exists:
            connection.execute(table.delete())

        species.to_sql(
            name=table_name,
            con=connection,
            schema=schema,
            index=False,
            method=psql_insert_copy,
            if_exists="append",
            dtype={
                "id": Integer,
                "species_code": String(3),
                "species_name": String(50),
                "species_group_code": String(3),
                "species_group_name": String(50),
                "source": String(10),
            },
        )

        if not table_already_exists:
            connection.execute(
                f"ALTER TABLE {schema}.{table_name} ADD PRIMARY KEY (id);"
            )


with Flow("Extract species codes") as flow:
    # Extract
    species = extract_species()

    # Load
    load_species(species)


if __name__ == "__main__":
    flow.run()
