import pandas as pd
from prefect import flow, task
from sqlalchemy import text

from src.db_config import create_engine
from src.generic_tasks import extract
from src.utils import psql_insert_copy


@task
def reset_computed_trip_numbers():
    e = create_engine("monitorfish_remote")

    with e.begin() as connection:
        connection.execute(
            text(
                """
            UPDATE public.logbook_reports
            SET
                trip_number = NULL,
                trip_number_was_computed = false
            WHERE trip_number_was_computed;
            """
            )
        )


@task
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


@task
def load_computed_trip_numbers(computed_trip_numbers: pd.DataFrame):
    """
    Updates the `logbook_reports` table. Computed trip numbers are added to the trip_number
    column of the table.

    Args:
        computed_trip_numbers (pd.DataFrame) : output of extract_computed_trip_numbers.
          Dataframe of computed trip numbers with id and trip_number columns
    """

    e = create_engine("monitorfish_remote")

    with e.begin() as connection:
        connection.execute(
            text(
                """
            CREATE TEMP TABLE tmp_computed_trip_numbers(
                id INTEGER PRIMARY KEY,
                trip_number VARCHAR
            )
            ON COMMIT DROP;
            """
            )
        )

        computed_trip_numbers.to_sql(
            "tmp_computed_trip_numbers",
            connection,
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )

        connection.execute(
            text(
                """
            UPDATE public.logbook_reports r
            SET
                trip_number = t.trip_number,
                trip_number_was_computed = true
            FROM tmp_computed_trip_numbers t
            WHERE r.id = t.id
            AND (r.trip_number_was_computed OR r.trip_number IS NULL)
            ;
        """
            )
        )


@flow(name="Monitorfish - Missing trip number")
def missing_trip_numbers_flow(reset_trip_numbers: bool = False):
    if reset_trip_numbers:
        reset_computed_trip_numbers()

    computed_trip_numbers = extract_computed_trip_numbers()
    load_computed_trip_numbers(computed_trip_numbers)
