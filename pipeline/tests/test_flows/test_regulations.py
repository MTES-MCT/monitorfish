from unittest.mock import patch

import pandas as pd
from pytest import fixture

from src.flows.regulations import (
    delete_required,
    extract_remote_hashes,
    merge_hashes,
    regulations_flow,
    select_ids_to_delete,
    select_ids_to_update,
    update_required,
)
from src.read_query import read_query


@fixture
def remote_hashes() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6],
            "remote_row_hash": [
                "hash111",
                "hash222",
                "hash333",
                "hash444",
                "hash555",
                "hash666",
            ],
        }
    )


def mock_extract_local_hashes():
    return pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 6, 7],
            "local_row_hash": [
                "hash111",
                "hash222",
                "hash333",
                "hash444",
                "hash666_changed",
                "hash777",
            ],
        }
    )


@fixture
def local_hashes() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 6, 7],
            "local_row_hash": [
                "hash111",
                "hash222",
                "hash333",
                "hash444",
                "hash666_changed",
                "hash777",
            ],
        }
    )


@fixture
def hashes() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6, 7],
            "local_row_hash": [
                "hash111",
                "hash222",
                "hash333",
                "hash444",
                None,
                "hash666_changed",
                "hash777",
            ],
            "remote_row_hash": [
                "hash111",
                "hash222",
                "hash333",
                "hash444",
                "hash555",
                "hash666",
                None,
            ],
        }
    )


def test_extract_remote_hashes(reset_test_data, remote_hashes):
    res = extract_remote_hashes()
    pd.testing.assert_frame_equal(res, remote_hashes)


def test_merge_hashes(local_hashes, remote_hashes, hashes):
    res = merge_hashes(local_hashes, remote_hashes)
    pd.testing.assert_frame_equal(res, hashes)


def test_select_ids_to_update(hashes):
    res = select_ids_to_update(hashes)
    assert res == {6, 7}


def test_select_ids_to_delete(hashes):
    res = select_ids_to_delete(hashes)
    assert res == {5}


def test_update_required():
    assert update_required({1, 2, 3})
    assert update_required({1})
    assert not update_required({})


def test_delete_required():
    assert delete_required({1, 2, 3})
    assert delete_required({1})
    assert not delete_required({})


def mock_extract_new_regulations(ids: set):
    geom = (
        "0106000020E61000000100000001030000000100000005000000000000000000F0BF0000000000804"
        "8400000000000000000000000000080484000000000000000000000000000004940000000000000F0"
        "BF0000000000004940000000000000F0BF0000000000804840"
    )

    return pd.DataFrame(
        {
            "id": [6, 7],
            "law_type": ["Reg. RTC", "Reg. RTC"],
            "topic": ["Zone RTC DEU", "Zone RTC BEL"],
            "zone": ["Zone RTC 2", "Zone RTC 3"],
            "region": [None, None],
            "regulatory_details": [None, None],
            "regulatory_references": [
                [
                    {
                        "url": "http://legipeche.metier.e2.rie.gouv.fr/deleted-regulation-a671.html",
                        "reference": "Dead link regulation",
                    }
                ],
                None,
            ],
            "geometry": [geom, geom],
            "row_hash": ["hash666_chaged", "hash777"],
            "geometry_simplified": [geom, geom],
            "fishing_period": [
                {
                    "dates": [],
                    "always": True,
                    "weekdays": [],
                    "otherInfo": (
                        "Lors de la période de nidification de l'avifaune "
                        "(Phatéon à bec jaune)"
                    ),
                    "authorized": False,
                    "dateRanges": [],
                    "timeIntervals": [],
                },
                None,
            ],
            "species": [
                None,
                {"otherInfo": None, "authorized": None, "unauthorized": None},
            ],
            "gears": [
                {"otherInfo": None, "authorized": None, "unauthorized": None},
                None,
            ],
            "next_id": [None, None],
            "other_info": [None, "Zone ARP"],
            "tags": [None, ["ARP"]],
        }
    )


def test_flow(reset_test_data):
    initial_remote_regulations = read_query(
        "SELECT * FROM regulations", db="monitorfish_remote"
    )

    with patch(
        "src.flows.regulations.extract_local_hashes", mock_extract_local_hashes
    ), patch(
        "src.flows.regulations.extract_new_regulations", mock_extract_new_regulations
    ):
        state = regulations_flow(return_state=True)

    assert state.is_completed()

    final_remote_regulations = read_query(
        "SELECT * FROM regulations", db="monitorfish_remote"
    )

    assert set(initial_remote_regulations.id) == {1, 2, 3, 4, 5, 6}
    assert set(final_remote_regulations.id) == {1, 2, 3, 4, 6, 7}
    assert final_remote_regulations.loc[
        final_remote_regulations.id == 7, "tags"
    ].values[0] == ["ARP"]
