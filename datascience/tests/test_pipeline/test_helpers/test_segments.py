from src.pipeline.helpers.segments import catch_area_isin_fao_area


def test_catch_area_isin_fao_area():
    assert catch_area_isin_fao_area("27", "27")
    assert catch_area_isin_fao_area("27.7", "27")
    assert catch_area_isin_fao_area("27.7", None)
    assert catch_area_isin_fao_area(None, None)
    assert not catch_area_isin_fao_area(None, "27.7")
    assert not catch_area_isin_fao_area("27", "27.7")
