import pandas as pd

from src.flows.init_infraction_threat_characterization import init_infraction_threat_characterization_flow
from src.read_query import read_query


def test_flow(reset_test_data):
    threats_query = "SELECT * FROM threats ORDER BY id"
    threat_characterizations_query = "SELECT * FROM threat_characterizations ORDER BY id"
    infraction_threat_characterization_query = "SELECT * FROM infraction_threat_characterization ORDER BY id"

    initial_threats = read_query(threats_query, db="monitorfish_remote")
    initial_threat_characterizations = read_query(threat_characterizations_query, db="monitorfish_remote")
    initial_infraction_threat_characterization = read_query(infraction_threat_characterization_query, db="monitorfish_remote")

    state = init_infraction_threat_characterization_flow(return_state=True)
    assert state.is_completed()

    threats_after_first_run = read_query(threats_query, db="monitorfish_remote")
    threat_characterizations_after_first_run = read_query(
        threat_characterizations_query, db="monitorfish_remote"
    )
    infraction_threat_characterization_after_first_run = read_query(
        infraction_threat_characterization_query, db="monitorfish_remote"
    )

    # Verify counts increased from test data
    assert len(initial_threats) == 2
    assert len(threats_after_first_run) == 7
    assert len(initial_threat_characterizations) == 2
    assert len(threat_characterizations_after_first_run) == 76
    assert len(initial_infraction_threat_characterization) == 3
    assert len(infraction_threat_characterization_after_first_run) == 120

    # Re-running should succeed and lead to the same data
    state = init_infraction_threat_characterization_flow(return_state=True)
    assert state.is_completed()

    threats_after_second_run = read_query(threats_query, db="monitorfish_remote")
    threat_characterizations_after_second_run = read_query(
        threat_characterizations_query, db="monitorfish_remote"
    )
    infraction_threat_characterization_after_second_run = read_query(
        infraction_threat_characterization_query, db="monitorfish_remote"
    )

    pd.testing.assert_frame_equal(threats_after_first_run, threats_after_second_run)
    pd.testing.assert_frame_equal(
        threat_characterizations_after_first_run, threat_characterizations_after_second_run
    )
    pd.testing.assert_frame_equal(
        infraction_threat_characterization_after_first_run, infraction_threat_characterization_after_second_run
    )
