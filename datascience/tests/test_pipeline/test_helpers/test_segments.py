import unittest

from src.pipeline.helpers.segments import catch_area_isin_fao_area


class TestHelpersSegments(unittest.TestCase):
    def test_catch_area_isin_fao_area(self):
        self.assertTrue(catch_area_isin_fao_area("27", "27"))
        self.assertTrue(catch_area_isin_fao_area("27.7", "27"))
        self.assertTrue(catch_area_isin_fao_area("27.7", None))
        self.assertFalse(catch_area_isin_fao_area(None, "27.7"))
        self.assertFalse(catch_area_isin_fao_area("27", "27.7"))

        self.assertTrue(catch_area_isin_fao_area(None, None))
