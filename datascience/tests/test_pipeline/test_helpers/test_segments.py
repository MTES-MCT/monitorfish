import pandas as pd
import pytest

from src.pipeline.helpers.segments import (
    attribute_segments_to_catches,
    catch_area_isin_fao_area,
)


def test_catch_area_isin_fao_area():
    assert catch_area_isin_fao_area("27", "27")
    assert catch_area_isin_fao_area("27.7", "27")
    assert catch_area_isin_fao_area("27.7", None)
    assert catch_area_isin_fao_area(None, None)
    assert not catch_area_isin_fao_area(None, "27.7")
    assert not catch_area_isin_fao_area("27", "27.7")


@pytest.fixture
def catches():
    return pd.DataFrame(
        {
            "some_id": ["A", "A", "A", "B", "C", "D", "D", "E"],
            "species": [
                "spe_1",
                "spe_2",
                "spe_4",
                "spe_1",
                "spe_1",
                "spe_1",
                "spe_4",
                "spe_5",
            ],
            "gear": [
                "gear_1",
                "gear_1",
                "gear_1",
                "gear_2",
                "gear_1",
                "gear_3",
                "gear_4",
                "gear_4",
            ],
            "fao_area": [
                "27.7.b",
                "27.7.b",
                "27.7.b",
                "28.8",
                "27.8",
                "28.8.f",
                "37.8",
                "28.8.a.5",
            ],
        }
    )


@pytest.fixture
def segments():
    return pd.DataFrame(
        {
            "segment": [
                "segment_all_criteria",
                "segment_all_criteria",
                "segment_all_criteria",
                "segment_gear_species",
                "segment_area_species",
                "segment_gear_area",
                "segment_species_only",
                "segment_area_only",
                "segment_gear_only",
            ],
            "species": [
                "spe_1",
                "spe_2",
                "spe_3",
                "spe_1",
                "spe_1",
                None,
                "spe_4",
                None,
                None,
            ],
            "gear": [
                "gear_1",
                "gear_1",
                "gear_1",
                "gear_2",
                None,
                "gear_1",
                None,
                None,
                "gear_3",
            ],
            "fao_area": [
                "27.7",
                "27.7",
                "27.7",
                None,
                "28.8",
                "28.7",
                None,
                "28.8.a",
                None,
            ],
        }
    )


@pytest.fixture
def expected_segmented_catches():
    return pd.DataFrame(
        {
            "segment": [
                "segment_all_criteria",
                "segment_all_criteria",
                "segment_species_only",
                "segment_gear_species",
                "segment_area_species",
                "Pas de segment",
                "segment_gear_only",
                "segment_area_species",
                "segment_species_only",
                "segment_area_only",
            ],
            "species": [
                "spe_1",
                "spe_2",
                "spe_4",
                "spe_1",
                "spe_1",
                "spe_1",
                "spe_1",
                "spe_1",
                "spe_4",
                "spe_5",
            ],
            "gear": [
                "gear_1",
                "gear_1",
                "gear_1",
                "gear_2",
                "gear_2",
                "gear_1",
                "gear_3",
                "gear_3",
                "gear_4",
                "gear_4",
            ],
            "fao_area_of_segment": [
                "27.7",
                "27.7",
                None,
                None,
                "28.8",
                None,
                None,
                "28.8",
                None,
                "28.8.a",
            ],
            "some_id": ["A", "A", "A", "B", "B", "C", "D", "D", "D", "E"],
            "fao_area_of_catch": [
                "27.7.b",
                "27.7.b",
                "27.7.b",
                "28.8",
                "28.8",
                "27.8",
                "28.8.f",
                "28.8.f",
                "37.8",
                "28.8.a.5",
            ],
        }
    )


def test_attribute_segments_to_catches(catches, segments, expected_segmented_catches):

    segmented_catches = attribute_segments_to_catches(
        catches=catches, segments=segments
    )
    pd.testing.assert_frame_equal(
        segmented_catches,
        expected_segmented_catches[
            expected_segmented_catches.segment != "Pas de segment"
        ].reset_index(drop=True),
    )


def test_attribute_segments_to_catches_with_unsassigned_catches(
    catches, segments, expected_segmented_catches
):

    segmented_catches = attribute_segments_to_catches(
        catches=catches,
        segments=segments,
        append_unassigned_catches=True,
        unassigned_catches_segment_label="Pas de segment",
    )
    pd.testing.assert_frame_equal(segmented_catches, expected_segmented_catches)
