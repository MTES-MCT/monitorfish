import pandas as pd
from pytest import fixture

from src.shared_tasks.segments import (
    extract_control_priorities_and_infringement_risk_levels,
)


@fixture
def expected_control_priorities_and_infringement_risk_levels():
    return pd.DataFrame(
        {
            "facade": ["SA", "SA"],
            "segment": ["SWW01/02/03", "SWW04"],
            "control_priority_level": [1.0, 3.0],
            "infringement_risk_level": [1.0, 4.0],
        }
    )


def test_extract_control_priorities_and_infringement_risk_levels(
    reset_test_data, expected_control_priorities_and_infringement_risk_levels
):
    control_priorities_and_infringement_risk_levels = (
        extract_control_priorities_and_infringement_risk_levels()
    )
    pd.testing.assert_frame_equal(
        control_priorities_and_infringement_risk_levels.sort_values(
            "segment"
        ).reset_index(drop=True),
        expected_control_priorities_and_infringement_risk_levels,
    )
