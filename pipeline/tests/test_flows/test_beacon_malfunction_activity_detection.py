from datetime import datetime
from unittest.mock import call, patch

import pandas as pd

from config import BEACON_MALFUNCTIONS_ENDPOINT
from src.entities.alerts import AlertType
from src.flows.beacon_malfunction_activity_detection import (
    add_malfunction_start_fields,
    beacon_malfunction_activity_detection_flow,
    filter_vessels_at_sea,
    get_malfunction_ids_not_already_followed,
    get_malfunction_ids_with_activity,
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


def test_get_malfunction_ids_with_activity_returns_matching_ids():
    vessels = pd.DataFrame({"cfr": ["ABC000306959", "SOME_OTHER_CFR"]})
    malfunctions = pd.DataFrame(
        {
            "id": [5, 99],
            "cfr": ["ABC000306959", "UNRELATED_CFR"],
            "beacon_number": ["987654", "XXXXX"],
        }
    )
    assert get_malfunction_ids_with_activity(vessels, malfunctions) == [5]


def test_get_malfunction_ids_with_activity_returns_empty_when_no_cfr_match():
    vessels = pd.DataFrame({"cfr": ["NO_MATCH_CFR"]})
    malfunctions = pd.DataFrame(
        {"id": [5], "cfr": ["DIFFERENT_CFR"], "beacon_number": ["987654"]}
    )
    assert get_malfunction_ids_with_activity(vessels, malfunctions) == []


def test_get_malfunction_ids_with_activity_returns_empty_when_vessels_is_empty():
    assert get_malfunction_ids_with_activity(pd.DataFrame(), pd.DataFrame()) == []


def test_get_malfunction_ids_with_activity_returns_empty_when_malfunctions_is_empty():
    vessels = pd.DataFrame({"cfr": ["ABC000306959"]})
    assert get_malfunction_ids_with_activity(vessels, pd.DataFrame()) == []


def test_get_malfunction_ids_not_already_followed_keeps_only_unfollowed():
    malfunctions = pd.DataFrame({"id": [1, 2, 3], "is_followed": [True, False, False]})
    assert get_malfunction_ids_not_already_followed(malfunctions) == [2, 3]


def test_get_malfunction_ids_not_already_followed_returns_empty_when_all_followed():
    malfunctions = pd.DataFrame({"id": [1, 2], "is_followed": [True, True]})
    assert get_malfunction_ids_not_already_followed(malfunctions) == []


def test_get_malfunction_ids_not_already_followed_returns_empty_when_no_malfunction():
    malfunctions = pd.DataFrame({"id": [], "is_followed": []})
    assert get_malfunction_ids_not_already_followed(malfunctions) == []


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


def test_add_malfunction_start_fields_renames_vms_date():
    vms_date = datetime(2026, 1, 1, 10, 0, 0)
    vessels = pd.DataFrame(
        {
            "cfr": ["A", "B"],
            "vms_last_position_datetime_utc": [vms_date, None],
            "extra_col": [1, 2],
        }
    )
    result = add_malfunction_start_fields(vessels)

    assert "malfunction_start_date_utc" in result.columns
    assert "vms_last_position_datetime_utc" not in result.columns
    assert result.loc[0, "malfunction_start_date_utc"] == vms_date


# ─── Flow integration tests ────────────────────────────────────────────────────

DECLARED_ACTIVITY_ALERT = (
    AlertType.DECLARED_FISHING_ACTIVITY_DURING_BEACON_MALFUNCTION.value
)
SALE_ALERT = AlertType.SALE_DURING_BEACON_MALFUNCTION.value


def test_flow(reset_test_data):
    """
    Exercises the flow's three ways of detecting activity on a vessel with an active,
    non-archived beacon malfunction (see V666.3, V666.5 and V666.51 for the test
    data):

      - AIS: CFR 'GBR000888888' (malfunction id=6) has a recent AIS position and no
        recent VMS emission.
      - Declared fishing activity: CFR 'ABC000306959' (malfunction id=5) has a recent
        FAR declaration.
      - Sale: CFR 'ABC000306959' (malfunction id=5) also has a recent sales note.

    In each case, the flow should follow the malfunction (PATCH isFollowed=True) and
    raise a pending alert for the vessel.
    """
    headers = {
        "Accept": "application/json, text/plain",
        "Content-Type": "application/json;charset=UTF-8",
        "X-API-KEY": "backend_api_key",
    }

    initial_pending_alerts = read_query(
        "SELECT * FROM pending_alerts", db="monitorfish_remote"
    )

    with patch("src.shared_tasks.beacon_malfunctions.requests") as mock_requests:
        state = beacon_malfunction_activity_detection_flow(return_state=True)

    assert state.is_completed()

    # Malfunction id=6 is followed once (AIS); id=5 is followed twice, once for the
    # declared-activity path and once for the sale path.
    mock_requests.patch.assert_has_calls(
        [
            call(
                url=BEACON_MALFUNCTIONS_ENDPOINT + "6",
                json={"isFollowed": True},
                headers=headers,
            ),
            call(
                url=BEACON_MALFUNCTIONS_ENDPOINT + "5",
                json={"isFollowed": True},
                headers=headers,
            ),
            call(
                url=BEACON_MALFUNCTIONS_ENDPOINT + "5",
                json={"isFollowed": True},
                headers=headers,
            ),
        ],
        any_order=True,
    )
    assert mock_requests.patch.call_count == 3

    final_pending_alerts = read_query(
        "SELECT * FROM pending_alerts", db="monitorfish_remote"
    )
    assert len(final_pending_alerts) == len(initial_pending_alerts) + 3

    ais_alerts = final_pending_alerts.loc[
        final_pending_alerts.vessel_name == "AIS ACTIVITY VESSEL"
    ]
    assert ais_alerts.internal_reference_number.tolist() == ["GBR000888888"]

    declared_activity_alerts = final_pending_alerts.loc[
        final_pending_alerts.alert_config_name == DECLARED_ACTIVITY_ALERT
    ]
    assert declared_activity_alerts.internal_reference_number.tolist() == [
        "ABC000306959"
    ]
    assert declared_activity_alerts.iloc[0].value["type"] == DECLARED_ACTIVITY_ALERT

    sale_alerts = final_pending_alerts.loc[
        final_pending_alerts.alert_config_name == SALE_ALERT
    ]
    assert sale_alerts.internal_reference_number.tolist() == ["ABC000306959"]
    assert sale_alerts.iloc[0].value["type"] == SALE_ALERT
