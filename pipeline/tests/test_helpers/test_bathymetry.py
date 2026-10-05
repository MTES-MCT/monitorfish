import requests
from requests_mock import Mocker

from config import BATHYMETRY_DEPTH_SAMPLE_ENDPOINT
from src.helpers.bathymetry import get_depth
from src.helpers.requests_rate_limiter import RateLimitedSession


def test_get_depth_returns_avg_from_response():
    session = RateLimitedSession(requests_per_second=1000)

    with Mocker() as m:
        m.get(BATHYMETRY_DEPTH_SAMPLE_ENDPOINT, json={"avg": -123.45})
        depth = get_depth(lon=-4.5, lat=48.5, session=session)

    assert depth == -123.45
    assert m.last_request.qs["geom"] == ["point (-4.5 48.5)"]


def test_get_depth_returns_none_when_avg_is_missing():
    session = RateLimitedSession(requests_per_second=1000)

    with Mocker() as m:
        m.get(BATHYMETRY_DEPTH_SAMPLE_ENDPOINT, json={})
        depth = get_depth(lon=-4.5, lat=48.5, session=session)

    assert depth is None


def test_get_depth_raises_on_http_error():
    session = RateLimitedSession(requests_per_second=1000)

    with Mocker() as m:
        m.get(BATHYMETRY_DEPTH_SAMPLE_ENDPOINT, status_code=500)

        try:
            get_depth(lon=-4.5, lat=48.5, session=session)
            assert False, "Expected an HTTPError to be raised"
        except requests.HTTPError:
            pass


def test_get_depth_retries_through_the_rate_limited_session_on_429():
    session = RateLimitedSession(requests_per_second=1000, max_retries=2)
    session.next_request = 0.0  # avoid waiting on the rate limit itself

    with Mocker() as m:
        m.get(
            BATHYMETRY_DEPTH_SAMPLE_ENDPOINT,
            [
                {"status_code": 429, "headers": {"Retry-After": "0"}},
                {"status_code": 200, "json": {"avg": 3.14}},
            ],
        )
        depth = get_depth(lon=1.0, lat=2.0, session=session)

    assert depth == 3.14
    assert m.call_count == 2
