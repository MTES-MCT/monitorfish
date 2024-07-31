import pandas as pd

from src.pipeline.flows.distribute_pnos import extract_pno_units_targeting_vessels
from src.pipeline.shared_tasks.pnos import (
    extract_pno_units_ports_and_segments_subscriptions,
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
