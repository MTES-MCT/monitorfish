import os
from datetime import datetime, timedelta

import pandas as pd
import requests
from prefect import task

from config import HEALTHCHECK_ENDPOINT
from src.pipeline.entities.monitorfish_healthcheck import MonitorfishHealthcheck
from src.pipeline.exceptions import MonitorfishHealthError
from src.pipeline.generic_tasks import extract


@task(checkpoint=False)
def get_monitorfish_healthcheck() -> MonitorfishHealthcheck:
    """
    Fetches healthcheck on Monitorfish healthcheck endpoint.

    Returns:
        MonitorfishHealthcheck
    """

    for proxy_var in ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]:
        os.environ.pop(proxy_var, None)

    r = requests.get(HEALTHCHECK_ENDPOINT)
    r.raise_for_status()

    return MonitorfishHealthcheck.from_json(r.json())


@task(checkpoint=False)
def extract_monitorfish_recent_positions_histogram() -> pd.DataFrame:
    """
    Extracts the histogram of positions in the positions table by hour over the last 48
    hours.

    Returns:
        pd.DataFrame: `DataFrame` with 2 columns :

          - datetime_utc_hour
          - number_of_positions
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/recent_positions_histogram.sql",
        parse_dates=["datetime_utc_hour"],
    )


@task(checkpoint=False)
def assert_positions_health(
    healthcheck: MonitorfishHealthcheck,
    recent_positions_histogram: pd.DataFrame,
    utcnow: datetime = None,
    max_minutes_without_data: int = 10,
    min_number_of_positions_by_hour: int = 750,
):
    """
    Checks :

      - if the `date_position_received` of the input `MonitorfishHealthcheck` is within
        `max_minutes_without_data` minutes of `utcnow`.
      - if input the `recent_positions_histogram` contains the 48 hours before `utcnow`
        and has at least `min_number_of_positions_by_hour` for each 1 hour bin.

    Args:
        healthcheck (MonitorfishHealthcheck): `MonitorfishHealthcheck` to check.
        recent_positions_histogram (pd.DataFrame): `DataFrame` giving the number of
          positions by hour in the `positions` table in the last 48 hours.
        utcnow (datetime, optional): Date with which to compare the latest
          position's reception date and from which the `recent_positions_histogram` is
          expected to be supplied.
          If not supplied, the current server time is used. Defaults to None.
        max_minutes_without_data (int, optional): maximum number of minutes allow
          between `date_position_received` and `utcnow`. Defaults to 10.
        min_number_of_positions_by_hour (int, optional): Minimum number of positions by
          allow in the `recent_positions_histogram`. Defaults to 750.
    Raises:
        MonitorfishHealthError: If the most recent data received is older than
          `max_minutes_without_data`.
    """
    if not utcnow:
        utcnow = datetime.utcnow()

    time_without_data = utcnow - healthcheck.date_position_received
    minutes_without_data = time_without_data.total_seconds() / 60

    try:
        assert minutes_without_data <= max_minutes_without_data
    except AssertionError:
        raise MonitorfishHealthError(
            (
                f"The most recent position is too old: it is {minutes_without_data} "
                "minutes old whereas it should be less than "
                f"{max_minutes_without_data} minutes old."
            )
        )

    truncated_utwnow = utcnow.replace(minute=0, second=0, microsecond=0)
    expected_datetime_utc_hour = pd.Series(
        [truncated_utwnow - timedelta(hours=i) for i in range(48, 0, -1)]
    )

    try:
        assert len(recent_positions_histogram) == 48
        assert (
            recent_positions_histogram.datetime_utc_hour == expected_datetime_utc_hour
        ).all()
    except AssertionError:
        raise MonitorfishHealthError(
            "The recent positions histogram does not have the expected 48 hours."
        )

    try:
        assert (
            recent_positions_histogram.number_of_positions
            >= min_number_of_positions_by_hour
        ).all()
    except AssertionError:
        raise MonitorfishHealthError(
            (
                "The recent positions histogram has at least one hour with a number "
                "of positions below the `min_number_of_positions_by_hour` parameter."
            )
        )


@task(checkpoint=False)
def assert_last_positions_health(
    healthcheck: MonitorfishHealthcheck,
    utcnow: datetime = None,
    max_minutes_without_data: int = 10,
):
    """
    Checks if the date_time of most recent `last_position` is in the last
    `max_minutes_without_data` minutes in the input `MonitorfishHealthcheck`.

    Args:
        healthcheck (MonitorfishHealthcheck): `MonitorfishHealthcheck` to check.
        utcnow (datetime, optional): Date with which to compare the latest
          last_position's reception date. If not supplied, the current server time is
          used. Defaults to None.
        max_minutes_without_data (int, optional): Number of minutes above which an
          absence of data is considered an unhealthy. Defaults to 10.

    Raises:
        MonitorfishHealthError: If the most recent data received is older than
          `max_minutes_without_data`.
    """
    if not utcnow:
        utcnow = datetime.utcnow()

    time_without_data = utcnow - healthcheck.date_last_position
    minutes_without_data = time_without_data.total_seconds() / 60

    try:
        assert minutes_without_data <= max_minutes_without_data
    except AssertionError:
        raise MonitorfishHealthError(
            (
                "The most recent last_position is too old: it is "
                f"{minutes_without_data} minutes old whereas it should be less than "
                f"{max_minutes_without_data} minutes old."
            )
        )
