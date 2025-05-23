from datetime import datetime

import pandas as pd
from pytest import fixture

from src.pipeline.flows.vessel_profiles import flow
from src.read_query import read_query
from tests.mocks import get_utcnow_mock_factory, mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)

flow.replace(
    flow.get_tasks("get_utcnow")[0],
    get_utcnow_mock_factory(datetime(2050, 5, 15, 11, 14)),
)


@fixture
def expected_vessel_profiles():
    return pd.DataFrame(
        {
            "cfr": ["ABC000306959", "CFR000888888"],
            "gears": [
                {
                    "LLS": 0.006716238906212521,
                    "OTB": 0.9533061485568082,
                    "OTM": 0.03997761253697929,
                },
                {"OTB": 1.0},
            ],
            "species": [
                {
                    "ABC": 0.7995522507395858,
                    "BSS": 0.0031982090029583432,
                    "COD": 0.00019988806268489645,
                    "DEF": 0.08795074758135445,
                    "GHI": 0.059966418805468935,
                    "HKE": 0.0022787239146078195,
                    "NEP": 0.003997761253697929,
                    "PIL": 0.03997761253697929,
                    "SOL": 0.0015991045014791716,
                    "SWO": 0.0012792836011833373,
                },
                {
                    "ABC": 0.8438818565400844,
                    "DEF": 0.09282700421940929,
                    "GHI": 0.06329113924050633,
                },
            ],
            "fao_areas": [
                {
                    "27.8": 0.019988806268489645,
                    "27.9": 0.019988806268489645,
                    "27.7.a": 0.005836731430398976,
                    "27.7.d": 0.7995522507395858,
                    "27.7.e": 0.08795074758135445,
                    "27.8.a": 0.06668265771168146,
                },
                {
                    "27.7.d": 0.8438818565400844,
                    "27.7.e": 0.09282700421940929,
                    "28.8.a": 0.06329113924050633,
                },
            ],
            "segments": [
                {
                    "L": 0.005836731430398976,
                    "T8-9": 0.06288478452066842,
                    "L BFT": 0.00019988806268489645,
                    "L HKE": 0.000679619413128648,
                    "T8-PEL": 0.019988806268489645,
                    "NO_SEGMENT": 0.9104101703046295,
                },
                {"FT": 0.9367088607594937, "NO_SEGMENT": 0.06329113924050633},
            ],
            "landing_ports": [{"FRXXX": 1.0}, {"FRLEH": 1.0}],
            "recent_gears": [{"LLS": 0.5, "OTB": 0.5}, None],
            "recent_species": [
                {
                    "BSS": 0.273972602739726,
                    "HKE": 0.136986301369863,
                    "NEP": 0.3424657534246575,
                    "SOL": 0.136986301369863,
                    "SWO": 0.1095890410958904,
                },
                None,
            ],
            "recent_fao_areas": [{"27.7.a": 0.5, "27.8.a": 0.5}, None],
            "recent_segments": [{"L": 0.5, "T8-9": 0.25, "NO_SEGMENT": 0.25}, None],
            "recent_landing_ports": [{"FRXXX": 1.0}, {"FRLEH": 1.0}],
            "latest_landing_port": ["FRXXX", "FRLEH"],
            "latest_landing_facade": ["Hors façade", "Hors façade"],
            "recent_gears_details": [
                [{"gear": "LLS", "mesh": None}, {"gear": "OTB", "mesh": 80.0}],
                None,
            ],
        }
    )


def test_flow(
    reset_test_data, add_enriched_catches, add_landings, expected_vessel_profiles
):
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    query = "SELECT * FROM vessel_profiles ORDER BY cfr"
    vessel_profiles = read_query(query, db="monitorfish_remote")

    pd.testing.assert_frame_equal(vessel_profiles, expected_vessel_profiles)
