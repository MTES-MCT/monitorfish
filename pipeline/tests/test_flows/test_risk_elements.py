from datetime import datetime
from unittest.mock import patch

import pandas as pd
import pytest

from src.flows.risk_elements import risk_elements_flow
from src.read_query import read_query
from tests.mocks import get_utcnow_mock_factory


@pytest.fixture
def expected_vessels_risk_elements() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "risk_element_code": ["MOT_MR", "MOT_MR", "MOT_MR"],
            "cfr": ["ABC000306959", "CFR000888888", "XXX123456789"],
            "metrics": [
                {
                    "total_trips": 2,
                    "compliant_trips": 2,
                    "share_of_non_compliant_trips": 0.0,
                },
                {
                    "total_trips": 2,
                    "compliant_trips": 0,
                    "share_of_non_compliant_trips": 1.0,
                },
                {
                    "total_trips": 1,
                    "compliant_trips": 0,
                    "share_of_non_compliant_trips": 1.0,
                },
            ],
            "risk_level": [1, 4, 4],
        }
    )


@patch(
    "src.flows.risk_elements.get_utcnow", get_utcnow_mock_factory(datetime(2050, 1, 1))
)
def test_risk_elements_flow(
    reset_test_data, add_catches, add_landings, expected_vessels_risk_elements
):
    vessels_risk_elements_query = "SELECT * FROM vessels_risk_elements ORDER BY cfr;"

    initial_vessels_risk_elements = read_query(
        vessels_risk_elements_query, db="monitorfish_remote"
    )

    state = risk_elements_flow(return_state=True)
    assert state.is_completed()

    final_vessels_risk_elements = read_query(
        vessels_risk_elements_query, db="monitorfish_remote"
    )
    assert len(initial_vessels_risk_elements) == 0
    pd.testing.assert_frame_equal(
        final_vessels_risk_elements, expected_vessels_risk_elements
    )

    # Re-running the flow should yield the same result
    state = risk_elements_flow(return_state=True)
    assert state.is_completed()

    final_vessels_risk_elements = read_query(
        vessels_risk_elements_query, db="monitorfish_remote"
    )
    pd.testing.assert_frame_equal(
        final_vessels_risk_elements, expected_vessels_risk_elements
    )
