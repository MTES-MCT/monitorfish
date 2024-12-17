from datetime import datetime

import pandas as pd
import pytest

from src.pipeline.shared_tasks.segments import (
    extract_all_segments,
    extract_segments_of_year,
)


@pytest.fixture
def current_year() -> int:
    return datetime.utcnow().year


@pytest.fixture
def expected_all_segments(current_year) -> pd.DataFrame:
    expected_segments = pd.DataFrame(
        {
            "year": [2022, 2022, current_year, current_year],
            "segment": ["SWW01/02/03 - 2022", "SWW04 - 2022", "SWW01/02/03", "SWW04"],
            "segment_name": [
                "Bottom trawls",
                "Midwater trawls",
                "Bottom trawls",
                "Midwater trawls",
            ],
            "gears": [
                ["OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"],
                ["OTM", "PTM"],
                ["OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"],
                ["OTM", "PTM"],
            ],
            "fao_areas": [
                ["27.8.c", "27.8", "27.9"],
                ["27.8.c", "27.8"],
                ["27.8.c", "27.8", "27.9"],
                ["27.8.c", "27.8"],
            ],
            "min_mesh": [None, None, 80.0, None],
            "max_mesh": [None, None, 120.0, None],
            "target_species": [
                ["HKE", "SOL", "ANF", "MNZ", "NEP", "LEZ"],
                ["HKE"],
                ["HKE", "SOL", "ANF", "MNZ", "NEP", "LEZ"],
                ["HKE"],
            ],
            "min_share_of_target_species": [0.0, 0.0, 0.0, 0.0],
            "main_scip_species_type": [None, None, "DEMERSAL", "PELAGIC"],
            "priority": [0.0, 0.0, 0.0, 1.0],
            "vessel_types": [
                None,
                None,
                None,
                ["Navire qui pêche", "Chalutier", "Ligneur", "Navire qui navigue"],
            ],
            "impact_risk_factor": [3.0, 2.1, 3.0, 2.1],
        }
    )
    return expected_segments


@pytest.fixture
def expected_segments_of_current_year(expected_all_segments) -> pd.DataFrame:
    return expected_all_segments.loc[2:4].reset_index(drop=True)


def test_extract_segments_of_year(
    reset_test_data, expected_segments_of_current_year, current_year
):
    segments = extract_segments_of_year.run(current_year)

    pd.testing.assert_frame_equal(
        segments.sort_values("segment").reset_index(drop=True),
        expected_segments_of_current_year,
    )


def test_extract_all_segments(reset_test_data, expected_all_segments):
    segments = extract_all_segments.run()
    pd.testing.assert_frame_equal(segments, expected_all_segments)
