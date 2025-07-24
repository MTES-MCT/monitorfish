from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest

from src.entities.alerts import AlertType
from src.read_query import read_query
from src.shared_tasks.alerts import (
    archive_reporting,
    extract_active_reportings,
    extract_non_archived_reportings_ids_of_type,
    extract_pending_alerts_ids_of_type,
    extract_silenced_alerts,
    filter_alerts,
    load_alerts,
    make_alerts,
    validate_pending_alert,
)
from tests.mocks import mock_datetime_utcnow


def test_extract_silenced_alerts(reset_test_data):
    silenced_alerts = extract_silenced_alerts(
        AlertType.THREE_MILES_TRAWLING_ALERT.value
    )
    now = datetime.utcnow()
    d = timedelta(days=1)
    h = timedelta(hours=1)

    expected_silenced_alerts = pd.DataFrame(
        {
            "internal_reference_number": ["ABC000658985"],
            "external_reference_number": ["OHMYGOSH"],
            "ircs": ["OGMJ"],
            "silenced_before_date": [now + 15 * d],
        }
    )
    pd.testing.assert_frame_equal(
        silenced_alerts.drop(columns=["silenced_before_date"]),
        expected_silenced_alerts.drop(columns=["silenced_before_date"]),
    )
    assert (
        (
            silenced_alerts.silenced_before_date
            - expected_silenced_alerts.silenced_before_date
        ).map(lambda td: td.total_seconds())
        < 10
    ).all()

    silenced_alerts = extract_silenced_alerts(AlertType.MISSING_FAR_ALERT.value)
    expected_silenced_alerts = pd.DataFrame(
        {
            "internal_reference_number": ["ABC000542519"],
            "external_reference_number": ["RO237719"],
            "ircs": ["FQ7058"],
            "silenced_before_date": [now + 15 * d],
        }
    )
    pd.testing.assert_frame_equal(
        silenced_alerts.drop(columns=["silenced_before_date"]),
        expected_silenced_alerts.drop(columns=["silenced_before_date"]),
    )
    assert (
        (
            silenced_alerts.silenced_before_date
            - expected_silenced_alerts.silenced_before_date
        ).map(lambda td: td.total_seconds())
        < 10
    ).all()

    silenced_alerts = extract_silenced_alerts(
        AlertType.MISSING_FAR_ALERT.value, number_of_hours=6
    )
    expected_silenced_alerts = pd.DataFrame(
        {
            "internal_reference_number": ["ABC000123456", "ABC000542519"],
            "external_reference_number": [None, "RO237719"],
            "ircs": [None, "FQ7058"],
            "silenced_before_date": [now - 5 * h, now + 15 * d],
        }
    )
    pd.testing.assert_frame_equal(
        silenced_alerts.drop(columns=["silenced_before_date"]),
        expected_silenced_alerts.drop(columns=["silenced_before_date"]),
    )
    assert (
        (
            silenced_alerts.silenced_before_date
            - expected_silenced_alerts.silenced_before_date
        ).map(lambda td: td.total_seconds())
        < 10
    ).all()


def test_extract_active_reportings(reset_test_data):
    active_reportings = extract_active_reportings(
        AlertType.THREE_MILES_TRAWLING_ALERT.value
    )
    expected_active_reportings = pd.DataFrame(
        {
            "internal_reference_number": [None, "SOME_VESSEL"],
            "external_reference_number": ["ZZTOPACDC", "BLABLABLA"],
            "ircs": ["ZZ000000", None],
        }
    )
    pd.testing.assert_frame_equal(
        active_reportings.sort_values(
            "external_reference_number", ascending=False
        ).reset_index(drop=True),
        expected_active_reportings,
    )

    active_reportings = extract_active_reportings(AlertType.MISSING_FAR_ALERT.value)
    pd.testing.assert_frame_equal(active_reportings, expected_active_reportings.head(0))


def test_extract_pending_alerts_ids_of_type(reset_test_data):
    assert extract_pending_alerts_ids_of_type(
        alert_type="THREE_MILES_TRAWLING_ALERT"
    ) == [12]

    with pytest.raises(ValueError):
        extract_pending_alerts_ids_of_type(alert_type="NON_EXISTING_ALERT")


def test_extract_non_archived_reportings_ids_of_type(reset_test_data):
    assert extract_non_archived_reportings_ids_of_type(
        alert_type="THREE_MILES_TRAWLING_ALERT"
    ) == [56, 57]

    with pytest.raises(ValueError):
        extract_non_archived_reportings_ids_of_type(alert_type="NON_EXISTING_ALERT")


@patch("src.shared_tasks.alerts.requests")
def test_validate_pending_alert(requests_mock):
    validate_pending_alert(12)
    requests_mock.put.assert_called_once_with(
        "https://monitor.fish/api/v1/operational_alerts/12/validate"
    )


@patch("src.shared_tasks.alerts.requests")
def test_archive_reporting(requests_mock):
    archive_reporting(12)
    requests_mock.put.assert_called_once_with(
        "https://monitor.fish/api/v1/reportings/12/archive"
    )


@patch(
    "src.shared_tasks.alerts.datetime",
    mock_datetime_utcnow(datetime(2020, 5, 3, 8, 0, 0)),
)
def test_make_alerts():
    date_1 = datetime(2020, 1, 2, 11, 12, 30)
    date_2 = datetime(2022, 1, 2, 10, 10, 0)
    # With creation_date in input
    vessels_in_alert = pd.DataFrame(
        {
            "cfr": ["A", "B"],
            "external_immatriculation": ["AA", "BB"],
            "ircs": ["AAA", "BBB"],
            "flag_state": ["FR", "BE"],
            "vessel_name": ["Vessel_A", "Vessel_B"],
            "facade": ["NAMO", "MEMN"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "risk_factor": [1.23, 3.56],
            "triggering_behaviour_datetime_utc": [date_1, date_2],
            "latitude": [9.8, -1.963],
            "longitude": [65.59, -81.71],
            "vessel_id": [1, 12],
            "dml": ["dml 007", "dml 22"],
        }
    )

    alerts = make_alerts(
        vessels_in_alert,
        alert_type="MISSING_FAR_ALERT",
        alert_config_name="MISSING_FAR_ALERT_CONFIG_1",
    )

    expected_alerts = pd.DataFrame(
        {
            "vessel_name": ["Vessel_A", "Vessel_B"],
            "internal_reference_number": ["A", "B"],
            "external_reference_number": ["AA", "BB"],
            "ircs": ["AAA", "BBB"],
            "flag_state": ["FR", "BE"],
            "vessel_id": [1, 12],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "triggering_behaviour_datetime_utc": [date_1, date_2],
            "creation_date": [datetime(2020, 5, 3, 8, 0, 0)] * 2,
            "latitude": [9.8, -1.963],
            "longitude": [65.59, -81.71],
            "type": ["MISSING_FAR_ALERT", "MISSING_FAR_ALERT"],
            "value": [
                {
                    "seaFront": "NAMO",
                    "type": "MISSING_FAR_ALERT",
                    "riskFactor": 1.23,
                    "dml": "dml 007",
                },
                {
                    "seaFront": "MEMN",
                    "type": "MISSING_FAR_ALERT",
                    "riskFactor": 3.56,
                    "dml": "dml 22",
                },
            ],
            "alert_config_name": [
                "MISSING_FAR_ALERT_CONFIG_1",
                "MISSING_FAR_ALERT_CONFIG_1",
            ],
        }
    ).astype({"creation_date": "datetime64[us]"})

    pd.testing.assert_frame_equal(alerts, expected_alerts)

    # Without optional in input
    vessels_in_alert = vessels_in_alert.drop(columns=["latitude", "longitude"])
    alerts = make_alerts(
        vessels_in_alert,
        alert_type="MISSING_FAR_ALERT",
        alert_config_name="MISSING_FAR_ALERT_CONFIG_1",
    )
    expected_alerts["latitude"] = None
    expected_alerts["longitude"] = None
    expected_alerts["creation_date"] = [
        datetime(2020, 5, 3, 8, 0, 0),
        datetime(2020, 5, 3, 8, 0, 0),
    ]
    expected_alerts = expected_alerts.astype({"creation_date": "datetime64[us]"})

    pd.testing.assert_frame_equal(alerts, expected_alerts)


@pytest.fixture
def first_of_january_2000() -> datetime:
    return datetime(2020, 1, 1, 0, 0, 0)


@pytest.fixture
def one_day() -> timedelta:
    return timedelta(days=1)


@pytest.fixture
def alerts_to_filter(first_of_january_2000, one_day) -> pd.DataFrame:
    alert_type = "USER_DEFINED_ALERT_TYPE"
    alert_config_name = "ALERTE_CHALUTAGE_CONFIG_1"

    return pd.DataFrame(
        {
            "vessel_name": ["v_A", "v_B", "v_C"],
            "internal_reference_number": ["A", "B", "C"],
            "external_reference_number": ["AA", "BB", "CC"],
            "ircs": ["AAA", "BBB", "CCC"],
            "flag_state": ["FR", "FR", "FR"],
            "vessel_id": [1, 12, 15],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "triggering_behaviour_datetime_utc": [
                first_of_january_2000 - 0.5 * one_day,
                first_of_january_2000 - 0.5 * one_day,
                first_of_january_2000 - one_day,
            ],
            "creation_date": [first_of_january_2000] * 3,
            "latitude": [9.8, -1.963, -2.365],
            "longitude": [65.59, -81.71, 46.894],
            "type": [alert_type, alert_type, alert_type],
            "value": [
                {
                    "seaFront": "NAMO",
                    "type": alert_type,
                    "riskFactor": 1.23,
                    "dml": "dml A",
                },
                {
                    "seaFront": "MEMN",
                    "type": alert_type,
                    "riskFactor": None,
                    "dml": "dml B",
                },
                {
                    "seaFront": "MEMN",
                    "type": alert_type,
                    "riskFactor": 2.56,
                    "dml": "dml C",
                },
            ],
            "alert_config_name": [
                alert_config_name,
                alert_config_name,
                alert_config_name,
            ],
        }
    )


@pytest.fixture
def silenced_alerts_1(first_of_january_2000, one_day) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "internal_reference_number": ["A", "B_ANOTHER_VESSEL", "C"],
            "external_reference_number": ["AA", "BB_ANOTHER_VESSEL", "CC"],
            "ircs": ["AAA", "BBB", "CCC"],
            "silenced_before_date": [first_of_january_2000 - 1.25 * one_day] * 3,
        }
    )


@pytest.fixture
def silenced_alerts_2(
    silenced_alerts_1, first_of_january_2000, one_day
) -> pd.DataFrame:
    return silenced_alerts_1.assign(
        silenced_before_date=first_of_january_2000 - 0.75 * one_day
    )


@pytest.fixture
def silenced_alerts_3(
    silenced_alerts_1, first_of_january_2000, one_day
) -> pd.DataFrame:
    return silenced_alerts_1.assign(
        silenced_before_date=first_of_january_2000 - 0.25 * one_day
    )


@pytest.fixture
def expected_filtered_alerts(alerts_to_filter) -> pd.DataFrame:
    return alerts_to_filter.drop(columns=["type", "triggering_behaviour_datetime_utc"])


def test_filter_alerts(
    alerts_to_filter,
    silenced_alerts_1,
    silenced_alerts_2,
    silenced_alerts_3,
    expected_filtered_alerts,
):
    filtered_alerts_1 = filter_alerts(alerts_to_filter, silenced_alerts_1)
    pd.testing.assert_frame_equal(filtered_alerts_1, expected_filtered_alerts)

    filtered_alerts_2 = filter_alerts(alerts_to_filter, silenced_alerts_2)
    pd.testing.assert_frame_equal(filtered_alerts_2, expected_filtered_alerts.head(2))

    filtered_alerts_3 = filter_alerts(alerts_to_filter, silenced_alerts_3)
    pd.testing.assert_frame_equal(
        filtered_alerts_3, expected_filtered_alerts.loc[[1]].reset_index(drop=True)
    )


def test_load_alerts(reset_test_data):
    initial_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")

    now = datetime(2020, 1, 1, 0, 0, 0)
    td = timedelta(hours=1)
    alert_type = "FRENCH_EEZ_FISHING_ALERT"
    alert_config_name = "ALERTE_CHALUTAGE_CONFIG_1"
    alerts_to_load = pd.DataFrame(
        {
            "vessel_name": ["v_B"],
            "internal_reference_number": ["B"],
            "external_reference_number": ["BB"],
            "ircs": ["BBB"],
            "flag_state": ["FR"],
            "vessel_id": [12],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "creation_date": [now - 0.5 * td],
            "latitude": [-1.963],
            "longitude": [-81.71],
            "value": [
                {
                    "seaFront": "MEMN",
                    "type": alert_type,
                    "riskFactor": None,
                    "dml": "dml B",
                },
            ],
            "alert_config_name": [alert_config_name],
        }
    )

    load_alerts(alerts_to_load, alert_config_name=alert_config_name)
    final_alerts = read_query("SELECT * FROM pending_alerts", db="monitorfish_remote")
    assert len(final_alerts) == len(initial_alerts) + 1
