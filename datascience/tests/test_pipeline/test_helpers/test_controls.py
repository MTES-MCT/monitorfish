import pytest

from src.pipeline.helpers.controls import make_infractions


def test_make_infractions():
    assert make_infractions({1, 2, 3}) == [{"natinf": 1}, {"natinf": 2}, {"natinf": 3}]
    assert make_infractions({1, 2, 3}, only_natinfs={2, 5, 6, 1}) == [
        {"natinf": 1},
        {"natinf": 2},
    ]
    assert make_infractions({1, 2, 3}, exclude_natinfs={2, 5, 6, 1}) == [{"natinf": 3}]
    assert make_infractions({}, exclude_natinfs={2, 5, 6, 1}) == []
    assert make_infractions({}, only_natinfs={2, 5, 6, 1}) == []
    assert make_infractions({}) == []
    assert make_infractions(None) == []
    with pytest.raises(ValueError):
        make_infractions({1, 2, 3}, only_natinfs={2, 1}, exclude_natinfs={2, 5})
