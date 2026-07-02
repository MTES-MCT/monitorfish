from datetime import datetime
from unittest.mock import patch

import pandas as pd

from config import BEACON_MALFUNCTIONS_ENDPOINT
from src.entities.beacon_malfunctions import BeaconStatus
from src.flows.beacon_malfunction_activity_detection import (
    add_malfunction_start_fields,
    beacon_malfunction_activity_detection_flow,
    filter_vessels_at_sea,
    get_malfunction_ids_to_follow,
    get_vessels_without_malfunction,
)
from src.read_query import read_query

# ─── Unit tests for pure tasks ─────────────────────────────────────────────────


def test_filter_vessels_at_sea():
    vessels = pd.DataFrame({"cfr": ["A", "B", "C"], "is_at_port": [True, False, False]})
    expected_vessels = pd.DataFrame({"cfr": ["B", "C"], "is_at_port": [False, False]})
    result = filter_vessels_at_sea(vessels)
    pd.testing.assert_frame_equal(result, expected_vessels)


def test_filter_vessels_at_sea_all_at_port():
    vessels = pd.DataFrame({"cfr": ["A", "B"], "is_at_port": [True, True]})
    assert filter_vessels_at_sea(vessels).empty


def test_get_malfunction_ids_to_follow_returns_matching_ids():
    vessels = pd.DataFrame({"cfr": ["ABC000306959", "SOME_OTHER_CFR"]})
    malfunctions = pd.DataFrame(
        {
            "id": [5, 99],
            "cfr": ["ABC000306959", "UNRELATED_CFR"],
            "beacon_number": ["987654", "XXXXX"],
        }
    )
    assert get_malfunction_ids_to_follow(vessels, malfunctions) == [5]


def test_get_malfunction_ids_to_follow_returns_empty_when_no_cfr_match():
    vessels = pd.DataFrame({"cfr": ["NO_MATCH_CFR"]})
    malfunctions = pd.DataFrame(
        {"id": [5], "cfr": ["DIFFERENT_CFR"], "beacon_number": ["987654"]}
    )
    assert get_malfunction_ids_to_follow(vessels, malfunctions) == []


def test_get_malfunction_ids_to_follow_returns_empty_when_vessels_is_empty():
    assert get_malfunction_ids_to_follow(pd.DataFrame(), pd.DataFrame()) == []


def test_get_malfunction_ids_to_follow_returns_empty_when_malfunctions_is_empty():
    vessels = pd.DataFrame({"cfr": ["ABC000306959"]})
    assert get_malfunction_ids_to_follow(vessels, pd.DataFrame()) == []


def test_get_vessels_without_malfunction():
    vessels = pd.DataFrame({"cfr": ["A", "B", "C"], "other": [1, 2, 3]})
    malfunctions = pd.DataFrame({"cfr": ["A", None], "id": [1, 2]})
    result = get_vessels_without_malfunction(vessels, malfunctions)
    pd.testing.assert_frame_equal(
        result,
        pd.DataFrame({"cfr": ["B", "C"], "other": [2, 3]}).reset_index(drop=True),
    )


def test_get_vessels_without_malfunction_when_all_have_malfunctions():
    vessels = pd.DataFrame({"cfr": ["A", "B"]})
    malfunctions = pd.DataFrame({"cfr": ["A", "B"], "id": [1, 2]})
    assert get_vessels_without_malfunction(vessels, malfunctions).empty


def test_add_malfunction_start_fields_sets_beacon_status_and_renames_vms_date():
    vms_date = datetime(2026, 1, 1, 10, 0, 0)
    vessels = pd.DataFrame(
        {
            "cfr": ["A", "B"],
            "vms_last_position_datetime_utc": [vms_date, None],
            "extra_col": [1, 2],
        }
    )
    result = add_malfunction_start_fields(vessels)

    assert (result["beacon_status"] == BeaconStatus.ACTIVATED.value).all()
    assert "malfunction_start_date_utc" in result.columns
    assert "vms_last_position_datetime_utc" not in result.columns
    assert result.loc[0, "malfunction_start_date_utc"] == vms_date
    assert "beacon_status" not in vessels.columns  # original not mutated


# ─── Flow integration tests ────────────────────────────────────────────────────


def test_flow(reset_test_data):
    """
    CFR='GBR000888888' has an AIS position 2 hours ago (in test data) and a
    non-archived malfunction (id=6). The flow should PATCH that malfunction with
    isFollowed=True and add a pendoing alert for that vessel.
    """
    initial_pending_alerts = read_query(
        "SELECT * FROM pending_alerts", db="monitorfish_remote"
    )

    with patch("src.shared_tasks.beacon_malfunctions.requests") as mock_requests:
        state = beacon_malfunction_activity_detection_flow(return_state=True)

    assert state.is_completed()

    mock_requests.patch.assert_called_once_with(
        url=BEACON_MALFUNCTIONS_ENDPOINT + "6",
        json={"isFollowed": True},
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
            "X-API-KEY": "backend_api_key",
        },
    )

    final_pending_alerts = read_query(
        "SELECT * FROM pending_alerts", db="monitorfish_remote"
    )
    assert len(final_pending_alerts) == len(initial_pending_alerts) + 1
    assert "AIS ACTIVITY VESSEL" not in initial_pending_alerts.vessel_name.values
    assert "AIS ACTIVITY VESSEL" in final_pending_alerts.vessel_name.values
