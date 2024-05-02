import pandas as pd

from src.pipeline.flows.init_pno_subscriptions import flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_flow(reset_test_data):
    pno_ports_subscriptions_query = (
        "SELECT * FROM pno_ports_subscriptions ORDER BY control_unit_id, port_locode"
    )
    pno_segments_subscriptions_query = (
        "SELECT * FROM pno_segments_subscriptions ORDER BY control_unit_id, segment"
    )
    pno_vessels_subscriptions_query = (
        "SELECT * FROM pno_vessels_subscriptions ORDER BY control_unit_id, cfr"
    )
    initial_pno_ports_subscriptions = read_query(
        pno_ports_subscriptions_query, db="monitorfish_remote"
    )
    initial_pno_segments_subscriptions = read_query(
        pno_segments_subscriptions_query, db="monitorfish_remote"
    )
    initial_pno_vessels_subscriptions = read_query(
        pno_vessels_subscriptions_query, db="monitorfish_remote"
    )

    flow.schedule = None
    state = flow.run(
        pno_ports_subscriptions_file_name="dummy_pno_ports_subscriptions.csv",
        pno_segments_subscriptions_file_name="dummy_pno_segments_subscriptions.csv",
        pno_vessels_subscriptions_file_name="dummy_pno_vessels_subscriptions.csv",
    )
    assert state.is_successful()

    pno_ports_subscriptions_first_run = read_query(
        pno_ports_subscriptions_query, db="monitorfish_remote"
    )
    pno_segments_subscriptions_first_run = read_query(
        pno_segments_subscriptions_query, db="monitorfish_remote"
    )
    pno_vessels_subscriptions_first_run = read_query(
        pno_vessels_subscriptions_query, db="monitorfish_remote"
    )

    assert len(initial_pno_ports_subscriptions) == 0
    assert len(initial_pno_segments_subscriptions) == 0
    assert len(initial_pno_vessels_subscriptions) == 0

    assert len(pno_ports_subscriptions_first_run) == 19
    assert len(pno_segments_subscriptions_first_run) == 7
    assert len(pno_vessels_subscriptions_first_run) == 5

    # Re-running should succeed and lead to the same pno types
    state = flow.run(
        pno_ports_subscriptions_file_name="dummy_pno_ports_subscriptions.csv",
        pno_segments_subscriptions_file_name="dummy_pno_segments_subscriptions.csv",
        pno_vessels_subscriptions_file_name="dummy_pno_vessels_subscriptions.csv",
    )
    assert state.is_successful()

    pno_ports_subscriptions_second_run = read_query(
        pno_ports_subscriptions_query, db="monitorfish_remote"
    )
    pno_segments_subscriptions_second_run = read_query(
        pno_segments_subscriptions_query, db="monitorfish_remote"
    )
    pno_vessels_subscriptions_second_run = read_query(
        pno_vessels_subscriptions_query, db="monitorfish_remote"
    )

    pd.testing.assert_frame_equal(
        pno_ports_subscriptions_first_run, pno_ports_subscriptions_second_run
    )

    pd.testing.assert_frame_equal(
        pno_segments_subscriptions_first_run, pno_segments_subscriptions_second_run
    )

    pd.testing.assert_frame_equal(
        pno_vessels_subscriptions_first_run, pno_vessels_subscriptions_second_run
    )
