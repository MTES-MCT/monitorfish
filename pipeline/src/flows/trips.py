import duckdb
import pandas as pd
from prefect import flow, get_run_logger, task

from src.generic_tasks import extract, load


@task
def extract_historical_trips() -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/trips.sql",
    )


@task
def extract_latest_trips(nb_days: int) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/latest_trips.sql",
        params={"nb_days": nb_days},
    )


@task
def merge_trips(
    historical_trips: pd.DataFrame, latest_trips: pd.DataFrame
) -> pd.DataFrame:
    trips = duckdb.sql(
        """
        SELECT
            COALESCE(l.cfr, h.cfr) AS cfr,
            COALESCE(l.trip_number, h.trip_number) AS trip_number,
            COALESCE(l.departure_datetime_utc, h.departure_datetime_utc) AS departure_datetime_utc,
            LEAST(l.first_coe_datetime_utc, h.first_coe_datetime_utc) AS first_coe_datetime_utc,
            GREATEST(l.last_cox_datetime_utc, h.last_cox_datetime_utc) AS last_cox_datetime_utc,
            LEAST(l.first_far_datetime_utc, h.first_far_datetime_utc) AS first_far_datetime_utc,
            GREATEST(l.last_far_datetime_utc, h.last_far_datetime_utc) AS last_far_datetime_utc,
            COALESCE(l.eof_datetime_utc, h.eof_datetime_utc) AS eof_datetime_utc,
            COALESCE(l.return_to_port_datetime_utc, h.return_to_port_datetime_utc) AS return_to_port_datetime_utc,
            COALESCE(l.end_of_landing_datetime_utc, h.end_of_landing_datetime_utc) AS end_of_landing_datetime_utc,
            LEAST(l.sort_order_datetime_utc, h.sort_order_datetime_utc) AS sort_order_datetime_utc,
            ROW_NUMBER() OVER (PARTITION BY COALESCE(l.cfr, h.cfr) ORDER BY LEAST(l.sort_order_datetime_utc, h.sort_order_datetime_utc)) AS sort_order_index
        FROM historical_trips h
        FULL OUTER JOIN latest_trips l
        ON
            h.cfr = l.cfr AND
            h.trip_number = l.trip_number
    """
    ).to_df()

    return trips


@task
def load_trips(trips: pd.DataFrame):
    logger = get_run_logger()
    load(
        df=trips,
        table_name="trips",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )


@flow(name="Trips")
def trips_flow(nb_days: int = 1):
    # Extract
    historical_trips = extract_historical_trips.submit()
    latest_trips = extract_latest_trips.submit(nb_days=nb_days)

    # Transform
    trips = merge_trips(historical_trips, latest_trips)
    # Load
    load_trips(trips)
