from datetime import datetime

import pandas as pd
from dateutil.relativedelta import relativedelta

from src.db_config import create_engine
from src.pipeline.flows.control_anteriority import flow
from src.read_query import read_query


def test_control_anteriority_flow(reset_test_data):

    now = datetime.utcnow()
    query = "SELECT * FROM control_anteriority"

    # Reset control_anteriority table
    e = create_engine("monitorfish_remote")
    e.execute("DELETE FROM control_anteriority;")
    assert len(read_query("monitorfish_remote", query)) == 0

    # Run control anteriority flow
    state = flow.run()
    assert state.is_successful()

    # Check that control anteriority data was correctly computed and loaded to
    # control_anteriority table

    loaded_control_anteriority = read_query("monitorfish_remote", query)
    expected_control_anteriority = pd.DataFrame(
        {
            "vessel_id": [1, 2],
            "cfr": ["ABC000306959", "ABC000542519"],
            "ircs": ["LLUK", "FQ7058"],
            "external_immatriculation": ["RV348407", "RO237719"],
            "last_control_datetime_utc": [
                now - relativedelta(months=3),
                now - relativedelta(months=3),
            ],
            "last_control_infraction": [True, True],
            "post_control_comments": [
                "OTB 70MM DÉCLARÉ - signaux pyrotechniques périmés",
                "PECHE DE LA SCE EN ZONE 5 FERMEE - APPREHENTION DE 1600 KG DE SCE",
            ],
            "number_recent_controls": [2.391423, 6.541971],
            "control_rate_risk_factor": [1.750000, 1.750000],
            "infraction_score": [-4.500000, -5.500000],
            "infraction_rate_risk_factor": [1.0, 1.0],
            "number_controls_last_5_years": [6, 11],
            "number_controls_last_3_years": [5, 11],
            "number_infractions_last_5_years": [6, 1],
            "number_diversions_last_5_years": [1, 0],
            "number_seizures_last_5_years": [1, 1],
            "number_escorts_to_quay_last_5_years": [1, 0],
        }
    )

    pd.testing.assert_frame_equal(
        loaded_control_anteriority.drop(columns=["last_control_datetime_utc"]),
        expected_control_anteriority.drop(columns=["last_control_datetime_utc"]),
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
