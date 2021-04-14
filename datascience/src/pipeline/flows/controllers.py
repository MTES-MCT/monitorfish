import pandas as pd
import prefect
from prefect import Flow, task

from src.db_config import create_engine
from src.pipeline.utils import delete, get_table, psql_insert_copy
from src.read_query import read_saved_query


@task(checkpoint=False)
def extract_controllers():
    controllers = read_saved_query("fmc", "pipeline/queries/fmc/controllers.sql")

    return controllers


@task(checkpoint=False)
def load_controllers(controllers):

    logger = prefect.context.get("logger")

    schema = "public"
    table_name = "controllers"

    engine = create_engine("monitorfish_remote")
    controllers_table = get_table(table_name, schema, engine, logger)

    with engine.begin() as connection:

        # Delete all rows from table
        delete(controllers_table, connection, logger)

        # Insert data into
        controllers.to_sql(
            name=table_name,
            con=connection,
            schema=schema,
            index=False,
            method=psql_insert_copy,
            if_exists="append",
        )


with Flow("Update controllers reference") as flow:
    controllers = extract_controllers()
    load_controllers(controllers)
