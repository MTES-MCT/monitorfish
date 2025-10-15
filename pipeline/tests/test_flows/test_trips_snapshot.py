from src.flows.trips_snapshot import trips_flow
from src.read_query import read_query


def test_flow(reset_test_data, add_activity_dates_table):
    state = trips_flow(return_state=True)
    assert state.is_completed()
    trips = read_query(
        "SELECT * FROM trips_snapshot ORDER BY cfr, trip_number",
        db="monitorfish_remote",
    )
    assert len(trips) == 1
