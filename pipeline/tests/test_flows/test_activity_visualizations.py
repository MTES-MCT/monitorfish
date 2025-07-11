from datetime import datetime

from src.flows.activity_visualizations import activity_visualizations_flow
from src.read_query import read_query
from tests.mocks import get_utcnow_mock_factory


def test_flow(reset_test_data, add_enriched_catches):
    get_utcnow_mock = get_utcnow_mock_factory(datetime(2050, 8, 19, 11, 14))
    state = activity_visualizations_flow(
        start_months_ago=12,
        end_months_ago=0,
        get_utcnow_fn=get_utcnow_mock,
        return_state=True,
    )
    assert state.is_completed()
    activity_visualizations = read_query(
        "SELECT * from activity_visualizations", db="monitorfish_remote"
    )
    assert len(activity_visualizations) == 1
    html_file = activity_visualizations.loc[0, "html_file"]
    assert isinstance(html_file, str)
    assert len(html_file) > 0
    assert html_file[:15] == "<!doctype html>"
