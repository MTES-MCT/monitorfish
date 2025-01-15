import pandas as pd

from src.pipeline.flows.init_2025_segments import flow
from src.read_query import read_query


def test_flow(reset_test_data):
    segments_query = "SELECT * FROM fleet_segments ORDER BY year, segment"
    initial_segments = read_query(segments_query, db="monitorfish_remote")

    flow.schedule = None
    state = flow.run()
    assert state.is_successful()
    segments_to_insert = (
        state.result[flow.get_tasks("extract_2025_segments")[0]]
        .result.sort_values(["year", "segment"])
        .reset_index(drop=True)
    )

    segments_after_first_run = read_query(segments_query, db="monitorfish_remote")

    assert len(initial_segments) == 4
    pd.testing.assert_frame_equal(
        initial_segments.query("year != 2025"),
        segments_after_first_run.query("year != 2025"),
    )
    pd.testing.assert_frame_equal(
        segments_to_insert,
        segments_after_first_run.query("year == 2025").reset_index(drop=True),
        check_dtype=False,
    )

    # Re-running should succeed and lead to the same segments
    state = flow.run()
    assert state.is_successful()

    segments_after_second_run = read_query(segments_query, db="monitorfish_remote")

    pd.testing.assert_frame_equal(segments_after_first_run, segments_after_second_run)
