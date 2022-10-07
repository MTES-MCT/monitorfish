from logging import Logger

import pandas as pd

from src.db_config import create_engine
from src.pipeline.shared_tasks.vessels import make_find_vessels_query
from src.pipeline.utils import get_table


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

    query = make_find_vessels_query.run(vessels=vessels, vessels_table=vessels_table)
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
