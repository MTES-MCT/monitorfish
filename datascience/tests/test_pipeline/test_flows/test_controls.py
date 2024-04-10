from datetime import datetime
from unittest.mock import patch

import pandas as pd
import pytest
import pytz
import sqlalchemy
from prefect import task

from config import POSEIDON_CONTROL_ID_TO_MONITORENV_MISSION_ID_SHIFT
from src.pipeline.entities.missions import MissionActionType, MissionOrigin
from src.pipeline.flows.controls import (
    extract_catch_controls,
    extract_controls,
    flow,
    transform_controls,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running, mock_extract_side_effect

y = datetime.utcnow().year

controls_df = pd.DataFrame(
    {
        "id": [56027, 55302, 56216, 56149, 55734, 55301, 55269, 55799, 55238, 55423],
        "vessel_id": [229, 54, 783, 771, 128, 625, 398, 391, 483, 391],
        "cfr": [
            "ABC000697418",
            "ABC000402675",
            "ABC000689974",
            "ABC000353631",
            "ABC000854577",
            "ABC000967139",
            "ABC000413412",
            "ABC000897617",
            "ABC000967139",
            "ABC000714650",
        ],
        "ircs": [
            "NPRM",
            "ROYO",
            "QMBZ",
            "TR4758",
            "EUC6463",
            "TR4758",
            "XFSH",
            "NWQS",
            "YI6076",
            "GN2162",
        ],
        "external_immatriculation": [
            "RX518078",
            "PV688932",
            "UH536958",
            "OL952776",
            "KQ445561",
            "KT417109",
            "QD366840",
            "NZ263895",
            "KT417109",
            "QK706246",
        ],
        "vessel_name": [
            "ANIMER SI FIN",
            "PUBLIC RETIRER EN",
            "PARTIR SAC VÉRITÉ",
            "ÉTRANGE ACCEPTER ESPRIT",
            "PROPOS LENTEMENT MUR",
            "MATIÈRE ATTAQUER PROMETTRE",
            "BARBE PRÉPARER TOUT",
            "FINIR JETER MONSIEUR",
            "CHERCHER NEUF ENNEMI",
            "DRÔLE MENACER DÈS",
        ],
        "flag_state": ["FR", "FR", "FR", "FR", "FR", "BR", "FR", "FR", "VE", "FR"],
        "district_code": ["HA", "TD", "OX", "EH", "YT", "VL", "VB", "KW", "VL", "YP"],
        "control_unit_id": [117, 61, 10, 12, 1140, 1185, 2, 11, 1247, 2],
        "control_type": [
            "Contrôle à la mer",
            "Contrôle à la débarque",
            "Contrôle aérien",
            "Contrôle à la mer",
            "Contrôle à la mer",
            "Contrôle à la mer",
            "Contrôle à la mer",
            "Contrôle à la débarque",
            "Contrôle à la mer",
            "Contrôle à la débarque",
        ],
        "action_datetime_utc": [
            datetime(2021, 3, 31, 7, 12, 0),
            datetime(2021, 2, 12, 12, 11, 0),
            datetime(2022, 4, 14, 12, 28, 0),
            datetime(2022, 4, 9, 12, 41, 0),
            datetime(y, 3, 11, 12, 45, 0),
            datetime(y, 2, 11, 14, 35, 0),
            datetime(y, 2, 10, 12, 10, 0),
            datetime(y, 3, 17, 15, 5, 0),
            datetime(y, 2, 8, 19, 36, 0),
            datetime(y, 2, 23, 11, 18, 0),
        ],
        "longitude": [
            3.05,
            None,
            -2.85,
            -1.1167,
            1.4,
            -51.95,
            -1.35,
            None,
            53.33,
            None,
        ],
        "latitude": [
            42.85,
            None,
            48.7333,
            44.6833,
            45.7,
            4.75,
            46.2167,
            None,
            6.95,
            None,
        ],
        "port_locode": [
            None,
            "FRCAM",
            None,
            None,
            None,
            None,
            None,
            "FRGVC",
            None,
            "FRFAY",
        ],
        "mission_order": ["0", "0", "0", "0", "1", "0", "1", "0", "0", "1"],
        "vessel_targeted": ["0", "0", "0", "0", "1", None, None, None, "0", "0"],
        "infraction_natinfs": [
            "27885",
            None,
            "42",
            "27724, 2593,  1017  , 1132",
            "53",
            "27886,  20242 ,  7061 ",
            None,
            None,
            "27730",
            None,
        ],
        "infraction": [0, 0, 1, 1, 2, 2, 0, 0, 1, 0],
        "diversion": ["0", "0", "0", "0", "0", None, None, "0", "1", "0"],
        "seizure": [None, "0", "0", "1", "1", "1", "0", None, "1", "0"],
        "seizure_and_diversion_comments": [
            None,
            None,
            None,
            (
                "55KG SUR80 DE palourde en sous taille "
                "\npeche aprhéndé dans la totalité et saisie"
            ),
            "ENGIN + PRODUIT DE LA PECHE",
            (
                "produit de la peche (730 kg +5 kg vessies fraiche +0.5 kg vessie "
                "seches "
                "+ 3 km de filet + glace + panneau"
            ),
            None,
            None,
            "TOTALITE DE LA PECHE EN ENGIN DE PECHE",
            None,
        ],
        "other_comments": [
            "Contrôle Poséidon 2 mis à jour",
            "PAS D ENGIN A BORD",
            "CONTROLE EN TRAIN DE PECHER 7 MINUTES AVANT OUVERTURE CRENEAUX",
            "pas d'engins a bord ",
            "MAILLAGE CUL DE CHALUT NON CONFORME",
            "3 km de filet saisis",
            None,
            "PANNEAU A MAILLE DE CARRE DE 100 MESURE A 105.1",
            "Contrôle Poséidon mis à jour",
            "400M POUR GTR\n1000M POUR GNS\n1000M POUR GNS 2",
        ],
        "gear_1_code": [
            "GNS",
            "NO",
            "OTM",
            None,
            "PTM",
            "GND",
            "DRB",
            "OTT",
            "LHM",
            "GTR",
        ],
        "gear_2_code": ["TBN", None, None, None, "OTT", None, None, "OTT", None, "GNS"],
        "gear_3_code": [None, None, None, None, None, None, None, None, None, "GNS"],
        "gear_1_was_controlled": ["0", "0", "0", None, "1", "0", None, "1", "0", "1"],
        "gear_2_was_controlled": ["0", "0", "0", None, "0", "0", "0", "1", "0", "1"],
        "gear_3_was_controlled": ["0", "0", "0", None, "0", "0", "0", "0", "0", "1"],
        "declared_mesh_1": [
            90.0,
            None,
            None,
            None,
            40.0,
            None,
            96.0,
            80.0,
            None,
            100.0,
        ],
        "declared_mesh_2": [
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            80.0,
            None,
            100.0,
        ],
        "declared_mesh_3": [None, None, None, None, None, None, None, None, None, 90.0],
        "controlled_mesh_1": [
            None,
            None,
            None,
            None,
            38.5,
            None,
            96.0,
            85.2,
            None,
            105.0,
        ],
        "controlled_mesh_2": [
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            85.2,
            None,
            104.0,
        ],
        "controlled_mesh_3": [
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            93.0,
        ],
        "open_by": [
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
        ],
        "completed_by": [
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
        ],
    }
)

catch_controls_df = pd.DataFrame(
    {
        "id": [56027, 56027, 56216, 55734, 55734],
        "species_code": ["BFT", "SOL", "HKE", "ANF", "HKE"],
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
    "action_datetime_utc",
    "longitude",
    "latitude",
    "seizure_and_diversion_comments",
    "other_comments",
    "open_by",
    "completed_by",
]

expected_loaded_mission_actions_df = pd.merge(
    controls_df[unchanged_columns].assign(
        id=lambda x: x["id"] + POSEIDON_CONTROL_ID_TO_MONITORENV_MISSION_ID_SHIFT
    ),
    pd.DataFrame(
        {
            "id": [
                -144762,
                -144731,
                -144699,
                -144698,
                -144577,
                -144266,
                -144201,
                -143973,
                -143851,
                -143784,
            ],
            "action_type": [
                MissionActionType.SEA_CONTROL.value,
                MissionActionType.SEA_CONTROL.value,
                MissionActionType.SEA_CONTROL.value,
                MissionActionType.LAND_CONTROL.value,
                MissionActionType.LAND_CONTROL.value,
                MissionActionType.SEA_CONTROL.value,
                MissionActionType.LAND_CONTROL.value,
                MissionActionType.SEA_CONTROL.value,
                MissionActionType.SEA_CONTROL.value,
                MissionActionType.AIR_CONTROL.value,
            ],
            "facade": [
                None,
                "SA",
                None,
                None,
                None,
                "SA",
                None,
                "NAMO",
                "NAMO",
                "SA",
            ],
            "vessel_targeted": [
                "NO",
                None,
                None,
                "NO",
                "NO",
                "YES",
                None,
                "NO",
                "NO",
                "NO",
            ],
            "seizure_and_diversion": [
                True,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
            ],
            "gear_onboard": [
                [
                    {
                        "gearCode": "LHM",
                        "declaredMesh": None,
                        "controlledMesh": None,
                        "gearWasControlled": False,
                        "hasUncontrolledMesh": True,
                    }
                ],
                [
                    {
                        "gearCode": "DRB",
                        "declaredMesh": 96.0,
                        "controlledMesh": 96.0,
                        "gearWasControlled": None,
                        "hasUncontrolledMesh": False,
                    }
                ],
                [
                    {
                        "gearCode": "GND",
                        "declaredMesh": None,
                        "controlledMesh": None,
                        "gearWasControlled": False,
                        "hasUncontrolledMesh": True,
                    }
                ],
                [
                    {
                        "gearCode": "NO",
                        "declaredMesh": None,
                        "controlledMesh": None,
                        "gearWasControlled": False,
                        "hasUncontrolledMesh": True,
                    }
                ],
                [
                    {
                        "gearCode": "GTR",
                        "declaredMesh": 100.0,
                        "controlledMesh": 105.0,
                        "gearWasControlled": True,
                        "hasUncontrolledMesh": False,
                    },
                    {
                        "gearCode": "GNS",
                        "declaredMesh": 100.0,
                        "controlledMesh": 104.0,
                        "gearWasControlled": True,
                        "hasUncontrolledMesh": False,
                    },
                    {
                        "gearCode": "GNS",
                        "declaredMesh": 90.0,
                        "controlledMesh": 93.0,
                        "gearWasControlled": True,
                        "hasUncontrolledMesh": False,
                    },
                ],
                [
                    {
                        "gearCode": "PTM",
                        "declaredMesh": 40.0,
                        "controlledMesh": 38.5,
                        "gearWasControlled": True,
                        "hasUncontrolledMesh": False,
                    },
                    {
                        "gearCode": "OTT",
                        "declaredMesh": None,
                        "controlledMesh": None,
                        "gearWasControlled": False,
                        "hasUncontrolledMesh": True,
                    },
                ],
                [
                    {
                        "gearCode": "OTT",
                        "declaredMesh": 80.0,
                        "controlledMesh": 85.2,
                        "gearWasControlled": True,
                        "hasUncontrolledMesh": False,
                    },
                    {
                        "gearCode": "OTT",
                        "declaredMesh": 80.0,
                        "controlledMesh": 85.2,
                        "gearWasControlled": True,
                        "hasUncontrolledMesh": False,
                    },
                ],
                [
                    {
                        "gearCode": "GNS",
                        "declaredMesh": 90.0,
                        "controlledMesh": None,
                        "gearWasControlled": False,
                        "hasUncontrolledMesh": True,
                    },
                    {
                        "gearCode": "TBN",
                        "declaredMesh": None,
                        "controlledMesh": None,
                        "gearWasControlled": False,
                        "hasUncontrolledMesh": True,
                    },
                ],
                [],
                [
                    {
                        "gearCode": "OTM",
                        "declaredMesh": None,
                        "controlledMesh": None,
                        "gearWasControlled": False,
                        "hasUncontrolledMesh": True,
                    }
                ],
            ],
            "species_onboard": [
                [],
                [],
                [],
                [],
                [],
                [
                    {"weight": 150.0, "speciesCode": "ANF"},
                    {"weight": 52.0, "speciesCode": "HKE"},
                ],
                [],
                [
                    {"nbFish": 14.0, "speciesCode": "BFT"},
                    {"weight": 60.0, "speciesCode": "SOL"},
                ],
                [],
                [{"weight": 1668.0, "speciesCode": "HKE"}],
            ],
            "fao_areas": [
                [],
                ["27.8"],
                [],
                [],
                [],
                ["27.8", "27.9"],
                [],
                ["27.9"],
                ["27.8"],
                ["27.8"],
            ],
            "mission_id": [
                -144762,
                -144731,
                -144699,
                -144698,
                -144577,
                -144266,
                -144201,
                -143973,
                -143851,
                -143784,
            ],
            "emits_vms": [None, None, None, None, None, None, None, None, None, None],
            "emits_ais": [None, None, None, None, None, None, None, None, None, None],
            "logbook_matches_activity": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "licences_match_activity": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "species_weight_controlled": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "species_size_controlled": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "separate_stowage_of_preserved_species": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "logbook_infractions": [
                [],
                [],
                [{"natinf": 27886, "infractionType": "WITHOUT_RECORD"}],
                [],
                [],
                [],
                [],
                [{"natinf": 27885, "infractionType": "WITHOUT_RECORD"}],
                [],
                [],
            ],
            "licences_and_logbook_observations": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "gear_infractions": [
                [],
                [],
                [{"natinf": 20242, "infractionType": "WITHOUT_RECORD"}],
                [],
                [],
                [],
                [],
                [],
                [
                    {"natinf": 2593, "infractionType": "WITH_RECORD"},
                    {"natinf": 27724, "infractionType": "WITH_RECORD"},
                ],
                [],
            ],
            "species_infractions": [
                [{"natinf": 27730, "infractionType": "WITH_RECORD"}],
                [],
                [{"natinf": 7061, "infractionType": "WITHOUT_RECORD"}],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
            ],
            "species_observations": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "other_infractions": [
                [],
                [],
                [],
                [],
                [],
                [{"natinf": 53, "infractionType": "WITHOUT_RECORD"}],
                [],
                [],
                [
                    {"natinf": 1017, "infractionType": "WITH_RECORD"},
                    {"natinf": 1132, "infractionType": "WITH_RECORD"},
                ],
                [{"natinf": 42, "infractionType": "WITH_RECORD"}],
            ],
            "number_of_vessels_flown_over": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "unit_without_omega_gauge": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "control_quality_comments": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "feedback_sheet_required": [
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
            ],
            "is_from_poseidon": [
                True,
                True,
                True,
                True,
                True,
                True,
                True,
                True,
                True,
                True,
            ],
            "segments": [
                [],
                [],
                [],
                [],
                [],
                [
                    {"segment": "SWW01/02/03", "segmentName": "Bottom trawls"},
                    {"segment": "SWW04", "segmentName": "Midwater trawls"},
                ],
                [],
                [{"segment": "SWW01/02/03 - 2022", "segmentName": "Bottom trawls"}],
                [],
                [{"segment": "SWW04 - 2022", "segmentName": "Midwater trawls"}],
            ],
            "port_locode": [
                None,
                None,
                None,
                "FRCAM",
                "FRHOT",
                None,
                "FRGVC",
                None,
                None,
                None,
            ],
            "flight_goals": [None] * 10,
            "has_some_gears_seized": [
                True,
                False,
                True,
                False,
                False,
                True,
                False,
                False,
                True,
                False,
            ],
            "has_some_species_seized": [
                True,
                False,
                True,
                False,
                False,
                True,
                False,
                False,
                True,
                False,
            ],
            "is_administrative_control": [None] * 10,
            "is_compliance_with_water_regulations_control": [None] * 10,
            "is_safety_equipment_and_standards_compliance_control": [None] * 10,
            "is_seafarers_control": [None] * 10,
        }
    ),
    on="id",
).rename(columns={"open_by": "user_trigram"})
expected_loaded_mission_actions_df[
    "action_datetime_utc"
] = expected_loaded_mission_actions_df.action_datetime_utc.map(pytz.utc.localize)

expected_missions_df = pd.DataFrame(
    {
        "id": [
            -143973,
            -144698,
            -143784,
            -143851,
            -144266,
            -144699,
            -144731,
            -144201,
            -144762,
            -144577,
        ],
        "open_by": [
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
            "ABC",
        ],
        "facade": [
            "NAMO",
            None,
            "SA",
            "NAMO",
            "SA",
            None,
            "SA",
            None,
            None,
            None,
        ],
        "mission_order": [
            False,
            False,
            False,
            False,
            True,
            False,
            True,
            False,
            False,
            True,
        ],
        "mission_types": [
            ["SEA"],
            ["LAND"],
            ["AIR"],
            ["SEA"],
            ["SEA"],
            ["SEA"],
            ["SEA"],
            ["LAND"],
            ["SEA"],
            ["LAND"],
        ],
        "completed_by": [
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
        ],
        "deleted": [
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
        ],
        "mission_source": [
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
            MissionOrigin.POSEIDON_CNSP,
        ],
        "start_datetime_utc": [
            datetime(2021, 3, 31, 7, 12, 0),
            datetime(2021, 2, 12, 12, 11, 0),
            datetime(2022, 4, 14, 12, 28, 0),
            datetime(2022, 4, 9, 12, 41, 0),
            datetime(y, 3, 11, 12, 45, 0),
            datetime(y, 2, 11, 14, 35, 0),
            datetime(y, 2, 10, 12, 10, 0),
            datetime(y, 3, 17, 15, 5, 0),
            datetime(y, 2, 8, 19, 36, 0),
            datetime(y, 2, 23, 11, 18, 0),
        ],
        "end_datetime_utc": [
            datetime(2021, 3, 31, 7, 12, 0),
            datetime(2021, 2, 12, 12, 11, 0),
            datetime(2022, 4, 14, 12, 28, 0),
            datetime(2022, 4, 9, 12, 41, 0),
            datetime(y, 3, 11, 12, 45, 0),
            datetime(y, 2, 11, 14, 35, 0),
            datetime(y, 2, 10, 12, 10, 0),
            datetime(y, 3, 17, 15, 5, 0),
            datetime(y, 2, 8, 19, 36, 0),
            datetime(y, 2, 23, 11, 18, 0),
        ],
    }
)


expected_missions_control_units_df = pd.DataFrame(
    {
        "mission_id": [
            -143973,
            -144698,
            -143784,
            -143851,
            -144266,
            -144699,
            -144731,
            -144201,
            -144762,
            -144577,
        ],
        "control_unit_id": [117, 61, 10, 12, 1140, 1185, 2, 11, 1247, 2],
    }
)


@pytest.fixture
def controls() -> pd.DataFrame:
    return controls_df


@pytest.fixture
def empty_controls() -> pd.DataFrame:
    return controls_df.head(0)


@pytest.fixture
def catch_controls() -> pd.DataFrame:
    return catch_controls_df


@pytest.fixture
def expected_loaded_mission_actions() -> pd.DataFrame:
    return expected_loaded_mission_actions_df


@pytest.fixture
def expected_missions() -> pd.DataFrame:
    return expected_missions_df


@pytest.fixture
def expected_missions_control_units() -> pd.DataFrame:
    return expected_missions_control_units_df


@task(checkpoint=False)
def mock_extract_controls(number_of_months: int) -> pd.DataFrame:
    def mock_read_saved_query(*args, **kwargs):
        return controls_df

    with patch("src.pipeline.generic_tasks.read_saved_query", mock_read_saved_query):
        return extract_controls.run(number_of_months=number_of_months)


# Using `patch` in a task results in flaky errors when using a LocalDaskExecutor so we
# need to make a mock task without `patch` to test the flow.
@task(checkpoint=False)
def mock_extract_controls_in_flow(number_of_months: int) -> pd.DataFrame:
    return controls_df


@task(checkpoint=False)
def mock_extract_catch_controls_in_flow() -> pd.DataFrame:
    return catch_controls_df


@task(checkpoint=False)
def mock_load_missions_and_missions_control_units(
    missions: pd.DataFrame, missions_control_units: pd.DataFrame, loading_mode: str
):
    pass


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


flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)
flow.replace(flow.get_tasks("extract_controls")[0], mock_extract_controls_in_flow)
flow.replace(
    flow.get_tasks("extract_catch_controls")[0], mock_extract_catch_controls_in_flow
)
flow.replace(
    flow.get_tasks("load_missions_and_missions_control_units")[0],
    mock_load_missions_and_missions_control_units,
)


@pytest.mark.parametrize(
    "loading_mode",
    [
        "replace",
        "upsert",
    ],
)
def test_flow(
    reset_test_data,
    expected_loaded_mission_actions,
    expected_missions,
    expected_missions_control_units,
    loading_mode,
):
    mission_actions_query = "SELECT * FROM mission_actions ORDER BY id"

    initial_mission_actions = read_query(
        mission_actions_query, db="monitorfish_remote"
    ).drop(columns=["is_deleted"])

    flow.schedule = None
    state = flow.run(loading_mode=loading_mode, number_of_months=12)
    assert state.is_successful()

    missions, mission_actions, missions_control_units = state.result[
        flow.get_tasks("make_missions_actions_and_missions_control_units")[0]
    ].result

    # Test missions output
    pd.testing.assert_frame_equal(
        expected_missions.sort_values("id").reset_index(drop=True).convert_dtypes(),
        missions.sort_values("id").reset_index(drop=True).convert_dtypes(),
    )

    # Test missions_control_units output
    pd.testing.assert_frame_equal(
        expected_missions_control_units.sort_values("mission_id").reset_index(
            drop=True
        ),
        missions_control_units.sort_values("mission_id").reset_index(drop=True),
    )

    final_mission_actions = read_query(
        mission_actions_query, db="monitorfish_remote"
    ).drop(columns=["is_deleted"])

    # mission_actions not from Poseidon should not be altered by the flow
    assert (
        len(
            initial_mission_actions.loc[~initial_mission_actions.is_from_poseidon, "id"]
        )
        == len(final_mission_actions.loc[~final_mission_actions.is_from_poseidon, "id"])
        == 23
    )
    pd.testing.assert_frame_equal(
        (
            initial_mission_actions.loc[
                ~initial_mission_actions.is_from_poseidon
            ].reset_index(drop=True)
        ),
        (
            final_mission_actions.loc[
                ~final_mission_actions.is_from_poseidon
            ].reset_index(drop=True)
        ),
    )

    if loading_mode == "replace":
        # Initial mission_actions from Poseidon must be removed by the flow
        assert (
            len(initial_mission_actions[initial_mission_actions.is_from_poseidon]) == 2
        )
        assert set(
            initial_mission_actions.loc[initial_mission_actions.is_from_poseidon, "id"]
        ) == {-199999, -144762}

        assert (
            len(final_mission_actions[final_mission_actions.is_from_poseidon])
            == len(mission_actions)
            == 10
        )

        assert (
            set(final_mission_actions.loc[final_mission_actions.is_from_poseidon, "id"])
            == set(mission_actions.id)
            == {
                -144762,
                -144731,
                -144699,
                -144698,
                -144577,
                -144266,
                -144201,
                -143973,
                -143851,
                -143784,
            }
        )

        df_1 = expected_loaded_mission_actions.set_index("id").sort_index()
        df_2 = (
            final_mission_actions[final_mission_actions.is_from_poseidon]
            .set_index("id")
            .sort_index()
        )
        df_2["fao_areas"] = df_2["fao_areas"].map(lambda li: sorted(li))
        df_2["segments"] = df_2.segments.map(
            lambda li: sorted(li, key=lambda x: x["segment"])
        )

        pd.testing.assert_frame_equal(df_1, df_2, check_like=True, check_dtype=False)

    elif loading_mode == "upsert":
        # Initial mission_actions from Poseidon must be inserted or updated by the flow
        assert (
            len(initial_mission_actions[initial_mission_actions.is_from_poseidon]) == 2
        )
        assert set(
            initial_mission_actions.loc[initial_mission_actions.is_from_poseidon, "id"]
        ) == {-199999, -144762}

        assert (
            len(final_mission_actions[final_mission_actions.is_from_poseidon])
            == len(mission_actions) + 1
            == 11
        )

        assert (
            set(final_mission_actions.loc[final_mission_actions.is_from_poseidon, "id"])
            == set(mission_actions.id).union({-199999})
            == {
                -199999,
                -144762,
                -144731,
                -144699,
                -144698,
                -144577,
                -144266,
                -144201,
                -143973,
                -143851,
                -143784,
            }
        )

        assert (
            initial_mission_actions.loc[
                initial_mission_actions.id == -144762, "other_comments"
            ].values[0]
            == "Contrôle Poséidon à mettre à jour"
        )

        assert (
            final_mission_actions.loc[
                final_mission_actions.id == -144762, "other_comments"
            ].values[0]
            == "Contrôle Poséidon mis à jour"
        )

    else:
        raise ValueError(f"Unexpected loading mode: {loading_mode}")


def test_transform_empty_controls(empty_controls):
    transform_controls.run(empty_controls)
