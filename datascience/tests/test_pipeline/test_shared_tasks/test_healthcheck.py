from datetime import datetime, timedelta

import pytest
from pytest import fixture

from src.pipeline.entities.monitorfish_healthcheck import MonitorfishHealthcheck
from src.pipeline.exceptions import MonitorfishHealthError
from src.pipeline.shared_tasks.healthcheck import (
  assert_last_positions_flow_health,
  assert_positions_received_by_api_health,
)


@fixture
def utcnow() -> datetime:
    return datetime.utcnow()


@fixture
def healthcheck(utcnow) -> MonitorfishHealthcheck:
    return MonitorfishHealthcheck(
        date_position_received=utcnow - timedelta(minutes=8),
        date_last_position=utcnow - timedelta(minutes=8),
        date_logbook_message_received=utcnow - timedelta(minutes=8),
    )


def test_assert_positions_health_with_default_values(healthcheck, utcnow):
    assert_positions_received_by_api_health.run(
        healthcheck=healthcheck,
        utcnow=utcnow,
    )


def test_assert_positions_health_raises_if_positions_are_too_old(healthcheck, utcnow):
    with pytest.raises(MonitorfishHealthError):
        assert_positions_received_by_api_health.run(
            healthcheck=healthcheck,
            utcnow=utcnow,
            max_minutes_without_data=5,
        )


def test_assert_last_positions_health_with_default_parameters(healthcheck, utcnow):
    assert_last_positions_flow_health.run(healthcheck=healthcheck, utcnow=utcnow)


def test_assert_last_positions_health_raises_if_last_position_is_too_old(
    healthcheck, utcnow
):
    with pytest.raises(MonitorfishHealthError):
        assert_last_positions_flow_health.run(
            healthcheck=healthcheck, utcnow=utcnow, max_minutes_without_data=5
        )
