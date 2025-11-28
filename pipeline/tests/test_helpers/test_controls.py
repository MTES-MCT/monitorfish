from src.entities.missions import InfractionType
from src.helpers.controls import make_infractions


def test_make_infractions():
    assert make_infractions({1, 2, 3}, InfractionType.WITH_RECORD) == [
        {"natinf": 1, "infractionType": "WITH_RECORD"},
        {"natinf": 2, "infractionType": "WITH_RECORD"},
        {"natinf": 3, "infractionType": "WITH_RECORD"},
    ]
    assert make_infractions({1, 2}, InfractionType.WITHOUT_RECORD) == [
        {"natinf": 1, "infractionType": "WITHOUT_RECORD"},
        {"natinf": 2, "infractionType": "WITHOUT_RECORD"},
    ]
    assert make_infractions({}, InfractionType.WITH_RECORD) == []
    assert make_infractions(None, InfractionType.WITH_RECORD) == []
