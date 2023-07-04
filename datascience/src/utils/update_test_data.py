from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from prefect import Flow, task
from sqlalchemy import text

from src.read_query import read_query
from src.utils.anonymization import DataAnonymizer

da = DataAnonymizer()


@task(checkpoint=False)
def extract_last_positions():
    query = text("SELECT * " "FROM last_positions")

    last_positions = read_query(query, db="monitorfish_remote")
    last_positions = last_positions.astype({"emission_period": str})
    last_positions.loc[:, "trip_number"] = last_positions.trip_number.map(
        lambda x: str(int(x)), na_action="ignore"
    ).replace([np.nan], [None])

    last_positions.loc[:, "emission_period"] = last_positions.emission_period.replace(
        ["NaT", np.nan], [None, None]
    )
    return last_positions


@task(checkpoint=False)
def extract_positions():
    query = text(
        "SELECT "
        "internal_reference_number, "
        "external_reference_number, "
        "mmsi, "
        "ircs, "
        "vessel_name, "
        "flag_state, "
        "from_country, "
        "destination_country, "
        "trip_number, "
        "latitude, "
        "longitude, "
        "speed, "
        "course, "
        "date_time, "
        "position_type "
        "FROM positions "
        "WHERE date_time > CURRENT_TIMESTAMP - INTERVAL '3 days' "
        "AND date_time < CURRENT_TIMESTAMP"
    )
    return read_query(query, db="monitorfish_remote")


@task(checkpoint=False)
def anonymize_positions(positions: pd.DataFrame) -> pd.DataFrame:

    positions = positions.copy(deep=True)

    positions["internal_reference_number"] = da.anonymize_cfr_arr(
        positions["internal_reference_number"]
    )

    positions["external_reference_number"] = da.anonymize_external_immatriculation_arr(
        positions["external_reference_number"]
    )

    positions["mmsi"] = da.anonymize_mmsi_arr(positions["mmsi"])
    positions["ircs"] = da.anonymize_ircs_arr(positions["ircs"])
    positions["vessel_name"] = da.anonymize_vessel_name_arr(positions["vessel_name"])

    return positions


@task(checkpoint=False)
def anonymize_last_positions(last_positions: pd.DataFrame) -> pd.DataFrame:

    last_positions = last_positions.copy(deep=True)

    last_positions["cfr"] = da.anonymize_cfr_arr(last_positions["cfr"])

    last_positions[
        "external_immatriculation"
    ] = da.anonymize_external_immatriculation_arr(
        last_positions["external_immatriculation"]
    )

    last_positions["mmsi"] = da.anonymize_mmsi_arr(last_positions["mmsi"])
    last_positions["ircs"] = da.anonymize_ircs_arr(last_positions["ircs"])

    last_positions["vessel_name"] = da.anonymize_vessel_name_arr(
        last_positions["vessel_name"]
    )

    last_positions["registry_port"] = da.anonymize_registry_port_arr(
        last_positions["registry_port"]
    )
    last_positions["district"] = da.anonymize_district_arr(last_positions["district"])
    last_positions["district_code"] = da.anonymize_district_code_arr(
        last_positions["district_code"]
    )

    return last_positions


@task(checkpoint=False)
def get_timedelta(s: pd.Series) -> timedelta:
    """
    Takes a ``pandas.Series`` of ``datetime`` dtype, returns the ``timedelta``
    between its maximum and January 1st 2021 ``s.max() - datetime(2021, 1, 1)``
    """
    return s.max() - datetime(2021, 1, 1)


@task(checkpoint=False)
def shift_positions_datetimes(
    df: pd.DataFrame, datetime_column: str, td: timedelta
) -> pd.DataFrame:
    """
    Takes a ``pandas.DataFrame`` containing a column of ``datetime`` dtype, shifts all
    values of the datetime column by ``-td`` and return the modified dataframe, all other
    columns untouched.
    """
    df = df.copy(deep=True)
    df[datetime_column] = df[datetime_column] - td
    return df


@task(checkpoint=False)
def shift_last_positions_datetimes(
    df: pd.DataFrame, datetime_column: str, td: timedelta
) -> pd.DataFrame:
    """
    Takes a ``pandas.DataFrame`` containing a column of ``datetime`` dtype, shifts all
    values of the datetime column by ``-td`` and return the modified dataframe, all other
    columns untouched.
    """
    df = df.copy(deep=True)
    df[datetime_column] = df[datetime_column] - td
    return df


with Flow("Test data") as flow:
    positions = extract_positions()
    last_positions = extract_last_positions()
    positions = anonymize_positions(positions)
    last_positions = anonymize_last_positions(last_positions)
    td = get_timedelta(positions["date_time"])
    positions = shift_positions_datetimes(positions, "date_time", td)
    last_positions = shift_last_positions_datetimes(
        last_positions, "last_position_datetime_utc", td
    )
    last_positions = shift_last_positions_datetimes(
        last_positions, "last_logbook_message_datetime_utc", td
    )
    last_positions = shift_last_positions_datetimes(
        last_positions, "departure_datetime_utc", td
    )
    last_positions = shift_last_positions_datetimes(
        last_positions, "last_control_datetime_utc", td
    )
