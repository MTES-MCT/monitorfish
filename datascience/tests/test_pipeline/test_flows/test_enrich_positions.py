import datetime
import unittest

import pandas as pd

from src.pipeline.flows.enrich_positions import filter_already_enriched_vessels


class TestEnrichPositionsFlow(unittest.TestCase):
    def test_filter_already_enriched_vessels(self):
        positions = pd.DataFrame(
            {
                "cfr": ["A", "B", "A", "C", "C", "B"],
                "external_immatriculation": ["AA", "BB", None, "CC", "CC", "BBB"],
                "ircs": ["AAA", "BBB", "AAA", "CCC", "CCC", "BBB"],
                "is_at_port": [None, False, False, True, None, False],
            }
        )

        filtered_positions = filter_already_enriched_vessels(positions)

        expected_filtered_positions = positions.loc[[0, 2, 3, 4], :].reset_index(
            drop=True
        )

        pd.testing.assert_frame_equal(filtered_positions, expected_filtered_positions)

    def test_filter_already_enriched_vessels_empty_input(self):
        positions = pd.DataFrame(
            columns=pd.Index(["cfr", "external_immatriculation", "ircs", "is_at_port"])
        )

        filtered_positions = filter_already_enriched_vessels(positions)

        pd.testing.assert_frame_equal(
            filtered_positions, positions, check_index_type=False
        )
