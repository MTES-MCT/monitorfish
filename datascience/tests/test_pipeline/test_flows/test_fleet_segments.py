import unittest
from unittest.mock import patch

import pandas as pd

from src.pipeline.flows.fleet_segments import flow


class TestFleetSegmentsFlow(unittest.TestCase):
    @patch("src.pipeline.flows.fleet_segments.load")
    def test_flow(self, mock_load):
        flow.run()
        mock_load.assert_called_once()


if __name__ == "__main__":
    unittest.main()
