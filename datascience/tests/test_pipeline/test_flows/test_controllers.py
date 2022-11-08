from unittest.mock import patch

import pandas as pd
import sqlalchemy

from src.pipeline.flows.controllers import extract_controllers, load_controllers
from tests.mocks import mock_extract_side_effect


@patch("src.pipeline.flows.controllers.extract")
def test_extract_controllers(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_controllers.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.controllers.load", autospec=True)
def test_load_controllers(mock_load):
    dummy_controllers = pd.DataFrame()
    load_controllers.run(dummy_controllers)
