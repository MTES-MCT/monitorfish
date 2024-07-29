import geopandas as gpd
from prefect import task

from src.pipeline.flows.fao_areas import flow
from src.read_query import read_query
from tests.test_pipeline.test_utils import make_square_multipolygon


@task(checkpoint=False)
def mock_extract_fao_areas() -> gpd.GeoDataFrame:
    fao_areas = gpd.GeoDataFrame(
        {
            "id": [
                "FAO_AREAS_CWP_NOCOASTLINE.1447",
                "FAO_AREAS_CWP_NOCOASTLINE.1201",
                "FAO_AREAS_CWP_NOCOASTLINE.1233",
                "FAO_AREAS_CWP_NOCOASTLINE.1237",
                "FAO_AREAS_CWP_NOCOASTLINE.1448",
            ],
            "F_CODE": ["27.3.d.24", "21.5", "34.1.3", "71.6.1", "27.3.b.23"],
            "F_LEVEL": [
                "SUBDIVISION",
                "SUBAREA",
                "DIVISION",
                "DIVISION",
                "SUBDIVISION",
            ],
            "F_STATUS": [1, 1, 1, 1, 1],
            "OCEAN": ["Atlantic", "Atlantic", "Atlantic", "Pacific", "Atlantic"],
            "SUBOCEAN": ["2", "2", "3", "7", "2"],
            "F_AREA": ["27", "21", "34", "71", "27"],
            "F_SUBAREA": ["27.3", "21.5", "34.1", "71.6", "27.3"],
            "F_DIVISION": ["27.3.d", "", "34.1.3", "71.6.1", "27.3.b, c"],
            "F_SUBDIVIS": ["27.3.d.24", "", "", "", "27.3.b.23"],
            "F_SUBUNIT": ["", "", "", "", ""],
            "ID": [335, 89, 121, 125, 336],
            "NAME_EN": ["Baltic", "Atlantic", "Sahara", "Pacific", "Subdivision"],
            "NAME_FR": ["Baltique", "Atl", "Sahara", "Pac", "Sous-division"],
            "NAME_ES": ["Báltico", "Atl", "Sahara", "Pac", "Subdivisión"],
            "geometry": [
                make_square_multipolygon(45, 46, 1, 2),
                make_square_multipolygon(45, 46, 10, 2.3),
                make_square_multipolygon(45, 46, 0.1, 0.22),
                make_square_multipolygon(45, 46, 1.5, 0.82),
                make_square_multipolygon(45, 46, 1.6, 2.6),
            ],
        }
    )
    fao_areas = fao_areas.set_crs(4326)
    return fao_areas


flow.replace(flow.get_tasks("extract_fao_areas")[0], mock_extract_fao_areas)


def test_flow(reset_test_data):
    query = "SELECT * FROM fao_areas"
    initial_fao_areas = read_query(query, db="monitorfish_remote")

    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    # Check loaded ports
    loaded_fao_areas = read_query(query, db="monitorfish_remote")

    assert len(initial_fao_areas) == 3
    assert len(loaded_fao_areas) == 5
