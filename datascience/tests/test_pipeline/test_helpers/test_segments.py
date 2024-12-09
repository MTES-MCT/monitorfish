from ast import literal_eval

import pandas as pd
import pytest

from config import TEST_DATA_LOCATION
from src.pipeline.helpers.segments import allocate_segments_to_catches


@pytest.fixture
def catches() -> pd.DataFrame:
    return pd.read_csv(TEST_DATA_LOCATION / "csv/catches.csv")


@pytest.fixture
def empty_catches(catches) -> pd.DataFrame:
    return catches.head(0)


@pytest.fixture
def segments() -> pd.DataFrame:
    return pd.read_csv(
        TEST_DATA_LOCATION / "csv/segments.csv",
        converters={
            "gears": literal_eval,
            "fao_areas": literal_eval,
            "target_species": literal_eval,
            "vessel_types": literal_eval,
        },
    )


def test_allocate_segments_to_catches(catches, segments):
    segmented_catches = allocate_segments_to_catches(
        catches=catches.drop(columns=["segment"]),
        segments=segments,
        catch_id_column="catch_id",
        batch_id_column="batch_id",
    )
    pd.testing.assert_frame_equal(segmented_catches, catches)


def test_allocate_segments_to_catches_with_empty_input(empty_catches, segments):
    segmented_catches = allocate_segments_to_catches(
        catches=empty_catches.drop(columns=["segment"]),
        segments=segments,
        catch_id_column="catch_id",
        batch_id_column="batch_id",
    )
    pd.testing.assert_frame_equal(
        segmented_catches, empty_catches.head(0), check_dtype=False
    )
