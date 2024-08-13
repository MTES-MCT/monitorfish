from dataclasses import dataclass
from datetime import datetime
from typing import List

import pandas as pd

from src.pipeline.helpers.dates import Period


@dataclass
class ControlUnitWithEmails:
    control_unit_id: int
    control_unit_name: str
    emails: List[str]


@dataclass
class ControlUnitActions:
    """
    Control unit and its fisheries control actions between two dates.
    """

    control_unit: ControlUnitWithEmails
    period: Period
    land_controls: pd.DataFrame
    sea_controls: pd.DataFrame
    air_controls: pd.DataFrame
    air_surveillances: pd.DataFrame


@dataclass
class ControlUnitActionsSentMessage:
    control_unit_id: int
    control_unit_name: str
    email_address: str
    sending_datetime_utc: datetime
    actions_min_datetime_utc: datetime
    actions_max_datetime_utc: datetime
    number_of_actions: int
    success: bool
    error_code: int
    error_message: str
