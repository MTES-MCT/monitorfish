from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Union

import pandas as pd
from dateutil.relativedelta import relativedelta

from src.pipeline.processing import json_converter


@dataclass
class Period:
    start: datetime
    end: datetime


def make_periods(
    start_datetime_utc: datetime,
    end_datetime_utc: datetime,
    period_duration: timedelta,
    overlap: Union[None, timedelta] = None,
) -> List[Period]:
    """
    Returns a list of `Period`s of duration `period_duration` covering the time range
    from `start_datetime_utc` to `end_datetime_utc`.
    If `overlap` is specified, the `Period`s returned will overlap by the amount
    specified, otherwise the end of one period will coincide with the start of the
    next one.

    This is useful to break a long time range into smaller periods for processing time
    series data that would take up too much memory to handle in one piece.

    Args:
        start_datetime_utc (datetime): start of the period to cover
        end_datetime_utc (datetime): end of the period to cover
        period_duration (timedelta): duration of the individual
          periods returned
        overlap (Union[None, timedelta]): overlap between successive
          periods, if specified. Defaults to `None`.
    """

    if not overlap:
        overlap = timedelta(0)

    try:
        assert period_duration > overlap
    except AssertionError:
        raise ValueError("'period_duration' cannot be shorter than 'overlap'.")

    try:
        assert end_datetime_utc >= start_datetime_utc
    except AssertionError:
        raise ValueError(
            "'end_datetime_utc' cannot be before than 'start_datetime_utc'."
        )

    if end_datetime_utc - start_datetime_utc <= period_duration:
        return [Period(start=start_datetime_utc, end=end_datetime_utc)]
    else:
        periods = make_periods(
            start_datetime_utc=start_datetime_utc + period_duration - overlap,
            end_datetime_utc=end_datetime_utc,
            period_duration=period_duration,
            overlap=overlap,
        )

        periods.insert(
            0,
            Period(
                start=start_datetime_utc,
                end=start_datetime_utc + period_duration,
            ),
        )
        return periods


def get_datetime_intervals(
    s: pd.Series, unit: str = None, how: str = "backward"
) -> pd.Series:
    """Takes a pandas Series with datetime dtype.
    Return a pandas Series with the same index and with time intervals between the
    successives values of the input Series as values.

    Args:
        s (Series): pandas Series with datetime dtype
        unit (Union[str, None]):
          - if None, returns values as pandas Timedelta
          - if provided, must be one of 's', 'min' or 'h', in which case values
          are returned as a float.
          Defaults to None.
        how (str): if, 'forward', computes the interval between each position and the
          next one. If 'backward', computes the interval between each position and
          the previous one.
          Defaults to 'backward'

    Returns:
        pd.Series: Series of time intervals between the values of the input Series
    """

    if how == "backward":
        shift = 1
    elif how == "forward":
        shift = -1
    else:
        raise ValueError(f"how expects 'backward' or 'forward', got '{how}'")

    intervals = pd.Series(
        index=s.index,
        data=shift * (s.values - s.shift(shift).values),
    )

    if unit:
        intervals = intervals.map(lambda dt: dt.total_seconds())
        if unit == "h":
            intervals = intervals / 3600
        elif unit == "min":
            intervals = intervals / 60
        elif unit == "s":
            pass
        else:
            raise ValueError(f"unit must be None, 'h', 'min' or 's', got '{unit}'.")

    return intervals
