import pytest

from src.pipeline.entities.missions import InfractionType
from src.pipeline.helpers.controls import make_infractions


def test_make_infractions():
    assert make_infractions({1, 2, 3}, InfractionType.WITH_RECORD) == [
        {"natinf": 1, "infractionType": "WITH_RECORD"},
        {"natinf": 2, "infractionType": "WITH_RECORD"},
        {"natinf": 3, "infractionType": "WITH_RECORD"},
    ]
    assert make_infractions(
        {1, 2, 3}, InfractionType.WITHOUT_RECORD, only_natinfs={2, 5, 6, 1}
    ) == [
        {"natinf": 1, "infractionType": "WITHOUT_RECORD"},
        {"natinf": 2, "infractionType": "WITHOUT_RECORD"},
    ]
    assert make_infractions(
        {1, 2, 3}, InfractionType.WITH_RECORD, exclude_natinfs={2, 5, 6, 1}
    ) == [{"natinf": 3, "infractionType": "WITH_RECORD"}]
    assert (
        make_infractions({}, InfractionType.WITH_RECORD, exclude_natinfs={2, 5, 6, 1})
        == []
    )
    assert (
        make_infractions({}, InfractionType.WITH_RECORD, only_natinfs={2, 5, 6, 1})
        == []
    )
    assert make_infractions({}, InfractionType.WITH_RECORD) == []
    assert make_infractions(None, InfractionType.WITH_RECORD) == []
    with pytest.raises(ValueError):
        make_infractions(
            {1, 2, 3},
            InfractionType.WITH_RECORD,
            only_natinfs={2, 1},
            exclude_natinfs={2, 5},
        )
