from datetime import datetime

import pandas as pd
from dateutil.relativedelta import relativedelta

from src.db_config import create_engine
from src.pipeline.flows.control_anteriority import flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_control_anteriority_flow(reset_test_data):

    now = datetime.utcnow()
    query = "SELECT * FROM control_anteriority"

    # Reset control_anteriority table
    e = create_engine("monitorfish_remote")
    e.execute("DELETE FROM control_anteriority;")
    assert len(read_query("monitorfish_remote", query)) == 0

    # Run control anteriority flow
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    # Check that control anteriority data was correctly computed and loaded to
    # control_anteriority table

    loaded_control_anteriority = read_query("monitorfish_remote", query)
    expected_control_anteriority = pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, 4],
            "cfr": ["ABC000306959", "ABC000542519", "ABC000055481", None],
            "ircs": ["LLUK", "FQ7058", "IL2468", "OLY7853"],
            "external_immatriculation": [
                "RV348407",
                "RO237719",
                "AS761555",
                "SB125334",
            ],
            "last_control_datetime_utc": [
                now - relativedelta(months=3),
                now - relativedelta(months=3),
                now - relativedelta(weeks=1),
                now - relativedelta(weeks=1, days=3),
            ],
            "last_control_infraction": [True, True, False, False],
            "post_control_comments": [
                "OTB 70MM DÉCLARÉ - signaux pyrotechniques périmés",
                "PECHE DE LA SCE EN ZONE 5 FERMEE - APPREHENTION DE 1600 KG DE SCE",
                "RAS",
                "RAS",
            ],
            "number_recent_controls": [2.391423, 6.541971, 0.993613, 0.990876],
            "control_rate_risk_factor": [1.750000, 1.750000, 2.500000, 2.500000],
            "infraction_score": [-4.500000, -5.500000, -1.000000, -1.000000],
            "infraction_rate_risk_factor": [1.0, 1.0, 1.0, 1.0],
            "number_controls_last_5_years": [6, 11, 1, 1],
            "number_controls_last_3_years": [5, 11, 1, 1],
            "number_infractions_last_5_years": [6, 1, 0, 0],
            "number_diversions_last_5_years": [1, 0, 0, 0],
            "number_seizures_last_5_years": [1, 1, 0, 0],
            "number_escorts_to_quay_last_5_years": [1, 0, 0, 0],
        }
    )

    pd.testing.assert_frame_equal(
        loaded_control_anteriority.drop(
            columns=["last_control_datetime_utc", "number_recent_controls"]
        ),
        expected_control_anteriority.drop(
            columns=["last_control_datetime_utc", "number_recent_controls"]
        ),
    )

    # The date of the last control is computed from CURRENT_TIMESTAMP by the database
    # in `reset_test_data` fixture, which is necessarily slightly different from the
    # `now` variable computed in this python script at the beginning of the test.
    # Hence an exact equality check is not possible, we have to resort to an
    # approximate equality check.

    max_seconds_of_difference_allowed = 10.0

    seconds_of_difference = (
        (
            loaded_control_anteriority.last_control_datetime_utc
            - expected_control_anteriority.last_control_datetime_utc
        )
        .map(lambda td: td.total_seconds())
        .abs()
    )

    assert (seconds_of_difference < max_seconds_of_difference_allowed).all()

    # The value of number_recent_controls may change slightly depending the date, due
    # to the changing duration of years (regular vs leap years), so we need to make an
    # approximate check for this value as well.

    assert (
        (
            loaded_control_anteriority.number_recent_controls
            - expected_control_anteriority.number_recent_controls
        )
        < 0.1
    ).all()
