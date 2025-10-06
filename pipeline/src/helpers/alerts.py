from datetime import datetime

from src.entities.alerts import PositionAlertSpecification
from src.helpers.dates import is_in_validity_period


def position_alert_specification_must_run_now(
    alert_spec: PositionAlertSpecification, now: datetime
) -> bool:
    return alert_spec.is_activated and is_in_validity_period(
        validity_start_date=alert_spec.validity_start_datetime_utc,
        validity_end_date=alert_spec.validity_end_datetime_utc,
        repeat_each_year=alert_spec.repeat_each_year,
        sample_date=now,
    )
