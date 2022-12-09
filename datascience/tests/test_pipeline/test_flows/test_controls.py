from datetime import datetime
from unittest.mock import patch

import pandas as pd
import pytest
import sqlalchemy
from prefect import task

from src.pipeline.flows.controls import extract_catch_controls, extract_controls, flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running, mock_extract_side_effect

y = datetime.utcnow().year

controls_df = pd.DataFrame(
    {
        "id": [1, 8, 36, 58, 952],
        "vessel_id": [100, 200, 30000, 5000, 90],
        "cfr": ["FRA0", "FRA01", "FRA000000000", "FRA111111111", "ESP123456789"],
        "ircs": [None, "D", "C", "B", "A"],
        "external_immatriculation": ["LO00", "FF11", "ST22", "ST33", "AC44"],
        "vessel_name": ["PLIF", "PLAF", "PLOUF", "REINE DES MER", "JEAN-MARC"],
        "flag_state": ["FR", "FR", "FR", "FR", "FR"],
        "district_code": ["LO", "FF", "ST", "ST", "AC"],
        "controller_id": [16, 1091, 119, 1000, 12],
        "control_type": [
            "Contrôle à la débarque",
            "Contrôle à la mer",
            "Contrôle à la mer",
            "Contrôle à la mer",
            "Contrôle à la mer",
        ],
        "control_datetime_utc": [
            datetime(y, 4, 14, 21, 24, 00),
            datetime(y, 4, 9, 14, 40, 00),
            datetime(y, 4, 14, 13, 46, 00),
            datetime(y, 4, 16, 6, 40, 00),
            datetime(y, 4, 9, 10, 11, 00),
        ],
        "input_start_datetime_utc": [
            datetime(y, 4, 14, 21, 25, 21),
            datetime(y, 4, 9, 14, 42, 15),
            datetime(y, 4, 14, 13, 47, 35),
            datetime(y, 4, 16, 6, 42, 11),
            datetime(y, 4, 9, 10, 12, 7),
        ],
        "input_end_datetime_utc": [
            datetime(y, 4, 15, 9, 10, 24),
            datetime(y, 4, 18, 9, 8, 14),
            datetime(y, 4, 15, 9, 10, 51),
            datetime(y, 4, 17, 14, 53, 34),
            datetime(y, 4, 15, 20, 40, 54),
        ],
        "longitude": [None, -60.8395, 3.7433, 3.9333, -1.1333],
        "latitude": [None, 14.6557, 43.2833, 43.5167, 44.6833],
        "port_locode": ["FRLRT", None, None, None, None],
        "mission_order": ["0", "0", "1", "0", "0"],
        "vessel_targeted": ["0", "0", "1", "0", "0"],
        "cnsp_called_unit": ["0", "0", "0", "0", "0"],
        "cooperative": ["0", "0", "0", "0", "0"],
        "pre_control_comments": [None, None, None, None, None],
        "infraction": ["0", "1", "0", "1", "0"],
        "infraction_ids": [None, "12", None, "12, 25", None],
        "diversion": ["0", "0", "0", "0", "0"],
        "escort_to_quay": ["0", "0", "0", "0", "0"],
        "seizure": ["0", "0", "0", "0", "0"],
        "seizure_comments": [None, None, None, None, None],
        "post_control_comments": [
            "Jauge oméga HS",
            None,
            None,
            "hauteur de chute 130cm - longueur 1500m ",
            "RESULTAT NON COMMUNIQUE PAR L'UNITE",
        ],
        "gear_1_code": ["OTB", "FPO", "OTB", "GNS", "NO"],
        "gear_2_code": [None, None, "OTB", None, None],
        "gear_3_code": [None, None, None, None, None],
        "gear_1_was_controlled": ["0", "0", "1", "1", "0"],
        "gear_2_was_controlled": ["0", "0", "1", "0", "0"],
        "gear_3_was_controlled": ["0", "0", "0", "0", "0"],
        "declared_mesh_1": [80.0, None, 40.0, 23.0, None],
        "declared_mesh_2": [None, None, 40.0, None, None],
        "declared_mesh_3": [None, None, None, None, None],
        "controlled_mesh_1": [None, None, 42.0, 23.0, None],
        "controlled_mesh_2": [None, None, 42.6, None, None],
        "controlled_mesh_3": [None, None, None, None, None],
    }
)

catch_controls_df = pd.DataFrame(
    {
        "id": [8, 952, 952, 8, 8],
        "species_code": ["BFT", "SOL", "ANF", "SOL", "COE"],
        "catch_weight": [None, 60, 1668, 150, 52],
        "number_fish": [14, None, None, None, None],
    }
)


unchanged_columns = [
    "id",
    "vessel_id",
    "cfr",
    "ircs",
    "external_immatriculation",
    "vessel_name",
    "flag_state",
    "district_code",
    "controller_id",
    "control_type",
    "control_datetime_utc",
    "input_start_datetime_utc",
    "input_end_datetime_utc",
    "longitude",
    "latitude",
    "port_locode",
    "pre_control_comments",
    "seizure_comments",
    "post_control_comments",
]

loaded_controls_df = pd.concat(
    [
        controls_df[unchanged_columns],
        pd.DataFrame(
            {
                "facade": [None, None, "Facade A", "Facade A", "Facade A"],
                "mission_order": [False, False, True, False, False],
                "vessel_targeted": [False, False, True, False, False],
                "cnsp_called_unit": [False, False, False, False, False],
                "cooperative": [False, False, False, False, False],
                "infraction": [False, True, False, True, False],
                "diversion": [False, False, False, False, False],
                "escort_to_quay": [False, False, False, False, False],
                "seizure": [False, False, False, False, False],
                "infraction_ids": [[], [12], [], [12, 25], []],
                "gear_controls": [
                    [
                        {
                            "gearCode": "OTB",
                            "declaredMesh": 80.0,
                            "controlledMesh": None,
                            "gearWasControlled": False,
                        }
                    ],
                    [
                        {
                            "gearCode": "FPO",
                            "declaredMesh": None,
                            "controlledMesh": None,
                            "gearWasControlled": False,
                        }
                    ],
                    [
                        {
                            "gearCode": "OTB",
                            "declaredMesh": 40.0,
                            "controlledMesh": 42.0,
                            "gearWasControlled": True,
                        },
                        {
                            "gearCode": "OTB",
                            "declaredMesh": 40.0,
                            "controlledMesh": 42.6,
                            "gearWasControlled": True,
                        },
                    ],
                    [
                        {
                            "gearCode": "GNS",
                            "declaredMesh": 23.0,
                            "controlledMesh": 23.0,
                            "gearWasControlled": True,
                        }
                    ],
                    [
                        {
                            "gearCode": "NO",
                            "declaredMesh": None,
                            "controlledMesh": None,
                            "gearWasControlled": False,
                        }
                    ],
                ],
                "catch_controls": [
                    None,
                    [
                        {"nbFish": 14.0, "speciesCode": "BFT"},
                        {"weight": 150.0, "speciesCode": "SOL"},
                        {"weight": 52.0, "speciesCode": "COE"},
                    ],
                    None,
                    None,
                    [
                        {"weight": 60.0, "speciesCode": "SOL"},
                        {"weight": 1668.0, "speciesCode": "ANF"},
                    ],
                ],
                "segments": [[], [], [], [], []],
                "fao_areas": [[], [], [], [], []],
            }
        ),
    ],
    axis=1,
)


@pytest.fixture
def controls() -> pd.DataFrame:
    return controls_df


@pytest.fixture
def catch_controls() -> pd.DataFrame:
    return catch_controls_df


@pytest.fixture
def loaded_controls() -> pd.DataFrame:
    return loaded_controls_df


@task(checkpoint=False)
def mock_extract_controls(number_of_months: int) -> pd.DataFrame:
    def mock_read_saved_query(*args, **kwargs):
        return controls_df

    with patch("src.pipeline.generic_tasks.read_saved_query", mock_read_saved_query):
        return extract_controls.run(number_of_months=number_of_months)


# Using `patch` is a task results in flaky errors when using a LocalDaskExecutor so we
# need to make a mock task without `patch` to test the flow.
@task(checkpoint=False)
def mock_extract_controls_in_flow(number_of_months: int) -> pd.DataFrame:
    return controls_df


@task(checkpoint=False)
def mock_extract_catch_controls_in_flow() -> pd.DataFrame:
    return catch_controls_df


@patch("src.pipeline.flows.controls.extract")
def test_extract_controls_query_file_is_found(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_controls.run(number_of_months=12)
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.controls.extract")
def test_extract_catch_controls_query_file_is_found(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_catch_controls.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.controls.extract")
def test_extract_controls_raises_if_intput_is_not_valid(mock_extract):

    with pytest.raises(ValueError):
        extract_controls.run(number_of_months="12")

    with pytest.raises(ValueError):
        extract_controls.run(number_of_months=None)

    with pytest.raises(ValueError):
        extract_controls.run(number_of_months=[1, 2, 3])

    with pytest.raises(ValueError):
        extract_controls.run(number_of_months=-1)

    with pytest.raises(ValueError):
        extract_controls.run(number_of_months=245)


def test_extract_controls_applies_dtypes(controls):

    res = mock_extract_controls.run(number_of_months=12)

    with pytest.raises(AssertionError):
        # Expected to fail as dtypes are changed in extract_controls.
        pd.testing.assert_frame_equal(res, controls)

    pd.testing.assert_frame_equal(
        res, controls, check_dtype=False, check_categorical=False
    )


flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)
flow.replace(flow.get_tasks("extract_controls")[0], mock_extract_controls_in_flow)
flow.replace(
    flow.get_tasks("extract_catch_controls")[0], mock_extract_catch_controls_in_flow
)


def test_flow_replaces_data(reset_test_data, controls, loaded_controls):

    controls_query = "SELECT * FROM controls ORDER BY id"

    initial_controls = read_query("monitorfish_remote", controls_query)

    state = flow.run(loading_mode="replace", number_of_months=12)
    assert state.is_successful()
    final_controls = read_query("monitorfish_remote", controls_query)

    assert initial_controls.shape == (22, 33)
    assert final_controls.shape == (5, 33)

    pd.testing.assert_frame_equal(loaded_controls, final_controls, check_like=True)


def test_flow_upserts_data(reset_test_data, controls, loaded_controls):

    controls_query = "SELECT * FROM controls ORDER BY id"

    initial_controls = read_query("monitorfish_remote", controls_query)

    state = flow.run(loading_mode="upsert", number_of_months=12)
    assert state.is_successful()

    final_controls = read_query("monitorfish_remote", controls_query)

    new_controls = state.result[flow.get_tasks("compute_controls_segments")[0]].result

    assert initial_controls.shape == (22, 33)
    assert new_controls.shape == (5, 33)
    # Control ids already in the controls table and in newly extracted controls :
    assert set.intersection(set(new_controls.id), set(initial_controls.id)) == {1, 8}
    assert final_controls.shape == (25, 33)

    assert initial_controls.loc[initial_controls.id == 1, "vessel_id"][0] == 1
    assert new_controls.loc[new_controls.id == 1, "vessel_id"][0] == 100
    assert final_controls.loc[final_controls.id == 1, "vessel_id"][0] == 100
