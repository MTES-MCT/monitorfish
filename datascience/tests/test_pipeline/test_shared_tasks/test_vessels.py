import pandas as pd

from src.pipeline.shared_tasks.infrastructure import get_table
from src.pipeline.shared_tasks.vessels import add_vessel_id, add_vessels_columns


def test_add_vessel_id(reset_test_data):
    vessels_table = get_table.run("vessels")
    vessels = pd.DataFrame(
        columns=["cfr", "ircs", "external_immatriculation", "other_data"],
        data=[
            ["ABC000306959", None, "RV348407", "Vessel 1"],
            [None, "IL2468", "Incorrect external immat", "Vessel 3"],
            [None, "AB654321", "AB123456", "Vessel 5"],
            [None, None, "AB123456", "Vessel 5 bis"],
            ["Does", "not", "exist", "No vessel!"],
        ],
    )
    vessels_with_id = add_vessel_id.run(vessels, vessels_table)

    expected_vessels_with_id = vessels.copy(deep=True)
    expected_vessels_with_id["vessel_id"] = [1, 3, None, None, None]

    pd.testing.assert_frame_equal(vessels_with_id, expected_vessels_with_id)


def test_add_vessels_columns(reset_test_data):
    vessels = pd.DataFrame(
        {
            "vessel_id": [2, 4, 5],
            "some_data": ["A", "B", "C"],
        }
    )

    vessels_table = get_table.run("vessels")
    districts_table = get_table.run("districts")

    vessels_with_added_columns = add_vessels_columns.run(
        vessels=vessels,
        vessels_table=vessels_table,
        vessels_columns_to_add=["sailing_type", "gauge"],
        districts_table=districts_table,
        districts_columns_to_add=["dml", "district"],
    )

    expected_added_columns = pd.DataFrame(
        {
            "sailing_type": ["Petite pêche", "Grande pêche", "Grande pêche"],
            "gauge": [3.7, 2.7, 2.7],
            "dml": ["DML 29", None, "DML 13"],
            "district": ["Concarneau", None, "Marseille"],
        }
    )

    expected_vessels_with_added_columns = vessels.join(expected_added_columns)

    pd.testing.assert_frame_equal(
        vessels_with_added_columns,
        expected_vessels_with_added_columns,
    )
