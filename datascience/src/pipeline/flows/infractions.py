import pandas as pd
import prefect
from prefect import Flow, task

from src.db_config import create_engine
from src.pipeline.utils import delete
from src.read_query import read_saved_query
from src.utils.database import get_table, psql_insert_copy


@task(checkpoint=False)
def extract_infractions():
    infractions = read_saved_query("fmc", "pipeline/queries/fmc/natinf.sql")

    return infractions


@task(checkpoint=False)
def clean_infractions(infractions):
    infractions.loc["infraction"] = infractions.infraction.map(str.capitalize)

    return infractions


@task(checkpoint=False)
def load_infractions(infractions):

    logger = prefect.context.get("logger")

    schema = "public"
    table_name = "infractions"

    engine = create_engine("monitorfish_remote")
    infractions_table = get_table(table_name, schema, engine, logger)

    with engine.begin() as connection:

        # Delete all rows from table
        delete(infractions_table, connection, logger)

        # Insert data into
        infractions.to_sql(
            name=table_name,
            con=connection,
            schema=schema,
            index=False,
            method=psql_insert_copy,
            if_exists="append",
        )


with Flow("Update infractions reference") as flow:
    infractions = extract_infractions()
    infractions = clean_infractions(infractions)
    load_infractions(infractions)
