import pandas as pd
import prefect
from prefect import task

from src.db_config import create_engine
from src.pipeline.utils import delete, get_table, psql_insert_copy


@task(checkpoint=False)
def load(
    df: pd.DataFrame,
    table_name: str,
    schema: str = "public",
    db_name: str = "monitorfish_remote",
    delete_before_insert: bool = True,
):
    e = create_engine(db_name)
    logger = prefect.context.get("logger")

    table = get_table(table_name, schema, e, logger)

    with e.begin() as connection:

        if delete_before_insert:
            # Delete all rows from table
            delete(table, connection, logger)

        # Insert data into table
        df.to_sql(
            name=table_name,
            con=connection,
            schema=schema,
            index=False,
            method=psql_insert_copy,
            if_exists="append",
        )
