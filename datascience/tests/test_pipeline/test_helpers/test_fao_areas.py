from src.pipeline.helpers.fao_areas import remove_redundant_fao_area_codes


def test_remove_redundant_fao_area_codes():
    assert sorted(remove_redundant_fao_area_codes(["27", "37.1"])) == ["27", "37.1"]
    assert sorted(remove_redundant_fao_area_codes(["27.8.a", "27", "37.1"])) == [
        "27.8.a",
        "37.1",
    ]
    assert sorted(remove_redundant_fao_area_codes(["27.8.a", "8.a", "37.1"])) == [
        "27.8.a",
        "37.1",
        "8.a",
    ]
