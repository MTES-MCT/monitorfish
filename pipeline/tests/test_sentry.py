import asyncio
import logging
import threading
from unittest.mock import patch
from uuid import UUID

import pytest
from prefect import flow
from prefect.client.orchestration import get_client
from prefect.client.schemas.filters import LogFilter, LogFilterFlowRunId
from prefect.logging.handlers import APILogHandler

from src.sentry import report_flow_failure_to_sentry


@flow(
    name="Monitorfish - Failing flow",
    on_failure=[report_flow_failure_to_sentry],
    on_crashed=[report_flow_failure_to_sentry],
)
def failing_flow():
    raise ValueError("Something went wrong")


def read_flow_run_log_messages(flow_run_id: UUID) -> list[str]:
    async def read_logs():
        await APILogHandler.aflush()
        async with get_client() as client:
            logs = await client.read_logs(
                log_filter=LogFilter(flow_run_id=LogFilterFlowRunId(any_=[flow_run_id]))
            )
        return [log.message for log in logs]

    return asyncio.run(read_logs())


@pytest.fixture
def sentry_sdk_mock():
    with patch("src.sentry.sentry_sdk") as sentry_sdk_mock:
        sentry_sdk_mock.is_initialized.return_value = False
        yield sentry_sdk_mock


def test_report_flow_failure_to_sentry_does_nothing_without_dsn(sentry_sdk_mock):
    with patch("src.sentry.SENTRY_DSN", None):
        state = failing_flow(return_state=True)

    assert state.is_failed()
    sentry_sdk_mock.init.assert_not_called()
    sentry_sdk_mock.capture_exception.assert_not_called()


def test_report_flow_failure_to_sentry_captures_the_flow_exception(sentry_sdk_mock):
    proxies = {"http": "http://proxy.test:8090", "https": "http://proxy.test:8090"}
    with patch("src.sentry.SENTRY_DSN", "https://key@sentry.test/1"), patch(
        "src.sentry.SENTRY_ENV", "test"
    ), patch("src.sentry.PROXIES", proxies):
        state = failing_flow(return_state=True)

    assert state.is_failed()
    sentry_sdk_mock.init.assert_called_once()
    assert sentry_sdk_mock.init.call_args.kwargs["dsn"] == "https://key@sentry.test/1"
    assert sentry_sdk_mock.init.call_args.kwargs["environment"] == "test"
    assert sentry_sdk_mock.init.call_args.kwargs["debug"] is True
    assert (
        sentry_sdk_mock.init.call_args.kwargs["http_proxy"] == "http://proxy.test:8090"
    )
    assert (
        sentry_sdk_mock.init.call_args.kwargs["https_proxy"] == "http://proxy.test:8090"
    )

    sentry_sdk_mock.capture_exception.assert_called_once()
    exception = sentry_sdk_mock.capture_exception.call_args.args[0]
    assert isinstance(exception, ValueError)
    assert str(exception) == "Something went wrong"

    scope = sentry_sdk_mock.new_scope.return_value.__enter__.return_value
    scope.set_tag.assert_any_call("flow_name", "Monitorfish - Failing flow")
    assert scope.fingerprint == [
        "pipeline-flow",
        "Monitorfish - Failing flow",
        "ValueError",
    ]
    sentry_sdk_mock.flush.assert_called_once()


def test_report_flow_failure_to_sentry_does_not_raise_when_sentry_fails(
    sentry_sdk_mock,
):
    sentry_sdk_mock.capture_exception.side_effect = ConnectionError("Sentry is down")

    with patch("src.sentry.SENTRY_DSN", "https://key@sentry.test/1"):
        state = failing_flow(return_state=True)

    assert state.is_failed()
    sentry_sdk_mock.capture_exception.assert_called_once()


def test_report_flow_failure_to_sentry_logs_events_that_sentry_sdk_fails_to_send(
    sentry_sdk_mock,
):
    # Like the SDK, which sends events and logs its errors from a background thread
    def log_sending_error_from_another_thread(**kwargs):
        thread = threading.Thread(
            target=logging.getLogger("sentry_sdk.errors").error,
            args=("Unexpected status code: %s", 403),
        )
        thread.start()
        thread.join()

    sentry_sdk_mock.flush.side_effect = log_sending_error_from_another_thread
    sentry_sdk_logger_handlers = list(logging.getLogger("sentry_sdk.errors").handlers)

    # Lets the SDK's logs through, as if it had been initialized with `debug=True`
    with patch("sentry_sdk.debug.get_client") as get_client_mock, patch(
        "src.sentry.SENTRY_DSN", "https://key@sentry.test/1"
    ):
        get_client_mock.return_value.options = {"debug": True}
        state = failing_flow(return_state=True)

    assert state.is_failed()
    assert "Sentry: Unexpected status code: 403" in read_flow_run_log_messages(
        state.state_details.flow_run_id
    )
    assert logging.getLogger("sentry_sdk.errors").handlers == sentry_sdk_logger_handlers
