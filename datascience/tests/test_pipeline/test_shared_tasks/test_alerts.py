import unittest
from datetime import datetime, timedelta

import pandas as pd

from src.pipeline.shared_tasks.alerts import filter_silenced_alerts


class TestSharedTasksAlerts(unittest.TestCase):
    def test_filter_silenced_alerts(self):
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
                    },
                    {
                        "seaFront": "MEMN",
                        "flagState": "FR",
                        "type": alert_type,
                        "riskFactor": None,
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
                "silenced_type": ["USER_DEFINED_ALERT_TYPE", "USER_DEFINED_ALERT_TYPE"],
                "silenced_sea_front": ["NAMO", "MEMN"],
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
                    },
                ],
                "alert_config_name": [alert_config_name],
            }
        ).reset_index(drop=True)

        pd.testing.assert_frame_equal(
            active_alerts.reset_index(drop=True), expected_active_alerts
        )
