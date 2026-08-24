import geopandas as gpd
import pandas as pd
from sqlalchemy import text

from src.db_config import create_engine
from src.flows.recompute_mission_actions_facade import (
    compute_mission_actions_facade,
    recompute_mission_actions_facade_flow,
)
from src.read_query import read_query
from tests.test_utils import make_square_multipolygon


def test_compute_mission_actions_facade():
    mission_actions = pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6, 7],
            "action_type": [
                "SEA_CONTROL",
                "AIR_CONTROL",
                "LAND_CONTROL",
                "LAND_CONTROL",
                "SEA_CONTROL",
                "AIR_SURVEILLANCE",
                "OBSERVATION",
            ],
            "latitude": [48.5, 44.5, None, None, 60.0, 48.5, None],
            "longitude": [-4.5, -1.5, None, None, -10.0, -4.5, None],
            "port_locode": [None, None, "FRLOR", "FRUNKNOWN", None, None, "FRLOR"],
        }
    )

    facade_areas = gpd.GeoDataFrame(
        {
            "facade": ["NAMO", "MEMN"],
            "geometry": [
                make_square_multipolygon(-5, 47, 5, 3),
                make_square_multipolygon(-2, 43, 2, 3),
            ],
        },
        crs=4326,
    )

    ports = pd.DataFrame(
        {
            "locode": ["FRLOR"],
            "facade": ["NAMO"],
        }
    )

    res = compute_mission_actions_facade(mission_actions, facade_areas, ports)

    res = res.set_index("id").facade.to_dict()

    assert res == {
        1: "NAMO",
        2: "MEMN",
        3: "NAMO",
        4: None,
    }


def test_recompute_mission_actions_facade_flow(reset_test_data):
    """
    Test data (from `V666.14__Reset_test_actions.sql` and
    `V666.29__Reset_test_ports.sql`) combined with the dummy `facade_areas_subdivided`
    test data (`NAMO` : latitude in [0, 45] ; `SA` : latitude in [45, 50] ; both for
    longitude in [-10, 10]), gives the following expected facades once mission actions'
    `action_datetime_utc` is set to a common year :

      - `SEA_CONTROL` actions are assigned a facade based on their (`latitude`,
        `longitude`), or no facade when these are missing or outside of the test
        facade areas
      - `LAND_CONTROL` actions are assigned the facade of their `port_locode`
    """
    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(
            text(
                "UPDATE public.mission_actions "
                "SET action_datetime_utc = '2022-03-12 15:33' "
                "WHERE id NOT IN (-199999, -144762)"
            )
        )

    query = "SELECT id, facade FROM public.mission_actions ORDER BY id"
    initial_facades = (
        read_query(query, db="monitorfish_remote").set_index("id").facade.to_dict()
    )

    # Running the flow on a year without data should not update any row
    state = recompute_mission_actions_facade_flow(year=1950, return_state=True)
    assert state.is_completed()
    facades = (
        read_query(query, db="monitorfish_remote").set_index("id").facade.to_dict()
    )
    assert facades == initial_facades

    state = recompute_mission_actions_facade_flow(year=2022, return_state=True)
    assert state.is_completed()
    facades = (
        read_query(query, db="monitorfish_remote").set_index("id").facade.to_dict()
    )

    assert facades == {
        # Left on a different year : untouched by the flow
        -199999: initial_facades[-199999],
        -144762: initial_facades[-144762],
        # SEA_CONTROL : facade deduced from (latitude, longitude)
        1: "SA",
        2: "NAMO",
        3: "NAMO",
        4: "SA",
        5: "NAMO",
        # LAND_CONTROL : facade of the port
        6: "NAMO",  # FRCQF
        7: "SA",  # FRBES
        8: None,  # FRDPE
        9: "NAMO",  # FRDKK
        10: "SA",  # FRLEH
        # SEA_CONTROL with no latitude / longitude : no facade
        11: None,
        12: None,
        13: None,
        14: None,
        15: None,
        # LAND_CONTROL : facade of the port
        16: "SA",  # FRZJZ
        17: "SA",  # FRZJZ
        18: "SA",  # FRZJZ
        19: "SA",  # FRZJZ
        20: "SA",  # FRZJZ
        21: "NAMO",  # FRDKK
        22: "SA",  # FRZJZ
        23: "SA",  # FRZJZ
    }
