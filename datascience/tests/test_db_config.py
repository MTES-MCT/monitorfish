from unittest.mock import patch

import pytest

from src.db_config import create_engine


@patch("src.db_config.sa")
def test_create_engine(mock_sa):

    create_engine("monitorfish_local")
    mock_sa.create_engine.assert_called_once_with(
        "postgresql://db_user:db_pwd@12.34.567.89:0000/db_name"
    )

    with pytest.raises(KeyError):
        create_engine("cacem_local")
