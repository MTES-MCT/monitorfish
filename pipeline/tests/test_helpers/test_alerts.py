from datetime import datetime

from src.entities.alerts import PositionAlertSpecification
from src.helpers.alerts import position_alert_specification_must_run_now

BASE_ALERT = PositionAlertSpecification(
    id=1,
    name="Test Alert",
    description="Test description",
    natinf_code=12345,
    is_activated=True,
    is_in_error=False,
    error_reason=None,
    repeat_each_year=False,
    track_analysis_depth=12.0,
    validity_start_datetime_utc=datetime(2023, 1, 1, 0, 0, 0),
    validity_end_datetime_utc=datetime(2023, 12, 31, 23, 59, 59),
    only_fishing_positions=True,
    gears=[],
    species=[],
    species_catch_areas=None,
    administrative_areas=[],
    regulatory_areas=[],
    min_depth=None,
    flag_states_iso2=[],
    vessel_ids=[],
    district_codes=[],
    producer_organizations=[],
)


def test_position_alert_specification_must_run_now_when_activated_and_in_validity_period():
    now = datetime(2023, 6, 15, 12, 0, 0)
    assert position_alert_specification_must_run_now(BASE_ALERT, now)


def test_position_alert_specification_must_run_now_when_not_activated():
    deactivated_alert = BASE_ALERT.model_copy(update={"is_activated": False})
    now = datetime(2023, 6, 15, 12, 0, 0)
    assert not position_alert_specification_must_run_now(deactivated_alert, now)


def test_position_alert_specification_must_run_now_when_activated_but_outside_validity_period():
    now = datetime(2024, 6, 15, 12, 0, 0)
    assert not position_alert_specification_must_run_now(BASE_ALERT, now)


def test_position_alert_specification_must_run_now_with_repeating_alert():
    repeating_alert = BASE_ALERT.model_copy(
        update={
            "repeat_each_year": True,
            "validity_start_datetime_utc": datetime(2023, 5, 1, 0, 0, 0),
            "validity_end_datetime_utc": datetime(2023, 8, 31, 23, 59, 59),
        }
    )
    now = datetime(2027, 6, 15, 12, 0, 0)
    assert position_alert_specification_must_run_now(repeating_alert, now)

    now = datetime(2027, 9, 15, 12, 0, 0)
    assert not position_alert_specification_must_run_now(repeating_alert, now)

    repeating_alert = BASE_ALERT.model_copy(
        update={
            "repeat_each_year": True,
            "validity_start_datetime_utc": datetime(2023, 10, 1, 0, 0, 0),
            "validity_end_datetime_utc": datetime(2024, 2, 29, 23, 59, 59),
        }
    )

    now = datetime(2027, 12, 15, 12, 0, 0)
    assert position_alert_specification_must_run_now(repeating_alert, now)

    now = datetime(2020, 12, 15, 12, 0, 0)
    assert not position_alert_specification_must_run_now(repeating_alert, now)

    now = datetime(2027, 3, 15, 12, 0, 0)
    assert not position_alert_specification_must_run_now(repeating_alert, now)


def test_position_alert_specification_must_run_now_with_no_validity_dates():
    no_validity_alert = BASE_ALERT.model_copy(
        update={"validity_start_datetime_utc": None, "validity_end_datetime_utc": None}
    )
    now = datetime(2002, 6, 15, 12, 0, 0)
    assert position_alert_specification_must_run_now(no_validity_alert, now)


def test_position_alert_specification_must_run_now_with_only_start_date():
    start_only_alert = BASE_ALERT.model_copy(update={"validity_end_datetime_utc": None})

    now = datetime(2024, 6, 15, 12, 0, 0)
    assert position_alert_specification_must_run_now(start_only_alert, now)

    now = datetime(2022, 6, 15, 12, 0, 0)
    assert not position_alert_specification_must_run_now(start_only_alert, now)


def test_position_alert_specification_must_run_now_with_only_end_date():
    end_only_alert = BASE_ALERT.model_copy(update={"validity_start_datetime_utc": None})

    now = datetime(2023, 6, 15, 12, 0, 0)
    assert position_alert_specification_must_run_now(end_only_alert, now)

    now = datetime(2024, 6, 15, 12, 0, 0)
    assert not position_alert_specification_must_run_now(end_only_alert, now)
