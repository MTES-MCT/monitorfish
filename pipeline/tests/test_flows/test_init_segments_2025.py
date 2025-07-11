import pandas as pd

from src.flows.init_2025_segments import init_2025_segments_flow
from src.read_query import read_query


def test_flow(reset_test_data):
    segments_query = "SELECT * FROM fleet_segments ORDER BY year, segment"
    initial_segments = read_query(segments_query, db="monitorfish_remote")

    state = init_2025_segments_flow(return_state=True)
    assert state.is_completed()

    # Extract segments to insert from the CSV file directly for comparison
    from ast import literal_eval

    from config import LIBRARY_LOCATION

    segments_to_insert = (
        pd.read_csv(
            LIBRARY_LOCATION / "data/segments_2025.csv",
            converters={
                "gears": literal_eval,
                "fao_areas": literal_eval,
                "target_species": literal_eval,
                "vessel_types": literal_eval,
            },
        )
        .sort_values(["year", "segment"])
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
    state = init_2025_segments_flow(return_state=True)
    assert state.is_completed()

    segments_after_second_run = read_query(segments_query, db="monitorfish_remote")

    pd.testing.assert_frame_equal(segments_after_first_run, segments_after_second_run)
