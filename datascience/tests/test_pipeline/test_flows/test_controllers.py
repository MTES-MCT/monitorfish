import unittest
from unittest.mock import patch

from src.pipeline.flows.controllers import extract_controllers, flow, load_controllers
from tests.mocks import mock_extract_side_effect


class TestControllersFlow(unittest.TestCase):

    @patch("src.pipeline.flows.controllers.extract")
    def test_extract_controllers(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_controllers.run()
        self.assertTrue(isinstance(query, str))
