from datetime import datetime, timedelta
from typing import List

import pytz
from prefect import task

from src.pipeline.helpers import dates


@task(checkpoint=False)
def get_utcnow():
    """Task version of `datetime.utcnow`"""
    return datetime.utcnow()


@task(checkpoint=False)
def get_current_year() -> int:
    """Returns current year"""
    return datetime.utcnow().year


@task(checkpoint=False)
def get_timezone_aware_utcnow():
    return pytz.UTC.localize(datetime.utcnow())


@task(checkpoint=False)
def make_timedelta(**kwargs) -> timedelta:
    """Task version of `datetime.timedelta`"""
    return timedelta(**kwargs)


@task(checkpoint=False)
def make_periods(
    start_hours_ago: int,
    end_hours_ago: int,
    minutes_per_chunk: int,
    chunk_overlap_minutes: int,
) -> List[dates.Period]:
    """
    `prefect.Task` version of the function `src.pipeline.helpers.dates.make_periods`,
    with the difference that start and end dates are to be given as a number of hours
    from the current date (instead of `datetime` objects), and chunk duration and
    overlap are to be given as a number of minutes (instead of `timedelta` objects).
    This is to accomodate for the fact that Prefect flows' parameters must be
    JSON-serializable, and `datetime` and `timedelta` are not, by default.

    `src.pipeline.helpers.dates.make_periods` is recursive, hence the construction as a
    python function first and not directly as Prefect `Task`.

    See `src.pipeline.helpers.dates.make_periods` for help.
    """

    now = datetime.utcnow()

    return dates.make_periods(
        start_datetime_utc=now - timedelta(hours=start_hours_ago),
        end_datetime_utc=now - timedelta(hours=end_hours_ago),
        period_duration=timedelta(minutes=minutes_per_chunk),
        overlap=timedelta(minutes=chunk_overlap_minutes),
    )
