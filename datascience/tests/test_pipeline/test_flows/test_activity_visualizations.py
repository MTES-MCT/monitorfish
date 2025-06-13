from datetime import datetime

from src.pipeline.flows.activity_visualizations import flow
from src.read_query import read_query
from tests.mocks import get_utcnow_mock_factory, mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)
flow.replace(
    flow.get_tasks("get_utcnow")[0],
    get_utcnow_mock_factory(datetime(2050, 8, 19, 11, 14)),
)


def test_flow(reset_test_data, add_enriched_catches):
    flow.schedule = None
    state = flow.run(start_months_ago=12, end_months_ago=0)
    assert state.is_successful()
    activity_visualizations = read_query(
        "SELECT * from activity_visualizations", db="monitorfish_remote"
    )
    assert len(activity_visualizations) == 1
    html_file = activity_visualizations.loc[0, "html_file"]
    assert isinstance(html_file, str)
    assert len(html_file) > 0
    assert html_file[:15] == "<!doctype html>"
