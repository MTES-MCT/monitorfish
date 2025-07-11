import pandas as pd

from src.flows.init_pno_types import init_pno_types_flow
from src.read_query import read_query


def test_flow(reset_test_data):
    pno_types_query = "SELECT * FROM pno_types ORDER BY id"
    pno_type_rules_query = "SELECT * FROM pno_type_rules ORDER BY id"
    initial_pno_types = read_query(pno_types_query, db="monitorfish_remote")
    initial_pno_type_rules = read_query(pno_type_rules_query, db="monitorfish_remote")

    state = init_pno_types_flow(return_state=True)
    assert state.is_completed()

    pno_types_after_first_run = read_query(pno_types_query, db="monitorfish_remote")
    pno_type_rules_after_first_run = read_query(
        pno_type_rules_query, db="monitorfish_remote"
    )

    assert len(initial_pno_types) == 4
    assert len(pno_types_after_first_run) == 12
    assert len(initial_pno_type_rules) == 7
    assert len(pno_type_rules_after_first_run) == 49

    # Re-running should succeed and lead to the same pno types
    state = init_pno_types_flow(return_state=True)
    assert state.is_completed()

    pno_types_after_second_run = read_query(pno_types_query, db="monitorfish_remote")
    pno_type_rules_after_second_run = read_query(
        pno_type_rules_query, db="monitorfish_remote"
    )

    pd.testing.assert_frame_equal(pno_types_after_first_run, pno_types_after_second_run)
    pd.testing.assert_frame_equal(
        pno_type_rules_after_first_run, pno_type_rules_after_second_run
    )
