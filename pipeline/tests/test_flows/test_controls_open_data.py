from datetime import datetime
from io import BytesIO

import pandas as pd
import pytest

from src.flows.controls_open_data import (
    controls_open_data_flow,
    extract_controls_open_data,
    extract_fleet_segments_open_data,
)


@pytest.fixture
def fleet_segments_open_data() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "year": [2022, 2022, datetime.utcnow().year, datetime.utcnow().year],
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
            "target_species": [
                ["HKE", "SOL", "ANF", "MNZ", "NEP", "LEZ"],
                ["HKE"],
                ["HKE", "SOL", "ANF", "MNZ", "NEP", "LEZ"],
                ["HKE"],
            ],
            "impact_risk_factor": [3.0, 2.1, 3.0, 2.1],
            "min_mesh": [None, None, 80, None],
            "max_mesh": [None, None, 120, None],
        }
    )


@pytest.fixture
def transformed_fleet_segments_open_data() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "year": [2022, 2022, datetime.utcnow().year, datetime.utcnow().year],
            "segment": ["SWW01/02/03 - 2022", "SWW04 - 2022", "SWW01/02/03", "SWW04"],
            "segment_name": [
                "Bottom trawls",
                "Midwater trawls",
                "Bottom trawls",
                "Midwater trawls",
            ],
            "gears": [
                "{OTB,OTT,PTB,OT,PT,TBN,TBS,TX,TB}",
                "{OTM,PTM}",
                "{OTB,OTT,PTB,OT,PT,TBN,TBS,TX,TB}",
                "{OTM,PTM}",
            ],
            "fao_areas": [
                "{27.8.c,27.8,27.9}",
                "{27.8.c,27.8}",
                "{27.8.c,27.8,27.9}",
                "{27.8.c,27.8}",
            ],
            "target_species": [
                "{HKE,SOL,ANF,MNZ,NEP,LEZ}",
                "{HKE}",
                "{HKE,SOL,ANF,MNZ,NEP,LEZ}",
                "{HKE}",
            ],
            "impact_risk_factor": [3.0, 2.1, 3.0, 2.1],
            "min_mesh": [None, None, 80, None],
            "max_mesh": [None, None, 120, None],
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
    controls = extract_controls_open_data()
    assert list(controls) == controls_open_data_columns

    assert controls["infraction_rate"].min() >= -0.0001
    assert controls["infraction_rate"].max() <= 1.0001

    expected_controls_by_type = pd.Series(
        {"LAND_CONTROL": 12, "SEA_CONTROL": 11}, name="number_controls"
    )
    expected_controls_by_type.index.name = "control_type"
    controls_by_type = controls.groupby("control_type")["number_controls"].sum()
    pd.testing.assert_series_equal(controls_by_type, expected_controls_by_type)

    controls_by_segment = controls.groupby("segment")["number_controls"].sum()
    expected_controls_by_segment = pd.Series(
        {
            "FR_SCE": 2,
            "Hors segment": 15,
            "MED05": 1,
            "MED07": 1,
            "NS13": 1,
            "NWW08": 1,
            "PEL05": 1,
            "SWW01/02/03": 1,
        },
        name="number_controls",
    )
    expected_controls_by_segment.index.name = "segment"
    pd.testing.assert_series_equal(controls_by_segment, expected_controls_by_segment)

    controls_by_facade = controls.groupby("facade")["number_controls"].sum()
    expected_controls_by_facade = pd.Series(
        {"Hors façade": 7, "MED": 2, "MEMN": 4, "NAMO": 2, "SA": 8},
        name="number_controls",
    )
    expected_controls_by_facade.index.name = "facade"
    pd.testing.assert_series_equal(controls_by_facade, expected_controls_by_facade)


def test_extract_fleet_segments_open_data(reset_test_data, fleet_segments_open_data):
    fleet_segments = extract_fleet_segments_open_data()
    pd.testing.assert_frame_equal(
        fleet_segments.sort_values(["year", "segment"]).reset_index(drop=True),
        fleet_segments_open_data,
    )


def test_flow(
    reset_test_data, transformed_fleet_segments_open_data, controls_open_data_columns
):
    state = controls_open_data_flow(return_state=True, is_integration=True)
    assert state.is_completed()
    (
        controls_response,
        fleet_segments_response,
        controls_csv_file,
        fleet_segments_csv_file,
    ) = state.result()
    assert controls_response.url == (
        "https://www.data.gouv.fr/api/1/datasets/637c9225bad9521cdab12ba2/"
        "resources/e370fae2-9397-4fbd-bdc9-4f574b49d503/upload/"
    )
    assert fleet_segments_response.url == (
        "https://www.data.gouv.fr/api/1/datasets/637c9225bad9521cdab12ba2/"
        "resources/d6d6376b-2412-4910-95a5-0f615c1c23aa/upload/"
    )

    assert isinstance(controls_csv_file, BytesIO)
    df_from_controls_csv_file = pd.read_csv(controls_csv_file)
    assert list(df_from_controls_csv_file) == controls_open_data_columns

    assert isinstance(fleet_segments_csv_file, BytesIO)
    df_from_fleet_segments_csv_file = pd.read_csv(fleet_segments_csv_file)
    pd.testing.assert_frame_equal(
        df_from_fleet_segments_csv_file,
        transformed_fleet_segments_open_data,
        check_dtype=False,
    )
