from unittest.mock import MagicMock, patch

import pytest
from requests_mock import Mocker

from src.helpers.requests_rate_limiter import RateLimitedSession

URL = "https://some.api/endpoint"


def test_get_returns_response_on_success():
    session = RateLimitedSession(requests_per_second=1000)

    with Mocker() as m:
        m.get(URL, json={"avg": 42})
        response = session.get(URL)

    assert response.json() == {"avg": 42}
    assert m.call_count == 1


@patch("src.helpers.requests_rate_limiter.time.sleep")
@patch("src.helpers.requests_rate_limiter.time.monotonic")
def test_get_waits_to_respect_the_requested_rate(mock_monotonic, mock_sleep):
    # `time.monotonic()` is called twice per attempt (once to compute the
    # wait, once to schedule `next_request`). First call happens at t=0,
    # second call is attempted at t=0.05, so with 4 requests per second
    # (interval = 0.25s) the session must sleep for the remaining 0.20s
    # before issuing the second request.
    mock_monotonic.side_effect = [0.0, 0.0, 0.05, 0.05]
    session = RateLimitedSession(requests_per_second=4)

    with Mocker() as m:
        m.get(URL, json={})
        session.get(URL)
        session.get(URL)

    mock_sleep.assert_called_once()
    (wait,), _ = mock_sleep.call_args
    assert wait == pytest.approx(0.20)


@patch("src.helpers.requests_rate_limiter.time.sleep")
@patch("src.helpers.requests_rate_limiter.time.monotonic", return_value=0.0)
def test_get_retries_on_429_with_exponential_backoff_then_succeeds(
    mock_monotonic, mock_sleep
):
    session = RateLimitedSession(requests_per_second=1000, max_retries=3)

    with Mocker() as m:
        m.get(
            URL,
            [
                {"status_code": 429},
                {"status_code": 429},
                {"status_code": 200, "json": {"avg": 12}},
            ],
        )
        response = session.get(URL)

    assert response.status_code == 200
    assert response.json() == {"avg": 12}
    assert m.call_count == 3
    # Exponential backoff: 2**0, then 2**1 (rate-limiting sleeps are also
    # recorded, but are 0 here since time.monotonic is fixed).
    backoff_delays = [call.args[0] for call in mock_sleep.call_args_list]
    assert 1 in backoff_delays
    assert 2 in backoff_delays


@patch("src.helpers.requests_rate_limiter.time.sleep")
@patch("src.helpers.requests_rate_limiter.time.monotonic", return_value=0.0)
def test_get_respects_retry_after_header(mock_monotonic, mock_sleep):
    session = RateLimitedSession(requests_per_second=1000, max_retries=1)

    with Mocker() as m:
        m.get(
            URL,
            [
                {"status_code": 429, "headers": {"Retry-After": "7"}},
                {"status_code": 200, "json": {}},
            ],
        )
        session.get(URL)

    assert 7.0 in [call.args[0] for call in mock_sleep.call_args_list]


@patch("src.helpers.requests_rate_limiter.time.sleep")
@patch("src.helpers.requests_rate_limiter.time.monotonic", return_value=0.0)
def test_get_raises_after_max_retries_exhausted(mock_monotonic, mock_sleep):
    session = RateLimitedSession(requests_per_second=1000, max_retries=2)

    with Mocker() as m:
        m.get(URL, status_code=429)

        with pytest.raises(RuntimeError, match="429 after 2 retries"):
            session.get(URL)

    # Initial attempt + 2 retries = 3 calls
    assert m.call_count == 3


@patch("src.helpers.requests_rate_limiter.time.sleep")
@patch("src.helpers.requests_rate_limiter.time.monotonic", return_value=0.0)
def test_get_logs_when_logger_is_set(mock_monotonic, mock_sleep):
    session = RateLimitedSession(requests_per_second=1000, max_retries=1)
    session.logger = MagicMock()

    with Mocker() as m:
        m.get(URL, [{"status_code": 429}, {"status_code": 200, "json": {}}])
        session.get(URL)

    session.logger.info.assert_called_once()
