from datetime import datetime, timedelta
from typing import List, Union

import pandas as pd
from dateutil.relativedelta import relativedelta

from src.pipeline.processing import json_converter


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
