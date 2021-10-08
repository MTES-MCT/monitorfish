import pandas as pd
import prefect
from prefect import Flow, task

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.utils import psql_insert_copy


@task(checkpoint=False)
def extract_computed_trip_numbers() -> pd.DataFrame:
    """
    Extract a computed `trip_number` for ERS messages of type 'DAT' that do not have a
    trip number.

    For each vessel and each year, a new trip is detected when a DEP or a LAN message
    occurs.

    Returns:
        pd.DataFrame : Dataframe of computed trip numbers with id and
          trip_number columns
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/missing_trip_numbers.sql",
    )


@task(checkpoint=False)
def load_computed_trip_numbers(computed_trip_numbers: pd.DataFrame):
    """
    Updates the `ers` table. Computed trip numbers are added to the trip_number
    column of the table.

    Args:
        computed_trip_numbers (pd.DataFrame) : output of extract_computed_trip_numbers.
          Dataframe of computed trip numbers with id and trip_number columns
    """

    e = create_engine("monitorfish_remote")

    with e.begin() as connection:
        connection.execute(
            """
            CREATE TEMP TABLE tmp_computed_trip_numbers(
                id INTEGER PRIMARY KEY,
                trip_number INTEGER
            )
            ON COMMIT DROP;
            """
        )

        computed_trip_numbers.to_sql(
            "tmp_computed_trip_numbers",
            connection,
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )

        connection.execute(
            """
            UPDATE public.ers e
                SET trip_number = t.trip_number,
                SET trip_number_was_computed = TRUE
            FROM tmp_computed_trip_numbers t
            WHERE e.id = t.id;
        """
        )


with Flow("Missing trip number") as flow:
    computed_trip_numbers = extract_computed_trip_numbers()
    load_computed_trip_numbers(computed_trip_numbers)
