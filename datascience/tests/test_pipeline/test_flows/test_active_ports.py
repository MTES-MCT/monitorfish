from src.pipeline.flows.active_ports import flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_flow(reset_test_data):

    ports_query = "SELECT * FROM ports ORDER BY locode"

    initial_ports = read_query("monitorfish_remote", ports_query)

    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    final_ports = read_query("monitorfish_remote", ports_query)

    assert (initial_ports.is_active == [True] + [False] * 8).all()
    assert (final_ports.is_active == [False] + [True] * 8).all()
