from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest

from config import default_risk_factors
from src.pipeline.flows.last_positions import (
    compute_emission_period,
    concatenate,
    drop_duplicates,
    drop_unchanged_new_last_positions,
    estimate_current_positions,
    extract_beacon_malfunctions,
    extract_last_positions,
    extract_previous_last_positions,
    extract_reportings,
    extract_risk_factors,
    flow,
    join,
    load_last_positions,
    split,
    validate_action,
)
from src.read_query import read_query
from tests.mocks import (
    get_monitorfish_healthcheck_mock_factory,
    mock_check_flow_not_running,
)

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)
flow.replace(
    flow.get_tasks("get_monitorfish_healthcheck")[0],
    get_monitorfish_healthcheck_mock_factory(),
)


def test_extract_risk_factors(reset_test_data):
    risk_factors = extract_risk_factors.run()
    assert len(risk_factors) == 2
    assert list(risk_factors) == [
        "vessel_id",
        "cfr",
        "ircs",
        "external_immatriculation",
        "last_logbook_message_datetime_utc",
        "departure_datetime_utc",
        "trip_number",
        "gear_onboard",
        "species_onboard",
        "segments",
        "total_weight_onboard",
        "last_control_datetime_utc",
        "last_control_infraction",
        "post_control_comments",
        "impact_risk_factor",
        "probability_risk_factor",
        "detectability_risk_factor",
        "risk_factor",
    ]
    assert risk_factors.notnull().all().all()


def test_extract_previous_last_positions(reset_test_data):
    previous_last_positions = extract_previous_last_positions.run()
    assert previous_last_positions.shape == (4, 22)


def test_extract_last_positions(reset_test_data):
    last_positions = extract_last_positions.run(minutes=15)
    assert last_positions.shape == (2, 20)

    last_positions = extract_last_positions.run(minutes=35)
    assert last_positions.shape == (3, 20)


def test_extract_beacon_malfunctions(reset_test_data):
    malfunctions = extract_beacon_malfunctions.run()
    assert set(malfunctions.ircs) == {"OLY7853", "ZZ000000"}


def test_extract_reportings(reset_test_data):
    reportings = extract_reportings.run()
    expected_reportings = pd.DataFrame(
        {
            "vessel_id": [6],
            "cfr": [None],
            "ircs": ["ZZ000000"],
            "external_immatriculation": ["ZZTOPACDC"],
            "reportings": [["ALERT"]],
        }
    )
    pd.testing.assert_frame_equal(reportings, expected_reportings)


def test_load_last_positions(reset_test_data):
    last_positions_to_load = pd.DataFrame(
        {
            "id": [13639642, 13640935],
            "vessel_id": [1, None],
            "cfr": ["ABC000306959", "ABC000542519"],
            "external_immatriculation": ["RV348407", "RO237719"],
            "mmsi": [None, None],
            "ircs": ["LLUK", "FQ7058"],
            "vessel_name": ["ÉTABLIR IMPRESSION LORSQUE", "DEVINER FIGURE CONSCIENCE"],
            "flag_state": ["FR", "FR"],
            "district_code": ["CC", "CC"],
            "district": ["Concarneau", "Concarneau"],
            "registry_port": ["Concarneau", "Concarneau"],
            "width": [3.23, 3.13],
            "length": [17.4, 11.4],
            "under_charter": [False, True],
            "latitude": [49.61, 43.324],
            "longitude": [-0.74, 5.359],
            "speed": [1.0, 0.0],
            "course": [302.0, 0.0],
            "last_position_datetime_utc": [
                datetime(2021, 12, 5, 11, 52, 32),
                datetime(2018, 12, 5, 11, 52, 32),
            ],
            "emission_period": [None, None],
            "trip_number": ["2021001", None],
            "last_logbook_message_datetime_utc": [
                datetime(2021, 12, 4, 19, 12, 3),
                None,
            ],
            "departure_datetime_utc": [datetime(2021, 12, 3, 21, 55, 2), None],
            "gear_onboard": [[{"gear": "OTB", "mesh": 75.0, "dimensions": 12.0}], None],
            "segments": [["NWW01/02"], None],
            "species_onboard": [
                [
                    {
                        "gear": "OTB",
                        "weight": 30.0,
                        "faoZone": "27.7.d",
                        "species": "SQZ",
                    }
                ],
                None,
            ],
            "total_weight_onboard": [30.0, None],
            "last_control_datetime_utc": [datetime(2020, 1, 5, 9, 5, 32), None],
            "last_control_infraction": [False, None],
            "post_control_comments": ["RAS", None],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "estimated_current_latitude": [49.61, 43.324],
            "estimated_current_longitude": [-0.74, 5.359],
            "impact_risk_factor": [2.0, 1.8],
            "probability_risk_factor": [2.1, 2.0],
            "detectability_risk_factor": [1.3, 1.0],
            "risk_factor": [2.36, 1.5],
            "is_at_port": [True, False],
            "alerts": [["THREE_MILES_TRAWLING_ALERT"], None],
            "reportings": [["ALERT"], None],
            "is_manual": [True, False],
            "beacon_malfunction_id": [1, None],
        }
    )
    load_last_positions.run(last_positions_to_load)


def test_validate_action():
    assert validate_action.run("update") == "update"
    assert validate_action.run("replace") == "replace"
    with pytest.raises(ValueError):
        validate_action.run("unknown_option")


def test_drop_duplicates():
    d = datetime(2020, 2, 1, 12, 0, 0)
    td = timedelta(hours=1)
    positions = pd.DataFrame(
        {
            "vessel_id": [1, 1, 2, None, None, 4, 4, None, None],
            "last_position_datetime_utc": [
                d,
                d + 0.5 * td,
                d + 3 * td,
                d + 4.2 * td,
                d + 2.8 * td,
                d + 2.9 * td,
                d + 1.9 * td,
                d + 1.1 * td,
                d + 5.5 * td,
            ],
            "cfr": ["A", "A", "B", "C", "C", None, "D", None, None],
            "external_immatriculation": [
                "AA",
                "A-A",
                "BB",
                "CC",
                "C-C",
                "DD",
                "DD",
                "EE",
                None,
            ],
            "ircs": ["AAA", "AAA", "BBB", "CCC", "CCC", "DDD", "DDD", None, "BBB"],
            "other_columns": [
                "some",
                "more",
                "data",
                "to",
                "fill",
                "my",
                "test",
                "data",
                "frame",
            ],
        }
    )

    res = drop_duplicates.run(positions)
    expected_res = positions.iloc[[2, 5, 1, 3, 7]]
    pd.testing.assert_frame_equal(res, expected_res)


def test_drop_unchanged_new_last_positions():
    previous_last_positions = pd.DataFrame(
        {
            "id": [1, 2, 3, 4],
            "vessel_id": ["A", "B", "C", "D"],
            "some": [1.1, 0.2, -5.65, 1],
            "more": ["b", "c", "d", "a"],
            "data": [None, None, None, None],
        }
    )

    new_last_positions = pd.DataFrame(
        {
            "id": [4, 5, 6],
            "vessel_id": ["D", "E", "A"],
            "some": [1.8, 2.2, -1.1],
            "more": ["a", "d", "f"],
            "data": [None, 42, ""],
        }
    )

    expected_res = pd.DataFrame(
        {
            "id": [5, 6],
            "vessel_id": ["E", "A"],
            "some": [2.2, -1.1],
            "more": ["d", "f"],
            "data": [42, ""],
        }
    )

    res = drop_unchanged_new_last_positions.run(
        new_last_positions, previous_last_positions
    )

    assert list(res) == list(expected_res)
    assert res.values.tolist() == expected_res.values.tolist()


def test_split():
    previous_last_positions = pd.DataFrame(
        {
            "vessel_id": [1, None, 3, None, None, 7],
            "cfr": ["A", "B", "C", None, None, "G"],
            "external_immatriculation": [
                "AA",
                "BB",
                None,
                "DD",
                None,
                "GG_will_change",
            ],
            "ircs": [None, None, None, None, "EEE", "GGG_will_be_removed"],
            "last_position_datetime_utc": [
                datetime(2021, 10, 1, 20, 52, 10),
                datetime(2021, 10, 1, 20, 42, 10),
                datetime(2021, 10, 1, 20, 32, 10),
                datetime(2021, 10, 1, 19, 52, 10),
                datetime(2021, 10, 1, 20, 16, 10),
                datetime(2021, 10, 1, 19, 16, 55),
            ],
        }
    )

    new_last_positions = pd.DataFrame(
        {
            "vessel_id": [1, None, None, None],
            "cfr": ["A", None, "F", "G"],
            "external_immatriculation": ["AA", None, "FF", "GG_updated"],
            "ircs": ["AAA", "EEE", None, None],
            "last_position_datetime_utc": [
                datetime(2021, 10, 1, 21, 52, 10),
                datetime(2021, 10, 1, 21, 56, 10),
                datetime(2021, 10, 1, 21, 54, 10),
                datetime(2021, 10, 1, 20, 17, 25),
            ],
            "some": [1, 2, 3, 4],
            "more": ["a", "b", "c", "g"],
            "data": [None, 2.256, "Bla", "Picachu"],
        }
    )

    (
        unchanged_previous_last_positions,
        new_vessels_last_positions,
        last_positions_to_update,
    ) = split.run(previous_last_positions, new_last_positions)

    expected_unchanged_previous_last_positions = previous_last_positions.iloc[[1, 2, 3]]

    expected_new_vessels_last_positions = new_last_positions.iloc[[2]]

    expected_last_positions_to_update = pd.DataFrame(
        {
            "vessel_id": [1, None, None],
            "cfr": ["A", "G", None],
            "external_immatriculation": ["AA", "GG_updated", None],
            "ircs": ["AAA", None, "EEE"],
            "last_position_datetime_utc_new": [
                datetime(2021, 10, 1, 21, 52, 10),
                datetime(2021, 10, 1, 20, 17, 25),
                datetime(2021, 10, 1, 21, 56, 10),
            ],
            "some": [1, 4, 2],
            "more": ["a", "g", "b"],
            "data": [None, "Picachu", 2.256],
            "last_position_datetime_utc_previous": [
                datetime(2021, 10, 1, 20, 52, 10),
                datetime(2021, 10, 1, 19, 16, 55),
                datetime(2021, 10, 1, 20, 16, 10),
            ],
        },
    ).astype({"data": "object"})

    pd.testing.assert_frame_equal(
        unchanged_previous_last_positions,
        expected_unchanged_previous_last_positions,
    )

    pd.testing.assert_frame_equal(
        new_vessels_last_positions, expected_new_vessels_last_positions
    )

    pd.testing.assert_frame_equal(
        last_positions_to_update, expected_last_positions_to_update
    )


def test_compute_emission_period():
    last_positions_to_update = pd.DataFrame(
        {
            "cfr": ["A", None],
            "external_immatriculation": ["AA", None],
            "ircs": ["AAA", "EEE"],
            "last_position_datetime_utc_previous": [
                datetime(2021, 10, 1, 20, 52, 10),
                datetime(2021, 10, 1, 20, 16, 10),
            ],
            "last_position_datetime_utc_new": [
                datetime(2021, 10, 1, 21, 52, 10),
                datetime(2021, 10, 1, 21, 56, 10),
            ],
            "emission_period": [timedelta(minutes=10), None],
            "some": [1, 2],
            "more": ["a", "b"],
            "data": [None, 2.256],
        },
    )

    updated_last_positions = compute_emission_period.run(last_positions_to_update)

    expected_updated_last_positions = pd.DataFrame(
        {
            "cfr": ["A", None],
            "external_immatriculation": ["AA", None],
            "ircs": ["AAA", "EEE"],
            "last_position_datetime_utc": [
                datetime(2021, 10, 1, 21, 52, 10),
                datetime(2021, 10, 1, 21, 56, 10),
            ],
            "emission_period": [
                timedelta(minutes=10),
                timedelta(hours=1, minutes=40),
            ],
            "some": [1, 2],
            "more": ["a", "b"],
            "data": [None, 2.256],
        },
    )

    assert updated_last_positions.equals(expected_updated_last_positions)


def test_concatenate():

    unchanged_previous_last_positions = pd.DataFrame(
        {
            "vessel_id": ["A", "B", "C"],
            "some": [1, 2, None],
            "more": ["a", None, "c"],
            "data": [None, 2.256, 0.1],
        }
    )

    new_vessels_last_positions = pd.DataFrame(
        {"vessel_id": ["D"], "some": [1], "more": ["d"], "data": [2.36]}
    )

    updated_last_positions = pd.DataFrame(
        {
            "vessel_id": ["E", "F"],
            "some": [1, 2],
            "more": ["e", "f"],
            "data": [None, 21.256],
        }
    )

    expected_last_positions = pd.DataFrame(
        {
            "vessel_id": ["A", "B", "C", "D", "E", "F"],
            "some": [1, 2, None, 1, 1, 2],
            "more": ["a", None, "c", "d", "e", "f"],
            "data": [None, 2.256, 0.1, 2.36, None, 21.256],
        }
    )

    last_positions = concatenate.run(
        unchanged_previous_last_positions,
        new_vessels_last_positions,
        updated_last_positions,
    )

    assert last_positions.equals(expected_last_positions)


@patch("src.pipeline.flows.last_positions.datetime")
def test_estimate_current_positions(mock_datetime):

    mock_datetime.utcnow = lambda: datetime(2021, 10, 1, 10, 0, 0)

    last_positions = pd.DataFrame(
        {
            "latitude": [45, 45.1, 45.2, 45.3],
            "longitude": [-5, -5.1, -5.2, -5.3],
            "course": [0, 45, "invalid", 180],
            "speed": [0, 5, 10, 10.2],
            "last_position_datetime_utc": [
                datetime(2021, 10, 1, 0, 0, 0),
                datetime(2021, 10, 1, 9, 0, 0),
                datetime(2021, 10, 1, 9, 30, 0),
                datetime(2021, 10, 1, 10, 0, 10),
            ],
        }
    )

    expected_estimated_current_positions = last_positions.copy(deep=True)
    expected_estimated_current_positions["estimated_current_latitude"] = [
        None,
        45.158888,
        None,
        None,
    ]
    expected_estimated_current_positions["estimated_current_longitude"] = [
        None,
        -5.016725,
        None,
        None,
    ]

    estimated_current_positions = estimate_current_positions.run(
        last_positions=last_positions, max_hours_since_last_position=1.5
    )

    pd.testing.assert_frame_equal(
        estimated_current_positions, expected_estimated_current_positions
    )


def test_join():

    last_positions = pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, None],
            "cfr": ["A", "B", None, None],
            "ircs": ["aa", "bb", "cc", None],
            "external_immatriculation": ["aaa", None, None, "ddd"],
            "latitude": [45, 45.12, 56.214, 21.325],
            "longitude": [-5.1236, -12.85, 1.01, -1.236],
        }
    )

    risk_factors = pd.DataFrame(
        {
            "vessel_id": [1, 3, 4, 5],
            "cfr": [None, None, "d", "E"],
            "ircs": ["aa", "cc", None, "ee"],
            "external_immatriculation": ["aaa", None, "ddd", "eee"],
            "impact_risk_factor": [1.2, 3.8, 1.2, 3.7],
            "probability_risk_factor": [1.3, 1.5, 2.1, 2.2],
            "detectability_risk_factor": [2.1, 2.3, 2.3, 1.4],
            "risk_factor": [1.8, 3.0, 1.9, 3.3],
            "total_weight_onboard": [121.2, None, None, 4.0],
        }
    )

    pending_alerts = pd.DataFrame(
        {
            "vessel_id": [1, 6],
            "cfr": ["A", "F"],
            "ircs": [None, "ff"],
            "external_immatriculation": ["aaa", None],
            "alerts": [
                ["THREE_MILES_TRAWLING_ALERT", "SOME_OTHER_ALERT"],
                ["THREE_MILES_TRAWLING_ALERT"],
            ],
        }
    )

    reportings = pd.DataFrame(
        {
            "vessel_id": [1, 6],
            "cfr": ["A", "F"],
            "ircs": [None, "ff"],
            "external_immatriculation": ["aaa", None],
            "reportings": [
                ["OBSERVATION", "ALERT"],
                ["INFRACTION_SUSPICION"],
            ],
        }
    )

    known_malfunctions = pd.DataFrame(
        {
            "vessel_id": [2, 1, 5],
            "id": [1, 2, 3],
            "cfr": ["B", "A", "E"],
            "external_immatriculation": ["BB", "AAA", "EE"],
            "ircs": ["BBB", "AAA", "EEE"],
        }
    )

    res = join.run(
        last_positions, risk_factors, pending_alerts, reportings, known_malfunctions
    )

    res = res.sort_values("vessel_id").reset_index(drop=True)

    expected_res = pd.DataFrame(
        {
            "vessel_id": [1.0, 2.0, 3.0, 4.0],
            "cfr": ["A", "B", None, "d"],
            "ircs": ["aa", "bb", "cc", None],
            "external_immatriculation": ["aaa", "BB", None, "ddd"],
            "latitude": [45, 45.12, 56.214, 21.325],
            "longitude": [-5.1236, -12.85, 1.01, -1.236],
            "impact_risk_factor": [1.2, None, 3.8, 1.2],
            "probability_risk_factor": [1.3, None, 1.5, 2.1],
            "detectability_risk_factor": [2.1, None, 2.3, 2.3],
            "risk_factor": [1.8, None, 3.0, 1.9],
            "total_weight_onboard": [121.2, 0.0, 0.0, 0.0],
            "alerts": [
                ["THREE_MILES_TRAWLING_ALERT", "SOME_OTHER_ALERT"],
                None,
                None,
                None,
            ],
            "reportings": [
                ["OBSERVATION", "ALERT"],
                None,
                None,
                None,
            ],
            "beacon_malfunction_id": [2, 1, None, None],
        }
    ).fillna({**default_risk_factors})

    pd.testing.assert_frame_equal(expected_res, res)


def test_last_positions_flow_resets_last_positions_when_action_is_replace(
    reset_test_data,
):
    initial_last_positions = read_query(
        "monitorfish_remote", "SELECT * FROM last_positions;"
    )

    state = flow.run(action="replace", minutes=1200)
    assert state.is_successful()

    final_last_positions = read_query(
        "monitorfish_remote", "SELECT * FROM last_positions;"
    )

    assert len(initial_last_positions) == 4
    assert len(final_last_positions) == 4
    assert set(initial_last_positions.external_immatriculation) == {
        "AS761555",
        "RO237719",
        "SB125334",
        "ZZTOPACDC",
    }
    assert set(final_last_positions.external_immatriculation) == {
        "RV348407",
        "RO237719",
        "OHMYGOSH",
        "ZZTOPACDC",
    }


def test_last_positions_flow_updates_last_positions_when_action_is_update(
    reset_test_data,
):
    initial_last_positions = read_query(
        "monitorfish_remote", "SELECT * FROM last_positions;"
    )

    state = flow.run(action="update", minutes=35)
    assert state.is_successful()

    final_last_positions = read_query(
        "monitorfish_remote", "SELECT * FROM last_positions;"
    )

    assert len(initial_last_positions) == 4
    assert len(final_last_positions) == 5
    assert set(initial_last_positions.external_immatriculation) == {
        "AS761555",
        "RO237719",
        "SB125334",
        "ZZTOPACDC",
    }
    assert set(final_last_positions.external_immatriculation) == {
        "AS761555",
        "RO237719",
        "SB125334",
        "RV348407",
        "ZZTOPACDC",
    }

    assert (
        initial_last_positions.loc[
            initial_last_positions.external_immatriculation == "RO237719", "id"
        ]
        == 13638407
    ).all()

    assert (
        final_last_positions.loc[
            final_last_positions.external_immatriculation == "RO237719", "id"
        ]
        == 13640935
    ).all()
