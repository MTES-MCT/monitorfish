import pandas as pd

from src.shared_tasks.pnos import (
    extract_pno_units_ports_and_segments_subscriptions,
    extract_pno_units_targeting_vessels,
)


def test_extract_pno_units_targeting_vessels(
    reset_test_data, pno_units_targeting_vessels
):
    res = extract_pno_units_targeting_vessels()
    pd.testing.assert_frame_equal(res, pno_units_targeting_vessels)


def test_extract_pno_units_ports_and_segments_subscriptions(
    reset_test_data, pno_units_ports_and_segments_subscriptions
):
    res = extract_pno_units_ports_and_segments_subscriptions()
    pd.testing.assert_frame_equal(res, pno_units_ports_and_segments_subscriptions)
