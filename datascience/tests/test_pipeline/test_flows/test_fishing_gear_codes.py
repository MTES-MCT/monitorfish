import pandas as pd

from config import LIBRARY_LOCATION
from src.pipeline.flows.fishing_gear_codes import flow
from src.read_query import read_query


def test_fishing_gear_codes_flow(reset_test_data):
    flow.schedule = None
    state = flow.run()

    assert state.is_successful()

    fishing_gear_codes = read_query(
        "SELECT * FROM fishing_gear_codes", db="monitorfish_remote"
    )
    fishing_gear_codes_groups = read_query(
        "SELECT * FROM fishing_gear_codes_groups", db="monitorfish_remote"
    )

    expected_fishing_gear_codes = pd.read_csv(
        LIBRARY_LOCATION / "pipeline/data/fishing_gear_codes.csv"
    )
    expected_fishing_gear_codes_groups = pd.read_csv(
        LIBRARY_LOCATION / "pipeline/data/fishing_gear_codes_groups.csv"
    )

    pd.testing.assert_frame_equal(fishing_gear_codes, expected_fishing_gear_codes)
    pd.testing.assert_frame_equal(
        fishing_gear_codes_groups, expected_fishing_gear_codes_groups
    )
