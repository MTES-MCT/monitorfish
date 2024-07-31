import pandas as pd
import pytest

from src.pipeline.flows.distribute_pnos import extract_pno_units_targeting_vessels
from src.pipeline.shared_tasks.pnos import (
    extract_pno_units_ports_and_segments_subscriptions,
)


@pytest.fixture
def pno_units_targeting_vessels():
    return pd.DataFrame(
        {
            "vessel_id": [2, 4, 7],
            "cfr": ["ABC000542519", None, "___TARGET___"],
            "control_unit_ids_targeting_vessel": [[4], [1, 2], [4]],
        }
    )


@pytest.fixture
def pno_units_ports_and_segments_subscriptions():
    return pd.DataFrame(
        {
            "port_locode": [
                "FRCQF",
                "FRDKK",
                "FRDPE",
                "FRLEH",
                "FRLEH",
                "FRZJZ",
                "FRZJZ",
            ],
            "control_unit_id": [1, 2, 4, 2, 3, 2, 3],
            "receive_all_pnos_from_port": [
                False,
                False,
                True,
                False,
                False,
                False,
                False,
            ],
            "unit_subscribed_segments": [
                ["SWW01/02/03"],
                [],
                [],
                [],
                ["SWW01/02/03", "NWW01"],
                [],
                ["SWW01/02/03", "NWW01"],
            ],
        }
    )


def test_extract_pno_units_targeting_vessels(
    reset_test_data, pno_units_targeting_vessels
):
    res = extract_pno_units_targeting_vessels.run()
    pd.testing.assert_frame_equal(res, pno_units_targeting_vessels)


def test_extract_pno_units_ports_and_segments_subscriptions(
    reset_test_data, pno_units_ports_and_segments_subscriptions
):
    res = extract_pno_units_ports_and_segments_subscriptions.run()
    pd.testing.assert_frame_equal(res, pno_units_ports_and_segments_subscriptions)
