from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd

from src.pipeline.shared_tasks.alerts import filter_silenced_alerts, make_alerts
from tests.mocks import mock_datetime_utcnow


@patch(
    "src.pipeline.shared_tasks.alerts.datetime",
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
            "vessel_name": ["Vessel_A", "Vessel_B"],
            "flag_state": ["FR", "BE"],
            "facade": ["NAMO", "MEMN"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "risk_factor": [1.23, 3.56],
            "creation_date": [date_1, date_2],
            "dml": ["dml 007", "dml 22"],
        }
    )

    alerts = make_alerts.run(
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
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "creation_date": [date_1, date_2],
            "type": ["MISSING_FAR_ALERT", "MISSING_FAR_ALERT"],
            "facade": ["NAMO", "MEMN"],
            "value": [
                {
                    "seaFront": "NAMO",
                    "flagState": "FR",
                    "type": "MISSING_FAR_ALERT",
                    "riskFactor": 1.23,
                    "dml": "dml 007",
                },
                {
                    "seaFront": "MEMN",
                    "flagState": "BE",
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
    )

    pd.testing.assert_frame_equal(alerts, expected_alerts)

    # Without creation_date in input
    vessels_in_alert = vessels_in_alert.drop(columns=["creation_date"])
    alerts = make_alerts.run(
        vessels_in_alert,
        alert_type="MISSING_FAR_ALERT",
        alert_config_name="MISSING_FAR_ALERT_CONFIG_1",
    )
    expected_alerts["creation_date"] = [
        datetime(2020, 5, 3, 8, 0, 0),
        datetime(2020, 5, 3, 8, 0, 0),
    ]

    pd.testing.assert_frame_equal(alerts, expected_alerts)


def test_filter_silenced_alerts():
    now = datetime(2020, 1, 1, 0, 0, 0)
    td = timedelta(hours=1)
    alert_type = "USER_DEFINED_ALERT_TYPE"
    alert_config_name = "ALERTE_CHALUTAGE_CONFIG_1"

    alerts = pd.DataFrame(
        {
            "vessel_name": ["v_A", "v_B"],
            "internal_reference_number": ["A", "B"],
            "external_reference_number": ["AA", "BB"],
            "ircs": ["AAA", "BBB"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "creation_date": [now, now - 0.5 * td],
            "type": ["USER_DEFINED_ALERT_TYPE", "USER_DEFINED_ALERT_TYPE"],
            "facade": ["NAMO", "MEMN"],
            "value": [
                {
                    "seaFront": "NAMO",
                    "flagState": "FR",
                    "type": alert_type,
                    "riskFactor": 1.23,
                    "dml": "dml A",
                },
                {
                    "seaFront": "MEMN",
                    "flagState": "FR",
                    "type": alert_type,
                    "riskFactor": None,
                    "dml": "dml B",
                },
            ],
            "alert_config_name": [alert_config_name, alert_config_name],
        }
    )

    silenced_alerts = pd.DataFrame(
        {
            "internal_reference_number": ["A", "B_ANOTHER_VESSEL"],
            "external_reference_number": ["AA", "BB_ANOTHER_VESSEL"],
            "ircs": ["AAA", "BBB"],
            "type": ["USER_DEFINED_ALERT_TYPE", "USER_DEFINED_ALERT_TYPE"],
            "facade": ["NAMO", "MEMN"],
        }
    )

    active_alerts = filter_silenced_alerts.run(alerts, silenced_alerts)

    expected_active_alerts = pd.DataFrame(
        {
            "vessel_name": ["v_B"],
            "internal_reference_number": ["B"],
            "external_reference_number": ["BB"],
            "ircs": ["BBB"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "creation_date": [now - 0.5 * td],
            "value": [
                {
                    "seaFront": "MEMN",
                    "flagState": "FR",
                    "type": alert_type,
                    "riskFactor": None,
                    "dml": "dml B",
                },
            ],
            "alert_config_name": [alert_config_name],
        }
    ).reset_index(drop=True)

    pd.testing.assert_frame_equal(
        active_alerts.reset_index(drop=True), expected_active_alerts
    )


def test_filter_silenced_alerts_when_multiple_silenced_alerts_facade():
    now = datetime(2020, 1, 1, 0, 0, 0)
    td = timedelta(hours=1)
    alert_type = "FRENCH_EEZ_FISHING_ALERT"
    alert_config_name = "ALERTE_CHALUTAGE_CONFIG_1"

    alerts = pd.DataFrame(
        {
            "vessel_name": ["v_A", "v_B"],
            "internal_reference_number": ["A", "B"],
            "external_reference_number": ["AA", "BB"],
            "ircs": ["AAA", "BBB"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "creation_date": [now, now - 0.5 * td],
            "type": ["USER_DEFINED_ALERT_TYPE", "USER_DEFINED_ALERT_TYPE"],
            "facade": ["NAMO", "MEMN"],
            "value": [
                {
                    "seaFront": "NAMO",
                    "flagState": "FR",
                    "type": alert_type,
                    "riskFactor": 1.23,
                    "dml": "dml A",
                },
                {
                    "seaFront": "MEMN",
                    "flagState": "FR",
                    "type": alert_type,
                    "riskFactor": None,
                    "dml": "dml B",
                },
            ],
            "alert_config_name": [alert_config_name, alert_config_name],
        }
    )

    silenced_alerts = pd.DataFrame(
        {
            "internal_reference_number": ["A", "A", "B_ANOTHER_VESSEL"],
            "external_reference_number": ["AA", "AA", "BB_ANOTHER_VESSEL"],
            "ircs": ["AAA", "AAA", "BBB"],
            "type": [
                "USER_DEFINED_ALERT_TYPE",
                "USER_DEFINED_ALERT_TYPE",
                "USER_DEFINED_ALERT_TYPE",
            ],
            "facade": ["NAMO", "SA", "MEMN"],
        }
    )

    active_alerts = filter_silenced_alerts.run(alerts, silenced_alerts)

    expected_active_alerts = pd.DataFrame(
        {
            "vessel_name": ["v_B"],
            "internal_reference_number": ["B"],
            "external_reference_number": ["BB"],
            "ircs": ["BBB"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "creation_date": [now - 0.5 * td],
            "value": [
                {
                    "seaFront": "MEMN",
                    "flagState": "FR",
                    "type": alert_type,
                    "riskFactor": None,
                    "dml": "dml B",
                },
            ],
            "alert_config_name": [alert_config_name],
        }
    ).reset_index(drop=True)

    pd.testing.assert_frame_equal(
        active_alerts.reset_index(drop=True), expected_active_alerts
    )
