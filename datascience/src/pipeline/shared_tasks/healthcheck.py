import os
from datetime import datetime

import requests
from prefect import task

from config import HEALTHCHECK_ENDPOINT
from src.pipeline.entities.monitorfish_healthcheck import MonitorfishHealthcheck
from src.pipeline.exceptions import MonitorfishHealthError


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
def assert_positions_received_by_api_health(
    healthcheck: MonitorfishHealthcheck,
    utcnow: datetime = None,
    max_minutes_without_data: int = 10,
):
    """
    Checks if the `date_last_position_received_by_api` of the input `MonitorfishHealthcheck` is within
    `max_minutes_without_data` minutes of `utcnow`.

    Args:
        healthcheck (MonitorfishHealthcheck): `MonitorfishHealthcheck` to check.
        utcnow (datetime, optional): Date with which to compare the latest
          position's reception date and from which the `recent_positions_histogram` is
          expected to be supplied.
          If not supplied, the current server time is used. Defaults to None.
        max_minutes_without_data (int, optional): maximum number of minutes allow
          between `date_position_received` and `utcnow`. Defaults to 10.
    Raises:
        MonitorfishHealthError: If the most recent data received is older than
          `max_minutes_without_data`.
    """
    if not utcnow:
        utcnow = datetime.utcnow()

    time_without_data = utcnow - healthcheck.date_last_position_received_by_api
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


@task(checkpoint=False)
def assert_last_positions_flow_health(
    healthcheck: MonitorfishHealthcheck,
    utcnow: datetime = None,
    max_minutes_without_data: int = 10,
):
    """
    Checks if the date_time of most recent `date_last_position_updated_by_prefect` is in the last
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

    time_without_data = utcnow - healthcheck.date_last_position_updated_by_prefect
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
