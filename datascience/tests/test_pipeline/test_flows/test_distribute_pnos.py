from datetime import datetime, timezone

import pandas as pd
import pytest

from src.pipeline.flows.distribute_pnos import extract_pnos_to_distribute, flow
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def expected_extracted_pnos() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [8, 14],
            "operation_number": ["8", "7cfcdde3-286c-4713-8460-2ed82a59be34"],
            "operation_type": ["DAT", "DAT"],
            "report_id": ["8", "fc16ea8a-3148-44b2-977f-de2a2ae550b9"],
            "cfr": ["ABC000542519", "SOCR4T3"],
            "ircs": ["FQ7058", None],
            "external_identification": ["RO237719", None],
            "vessel_name": ["DEVINER FIGURE CONSCIENCE", None],
            "flag_state": ["FRA", "CYP"],
            "value": [
                {
                    "port": "PNO_PORT",
                    "purpose": "LAN",
                    "catchOnboard": [
                        {"nbFish": None, "weight": 1500.0, "species": "GHL"}
                    ],
                    "tripStartDate": "2020-05-04T19:41:03.340Z",
                    "isPnoToDistribute": True,
                    "predictedArrivalDatetimeUtc": "2020-05-06T11:41:03.340Z",
                },
                {
                    "port": "GBPHD",
                    "purpose": "SHE",
                    "tripStartDate": "2020-05-04T19:41:09.200Z",
                    "isPnoToDistribute": True,
                    "predictedArrivalDatetimeUtc": "2020-05-06T20:41:09.200Z",
                },
            ],
            "trip_gears": [None, None],
            "trip_segments": [None, None],
        }
    )


def test_extract_pnos_to_distribute(reset_test_data, expected_extracted_pnos):
    pnos = extract_pnos_to_distribute.run(
        start_datetime_utc=datetime(2020, 1, 1),
        end_datetime_utc=datetime.now(tz=timezone.utc).replace(tzinfo=None),
    )
    pd.testing.assert_frame_equal(
        pnos.drop(columns=["operation_datetime_utc", "report_datetime_utc"]),
        expected_extracted_pnos,
    )


# def test_flow(reset_test_data):
#     flow.schedule = None
#     state = flow.run()

#     assert state.is_successful()
