from datetime import datetime, timezone

import pandas as pd
import pytest
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.flows.missing_dep_alerts import extract_missing_deps, flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def expected_missing_deps() -> pd.DataFrame:
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
            "latitude": [49.606],
            "longitude": [-0.736],
        }
    )


@pytest.fixture
def reset_test_data_missing_dep_alerts(reset_test_data):
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
                is_at_port
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
                false
            )
        """
            )
        )

        con.execute(
            text(
                "UPDATE positions "
                "SET date_time = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '2 hours' "
                "WHERE id = 13637054"
            )
        )


def test_extract_missing_deps(
    reset_test_data_missing_dep_alerts, expected_missing_deps
):
    res = extract_missing_deps.run()
    pd.testing.assert_frame_equal(res, expected_missing_deps)


def test_flow(reset_test_data_missing_dep_alerts):
    query = "SELECT * FROM pending_alerts WHERE alert_config_name = 'MISSING_DEP_ALERT'"

    initial_pending_alerts = read_query(query, db="monitorfish_remote")

    state = flow.run(
        alert_type="MISSING_DEP_ALERT",
        alert_config_name="MISSING_DEP_ALERT",
    )
    assert state.is_successful()

    final_pending_alerts = read_query(query, db="monitorfish_remote")

    assert len(initial_pending_alerts) == 0
    assert len(final_pending_alerts) == 1

    alert = final_pending_alerts.loc[0].to_dict()
    creation_date = alert.pop("creation_date")

    assert alert == {
        "id": 1,
        "vessel_name": "ÉTABLIR IMPRESSION LORSQUE",
        "internal_reference_number": "ABC000306959",
        "external_reference_number": "RV348407",
        "ircs": "LLUK",
        "trip_number": None,
        "value": {
            "dml": "DML 29",
            "type": "MISSING_DEP_ALERT",
            "seaFront": "SA",
            "riskFactor": 2.58,
        },
        "vessel_identifier": "INTERNAL_REFERENCE_NUMBER",
        "alert_config_name": "MISSING_DEP_ALERT",
        "vessel_id": 1.0,
        "latitude": 49.606,
        "longitude": -0.736,
        "flag_state": "FR",
    }
    assert abs((creation_date - datetime.now(timezone.utc)).total_seconds()) < 60
