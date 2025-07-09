import pandas as pd

from config import LIBRARY_LOCATION
from src.flows.fishing_gear_codes import fishing_gear_codes_flow
from src.read_query import read_query


def test_fishing_gear_codes_flow(reset_test_data):
    state = fishing_gear_codes_flow(return_state=True)

    assert state.is_completed()

    fishing_gear_codes = read_query(
        "SELECT * FROM fishing_gear_codes", db="monitorfish_remote"
    )
    fishing_gear_codes_groups = read_query(
        "SELECT * FROM fishing_gear_codes_groups", db="monitorfish_remote"
    )

    expected_fishing_gear_codes = pd.read_csv(
        LIBRARY_LOCATION / "data/fishing_gear_codes.csv"
    )
    expected_fishing_gear_codes_groups = pd.read_csv(
        LIBRARY_LOCATION / "data/fishing_gear_codes_groups.csv"
    )

    pd.testing.assert_frame_equal(fishing_gear_codes, expected_fishing_gear_codes)
    pd.testing.assert_frame_equal(
        fishing_gear_codes_groups, expected_fishing_gear_codes_groups
    )
