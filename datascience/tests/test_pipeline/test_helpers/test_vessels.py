from logging import Logger
from unittest.mock import MagicMock

import pandas as pd

from src.db_config import create_engine
from src.pipeline.helpers.vessels import (
    make_add_vessels_columns_query,
    make_find_vessels_query,
    merge_vessel_id,
)
from src.pipeline.utils import get_table


def test_make_add_vessels_columns_query(reset_test_data):
    e = create_engine("monitorfish_remote")
    logger = Logger("test_logger")
    vessels_table = get_table("vessels", "public", e, logger)
    districts_table = get_table("districts", "public", e, logger)

    query = make_add_vessels_columns_query(
        vessel_ids=[1, 3, 4],
        vessels_table=vessels_table,
        vessels_columns_to_add=["registry_port", "sailing_type"],
        districts_table=districts_table,
        districts_columns_to_add=["dml"],
    )
    query_string = str(query.compile(compile_kwargs={"literal_binds": True}))

    expected_query_string = (
        "SELECT public.vessels.id AS vessel_id, public.vessels.registry_port, "
        "public.vessels.sailing_type, "
        "public.districts.dml \n"
        "FROM public.vessels "
        "LEFT OUTER JOIN public.districts "
        "ON public.vessels.district_code = public.districts.district_code \n"
        "WHERE public.vessels.id IN (1, 3, 4)"
    )

    assert query_string == expected_query_string


def test_make_find_vessels_query(reset_test_data):
    vessels = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", None],
            "ircs": ["AA", None, "duplicated", "duplicated"],
            "external_immatriculation": ["AAA", None, "CCC", None],
            "other_vessels_data": ["a", "b", "c", "d"],
        }
    )

    e = create_engine("monitorfish_remote")
    logger = Logger("test_logger")
    vessels_table = get_table("vessels", "public", e, logger)

    query = make_find_vessels_query(vessels=vessels, vessels_table=vessels_table)
    query_string = str(query.compile(compile_kwargs={"literal_binds": True}))

    expected_query_string = (
        "SELECT public.vessels.id AS vessel_id, "
        "public.vessels.cfr, "
        "public.vessels.ircs, "
        "public.vessels.external_immatriculation \n"
        "FROM public.vessels \n"
        "WHERE public.vessels.cfr IN ('A', 'B', 'C') OR "
        "public.vessels.external_immatriculation IN ('AAA', 'CCC') OR "
        "public.vessels.ircs IN ('AA', 'duplicated')"
    )

    assert query_string == expected_query_string


def test_merge_vessel_id():
    vessels = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", None, "E", "F"],
            "ircs": ["AA", None, "duplicated", "duplicated", "EE", "FF"],
            "external_immatriculation": ["AAA", None, "CCC", None, "EEE", "FFF"],
            "other_vessels_data": ["a", "b", "c", "d", "e", "f"],
        }
    )

    found_vessels = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", None, "E"],
            "ircs": ["AA", None, "duplicated", "EE", None],
            "external_immatriculation": ["AAA", "B from ref", "CCC", "EEE", "EE_"],
            "vessel_id": [1, 2, 3, 4, 5],
        }
    )

    logger = MagicMock()

    vessels_with_id = merge_vessel_id(vessels, found_vessels, logger)

    expected_vessels_with_id = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", None, "E", "F"],
            "ircs": ["AA", None, "duplicated", "duplicated", "EE", "FF"],
            "external_immatriculation": ["AAA", None, "CCC", None, "EEE", "FFF"],
            "other_vessels_data": ["a", "b", "c", "d", "e", "f"],
            "vessel_id": [1, 2, None, None, None, None],
        }
    )

    pd.testing.assert_frame_equal(vessels_with_id, expected_vessels_with_id)

    assert len(logger.method_calls) == 2
    assert logger.warning.call_count == 2
