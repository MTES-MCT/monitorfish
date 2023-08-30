import pandas as pd

from src.db_config import create_engine
from src.pipeline.flows.refresh_materialized_view import flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_refresh_analytics_controls_full_data(reset_test_data):

    e = create_engine("monitorfish_remote")
    query = """
    SELECT *
    FROM analytics_controls_full_data
    ORDER BY id, control_unit, segment
    """

    initial_controls = read_query(query, db="monitorfish_remote")

    e.execute("DELETE FROM mission_actions WHERE id = 6")

    controls_before_refresh = read_query(query, db="monitorfish_remote")

    flow.schedule = None
    state = flow.run(view_name="analytics_controls_full_data", schema="public")

    assert state.is_successful()

    controls_after_refresh = read_query(query, db="monitorfish_remote")

    assert len(initial_controls) == 26
    assert len(controls_before_refresh) == 26
    assert len(controls_after_refresh) == 22

    pd.testing.assert_frame_equal(initial_controls, controls_before_refresh)
    pd.testing.assert_frame_equal(
        initial_controls.query("id != 6").reset_index(drop=True), controls_after_refresh
    )
