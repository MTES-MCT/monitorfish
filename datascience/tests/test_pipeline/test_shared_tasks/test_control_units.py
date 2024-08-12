import json
from unittest.mock import patch

import pandas as pd
from requests import Response

from src.pipeline.shared_tasks.control_units import fetch_control_units_contacts


@patch("src.pipeline.flows.distribute_pnos.requests")
def test_fetch_control_units_contacts(
    mock_requests, monitorenv_control_units_api_response, control_units_contacts
):
    response = Response()
    response.status_code = 200
    response._content = json.dumps(monitorenv_control_units_api_response).encode(
        "utf-8"
    )
    response.encoding = "utf-8"

    mock_requests.get.return_value = response
    res = fetch_control_units_contacts.run()
    pd.testing.assert_frame_equal(res, control_units_contacts)
