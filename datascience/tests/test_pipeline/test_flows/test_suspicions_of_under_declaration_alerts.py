from datetime import datetime, timedelta, timezone

import pandas as pd
import pytest
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.flows.suspicions_of_under_declaration_alerts import (
    extract_suspicions_of_under_declaration,
    flow,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def expected_suspicions_of_under_declaration() -> pd.DataFrame:
    today_at_zero_hours = datetime.utcnow().replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    one_day = timedelta(days=1)
    return pd.DataFrame(
        {
            "cfr": ["ABC000306959"],
            "external_immatriculation": ["RV348407"],
            "ircs": ["LLUK"],
            "vessel_id": [1],
            "vessel_identifier": ["INTERNAL_REFERENCE_NUMBER"],
            "vessel_name": ["ÉTABLIR IMPRESSION LORSQUE"],
            "facade": ["SA"],
            "dml": ["DML 29"],
            "flag_state": ["FR"],
            "risk_factor": [2.58],
            "triggering_behaviour_datetime_utc": [today_at_zero_hours - 7 * one_day],
            "latitude": [49.606],
            "longitude": [-0.736],
        }
    )


@pytest.fixture
def reset_test_data_suspicions_of_under_declaration_alerts(reset_test_data):
    e = create_engine(db="monitorfish_remote")
    with e.begin() as con:
        con.execute(
            text(
                """
            INSERT INTO last_positions (
                id,
                cfr,
                external_immatriculation,
                ircs,
                vessel_id,
                vessel_identifier,
                vessel_name,
                impact_risk_factor,
                probability_risk_factor,
                detectability_risk_factor,
                risk_factor,
                is_at_port,
                latitude,
                longitude,
                total_weight_onboard
            ) VALUES
            (
                13639642,
                'ABC000306959',
                'RV348407',
                'LLUK',
                1,
                'INTERNAL_REFERENCE_NUMBER',
                'ÉTABLIR IMPRESSION LORSQUE',
                1.5,
                2.5,
                3.1,
                2.58,
                false,
                49.606,
                -0.736,
                0.0
            )
        """
            )
        )


def test_extract_suspicions_of_under_declaration(
    reset_test_data_suspicions_of_under_declaration_alerts,
    expected_suspicions_of_under_declaration,
):
    res = extract_suspicions_of_under_declaration.run()
    pd.testing.assert_frame_equal(res, expected_suspicions_of_under_declaration)


def test_flow(reset_test_data_suspicions_of_under_declaration_alerts):
    query = "SELECT * FROM pending_alerts WHERE alert_config_name = 'SUSPICION_OF_UNDER_DECLARATION_ALERT'"

    initial_pending_alerts = read_query(query, db="monitorfish_remote")

    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    final_pending_alerts = read_query(query, db="monitorfish_remote")

    assert len(initial_pending_alerts) == 0
    assert len(final_pending_alerts) == 1

    alert = final_pending_alerts.loc[0].to_dict()
    alert.pop("id")
    creation_date = alert.pop("creation_date")

    assert alert == {
        "vessel_name": "ÉTABLIR IMPRESSION LORSQUE",
        "internal_reference_number": "ABC000306959",
        "external_reference_number": "RV348407",
        "ircs": "LLUK",
        "trip_number": None,
        "value": {
            "dml": "DML 29",
            "type": "SUSPICION_OF_UNDER_DECLARATION_ALERT",
            "seaFront": "SA",
            "riskFactor": 2.58,
        },
        "vessel_identifier": "INTERNAL_REFERENCE_NUMBER",
        "alert_config_name": "SUSPICION_OF_UNDER_DECLARATION_ALERT",
        "vessel_id": 1.0,
        "latitude": 49.606,
        "longitude": -0.736,
        "flag_state": "FR",
    }
    assert abs((creation_date - datetime.now(timezone.utc)).total_seconds()) < 60
