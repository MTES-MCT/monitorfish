import pandas as pd

from config import LIBRARY_LOCATION
from src.pipeline.flows.districts import flow
from src.read_query import read_query


def test_districts_flow(reset_test_data):
    flow.schedule = None
    state = flow.run()

    assert state.is_successful()

    districts = read_query("SELECT * FROM districts", db="monitorfish_remote")

    expected_districts = pd.read_csv(
        LIBRARY_LOCATION / "pipeline/data/districts.csv",
        keep_default_na=False,
        na_values=[""],
    )

    pd.testing.assert_frame_equal(districts, expected_districts)
