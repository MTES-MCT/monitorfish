from ast import literal_eval

import numpy as np
import pandas as pd
import pytest

from config import TEST_DATA_LOCATION
from src.helpers.segments import allocate_segments_to_catches


@pytest.fixture
def catches() -> pd.DataFrame:
    return pd.read_csv(TEST_DATA_LOCATION / "csv/catches.csv")


@pytest.fixture
def empty_catches(catches) -> pd.DataFrame:
    return catches.head(0)


@pytest.fixture
def catches_with_extra_column(catches) -> pd.DataFrame:
    return catches.assign(some_random_column=np.random.random(len(catches)))


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
        catches=catches.drop(columns=["segment", "segment_name", "impact_risk_factor"]),
        segments=segments,
        catch_id_column="catch_id",
        batch_id_column="batch_id",
    )
    pd.testing.assert_frame_equal(segmented_catches, catches)


def test_allocate_segments_to_catches_preserves_additional_columns(
    catches_with_extra_column, segments
):
    segmented_catches = allocate_segments_to_catches(
        catches=catches_with_extra_column.drop(
            columns=["segment", "segment_name", "impact_risk_factor"]
        ),
        segments=segments,
        catch_id_column="catch_id",
        batch_id_column="batch_id",
    )
    pd.testing.assert_frame_equal(
        segmented_catches, catches_with_extra_column, check_like=True
    )


def test_allocate_segments_to_catches_with_empty_input(empty_catches, segments):
    segmented_catches = allocate_segments_to_catches(
        catches=empty_catches.drop(
            columns=["segment", "segment_name", "impact_risk_factor"]
        ),
        segments=segments,
        catch_id_column="catch_id",
        batch_id_column="batch_id",
    )
    pd.testing.assert_frame_equal(
        segmented_catches, empty_catches.head(0), check_dtype=False
    )
