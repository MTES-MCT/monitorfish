import json
from unittest.mock import patch

from requests import Response

from src.pipeline.shared_tasks.control_units import fetch_control_units


@patch("src.pipeline.shared_tasks.control_units.requests")
def test_fetch_control_units_contacts(
    mock_requests, monitorenv_control_units_api_response, monitorenv_control_units
):
    response = Response()
    response.status_code = 200
    response._content = json.dumps(monitorenv_control_units_api_response).encode(
        "utf-8"
    )
    response.encoding = "utf-8"

    mock_requests.get.return_value = response
    res = fetch_control_units.run()
    assert res == monitorenv_control_units
