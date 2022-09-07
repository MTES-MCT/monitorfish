from datetime import datetime, timedelta

import pandas as pd
import pytest
from pytest import fixture

from src.pipeline.entities.monitorfish_healthcheck import MonitorfishHealthcheck
from src.pipeline.exceptions.monitorfish_health_error import MonitorfishHealthError
from src.pipeline.shared_tasks.healthcheck import (
    assert_last_positions_health,
    assert_positions_health,
    extract_monitorfish_recent_positions_histogram,
)


@fixture
def utcnow() -> datetime:
    return datetime.utcnow()


@fixture
def recent_positions_histogram(utcnow) -> pd.DataFrame:
    truncated_utwnow = utcnow.replace(minute=0, second=0, microsecond=0)
    return pd.DataFrame(
        {
            "datetime_utc_hour": [
                truncated_utwnow - timedelta(hours=i) for i in range(48, 0, -1)
            ],
            "number_of_positions": [780 + 10 * i for i in range(48)],
        }
    )


@fixture
def healthcheck(utcnow) -> MonitorfishHealthcheck:
    return MonitorfishHealthcheck(
        date_position_received=utcnow - timedelta(minutes=8),
        date_last_position=utcnow - timedelta(minutes=8),
        date_logbook_message_received=utcnow - timedelta(minutes=8),
    )


def test_extract_monitorfish_recent_positions_histogram(reset_test_data):
    recent_positions_histogram = extract_monitorfish_recent_positions_histogram.run()
    # The actual number of recent positions in the test data varies depending on when
    # the test is run due to the time truncation in the histogram query.
    assert 18 <= recent_positions_histogram.number_of_positions.sum() <= 21


def test_assert_positions_health_with_default_values(
    healthcheck, recent_positions_histogram, utcnow
):
    assert_positions_health.run(
        healthcheck=healthcheck,
        recent_positions_histogram=recent_positions_histogram,
        utcnow=utcnow,
    )


def test_assert_positions_health_raises_if_histogram_has_values_below_minimum(
    healthcheck, recent_positions_histogram, utcnow
):
    with pytest.raises(MonitorfishHealthError):
        assert_positions_health.run(
            healthcheck=healthcheck,
            recent_positions_histogram=recent_positions_histogram,
            utcnow=utcnow,
            min_number_of_positions_by_hour=800,
        )


def test_assert_positions_health_raises_if_histogram_has_unexepected_datetime(
    healthcheck, recent_positions_histogram, utcnow
):
    recent_positions_histogram_ = recent_positions_histogram.copy(deep=True)
    recent_positions_histogram_.loc[0, "datetime_utc_hour"] = utcnow - timedelta(days=7)

    with pytest.raises(MonitorfishHealthError):
        assert_positions_health.run(
            healthcheck=healthcheck,
            recent_positions_histogram=recent_positions_histogram_,
            utcnow=utcnow,
        )


def test_assert_positions_health_raises_if_histogram_does_not_have_48_hours(
    healthcheck, recent_positions_histogram, utcnow
):
    recent_positions_histogram_ = recent_positions_histogram.copy(deep=True)
    recent_positions_histogram_ = recent_positions_histogram_.iloc[:-1]

    with pytest.raises(MonitorfishHealthError):
        assert_positions_health.run(
            healthcheck=healthcheck,
            recent_positions_histogram=recent_positions_histogram_,
            utcnow=utcnow,
        )


def test_assert_positions_health_raises_if_positions_are_too_old(
    healthcheck, recent_positions_histogram, utcnow
):
    with pytest.raises(MonitorfishHealthError):
        assert_positions_health.run(
            healthcheck=healthcheck,
            recent_positions_histogram=recent_positions_histogram,
            utcnow=utcnow,
            max_minutes_without_data=5,
        )


def test_assert_last_positions_health_with_default_parameters(healthcheck, utcnow):
    assert_last_positions_health.run(healthcheck=healthcheck, utcnow=utcnow)


def test_assert_last_positions_health_raises_if_last_position_is_too_old(
    healthcheck, utcnow
):
    with pytest.raises(MonitorfishHealthError):
        assert_last_positions_health.run(
            healthcheck=healthcheck, utcnow=utcnow, max_minutes_without_data=5
        )
