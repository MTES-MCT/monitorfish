import json
from datetime import datetime, timedelta

import pytest
from pytest import fixture
from requests_mock import Mocker

from config import HEALTHCHECK_ENDPOINT
from src.pipeline.entities.monitorfish_healthcheck import MonitorfishHealthcheck
from src.pipeline.exceptions import MonitorfishHealthError
from src.pipeline.shared_tasks.healthcheck import (
    assert_last_positions_flow_health,
    assert_positions_received_by_api_health,
    get_monitorfish_healthcheck,
)


@fixture
def utcnow() -> datetime:
    return datetime.utcnow()


@fixture
def healthcheck(utcnow) -> MonitorfishHealthcheck:
    return MonitorfishHealthcheck(
        date_last_position_updated_by_prefect=utcnow - timedelta(minutes=8),
        date_last_position_received_by_api=utcnow - timedelta(minutes=8),
        date_logbook_message_received=utcnow - timedelta(minutes=8),
    )


def test_get_monitorfish_healthcheck():
    with Mocker(json_encoder=json.encoder.JSONEncoder) as requests_mocker:
        requests_mocker.get(
            HEALTHCHECK_ENDPOINT,
            json={
                "dateLastPositionUpdatedByPrefect": "2023-02-07T09:24:00Z",
                "dateLastPositionReceivedByAPI": "2023-02-14T14:01:00Z",
                "dateLogbookMessageReceived": "2022-03-01T20:31:37Z",
            },
        )

        health = get_monitorfish_healthcheck.run()

    assert health == MonitorfishHealthcheck(
        date_last_position_updated_by_prefect=datetime(2023, 2, 7, 9, 24),
        date_last_position_received_by_api=datetime(2023, 2, 14, 14, 1),
        date_logbook_message_received=datetime(2022, 3, 1, 20, 31, 37),
    )


def test_assert_positions_received_by_api_health_with_default_values(
    healthcheck, utcnow
):
    assert_positions_received_by_api_health.run(
        healthcheck=healthcheck,
        utcnow=utcnow,
    )


def test_assert_positions_received_by_api_health_raises_if_positions_are_too_old(
    healthcheck, utcnow
):
    with pytest.raises(MonitorfishHealthError):
        assert_positions_received_by_api_health.run(
            healthcheck=healthcheck,
            utcnow=utcnow,
            max_minutes_without_data=5,
        )


def test_assert_last_positions_flow_health_with_default_parameters(healthcheck, utcnow):
    assert_last_positions_flow_health.run(healthcheck=healthcheck, utcnow=utcnow)


def test_assert_last_positions_flow_health_raises_if_last_position_is_too_old(
    healthcheck, utcnow
):
    with pytest.raises(MonitorfishHealthError):
        assert_last_positions_flow_health.run(
            healthcheck=healthcheck, utcnow=utcnow, max_minutes_without_data=5
        )
