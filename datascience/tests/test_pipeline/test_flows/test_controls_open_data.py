from datetime import datetime
from io import BytesIO

import pandas as pd
import pytest

from src.pipeline.flows.controls_open_data import (
    extract_controls_open_data,
    extract_fleet_segments_open_data,
    flow,
)
from tests.mocks import mock_check_flow_not_running, mock_update_resource

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def fleet_segments_open_data() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "year": [datetime.utcnow().year, datetime.utcnow().year],
            "segment": ["SWW01/02/03", "SWW04"],
            "segment_name": ["Bottom trawls", "Midwater trawls"],
            "gears": [
                ["OTB", "OTT", "PTB", "OT", "PT", "TBN", "TBS", "TX", "TB"],
                ["OTM", "PTM"],
            ],
            "fao_areas": [["27.8.c", "27.8", "27.9"], ["27.8.c", "27.8"]],
            "species": [["HKE", "SOL", "ANF", "MNZ", "NEP", "LEZ", "ANF"], ["HKE"]],
            "impact_risk_factor": [3.0, 2.1],
        }
    )


@pytest.fixture
def transformed_fleet_segments_open_data() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "year": [datetime.utcnow().year, datetime.utcnow().year],
            "segment": ["SWW01/02/03", "SWW04"],
            "segment_name": ["Bottom trawls", "Midwater trawls"],
            "gears": ["{OTB,OTT,PTB,OT,PT,TBN,TBS,TX,TB}", "{OTM,PTM}"],
            "fao_areas": ["{27.8.c,27.8,27.9}", "{27.8.c,27.8}"],
            "species": ["{HKE,SOL,ANF,MNZ,NEP,LEZ,ANF}", "{HKE}"],
            "impact_risk_factor": [3.0, 2.1],
        }
    )


@pytest.fixture
def controls_open_data_columns() -> list:
    return [
        "control_year",
        "control_type",
        "facade",
        "segment",
        "control_month",
        "number_controls",
        "number_controls_ytd",
        "target_number_of_controls_year",
        "infraction_rate",
        "infraction_rate_ytd",
    ]


def test_extract_controls_open_data(reset_test_data, controls_open_data_columns):
    controls = extract_controls_open_data.run()
    assert list(controls) == controls_open_data_columns

    assert controls["infraction_rate"].min() >= -0.0001
    assert controls["infraction_rate"].max() <= 1.0001

    expected_controls_by_type = pd.Series(
        {"Contrôle à la débarque": 12, "Contrôle à la mer": 10}, name="number_controls"
    )
    expected_controls_by_type.index.name = "control_type"
    controls_by_type = controls.groupby("control_type")["number_controls"].sum()
    pd.testing.assert_series_equal(controls_by_type, expected_controls_by_type)

    controls_by_segment = controls.groupby("segment")["number_controls"].sum()
    expected_controls_by_segment = pd.Series(
        {"Hors segment": 14, "SWW01/02/03": 2}, name="number_controls"
    )
    expected_controls_by_segment.index.name = "segment"
    pd.testing.assert_series_equal(controls_by_segment, expected_controls_by_segment)

    controls_by_facade = controls.groupby("facade")["number_controls"].sum()
    expected_controls_by_facade = pd.Series({"Hors façade": 5}, name="number_controls")
    expected_controls_by_facade.index.name = "facade"
    pd.testing.assert_series_equal(controls_by_facade, expected_controls_by_facade)


def test_extract_fleet_segments_open_data(reset_test_data, fleet_segments_open_data):
    fleet_segments = extract_fleet_segments_open_data.run()
    pd.testing.assert_frame_equal(fleet_segments, fleet_segments_open_data)


def test_flow(
    reset_test_data, transformed_fleet_segments_open_data, controls_open_data_columns
):

    while flow.get_tasks("update_resource"):
        flow.replace(flow.get_tasks("update_resource")[0], mock_update_resource)

    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    # Check 1st csv file object
    csv_file_object = state.result[flow.get_tasks("get_csv_file_object")[0]].result
    assert isinstance(csv_file_object, BytesIO)
    df_from_csv_file_object = pd.read_csv(csv_file_object)

    try:
        pd.testing.assert_frame_equal(
            df_from_csv_file_object, transformed_fleet_segments_open_data
        )
        first_df_is_fleet_segments = True
    except AssertionError:
        assert list(df_from_csv_file_object) == controls_open_data_columns
        first_df_is_fleet_segments = False

    # Check 2nd csv file object
    csv_file_object = state.result[flow.get_tasks("get_csv_file_object")[1]].result
    assert isinstance(csv_file_object, BytesIO)
    df_from_csv_file_object = pd.read_csv(csv_file_object)

    if first_df_is_fleet_segments:
        assert list(df_from_csv_file_object) == controls_open_data_columns
    else:
        pd.testing.assert_frame_equal(
            df_from_csv_file_object, transformed_fleet_segments_open_data
        )
