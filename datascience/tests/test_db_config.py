import os
import unittest
from unittest.mock import patch

from src.db_config import create_engine


class TestDBConfig(unittest.TestCase):
    @patch("src.db_config.sa")
    def test_create_engine(self, mock_sa):
        os.environ["MONITORFISH_LOCAL_CLIENT"] = "postgresql"
        os.environ["MONITORFISH_LOCAL_HOST"] = "12.34.567.89"
        os.environ["MONITORFISH_LOCAL_PORT"] = "0000"
        os.environ["MONITORFISH_LOCAL_NAME"] = "db_name"
        os.environ["MONITORFISH_LOCAL_USER"] = "db_user"
        os.environ["MONITORFISH_LOCAL_PWD"] = "db_pwd"

        create_engine("monitorfish_local")
        mock_sa.create_engine.assert_called_once_with(
            "postgresql://db_user:db_pwd@12.34.567.89:0000/db_name"
        )

        os.environ.pop("MONITORFISH_LOCAL_CLIENT")
        os.environ.pop("MONITORFISH_LOCAL_HOST")
        os.environ.pop("MONITORFISH_LOCAL_PORT")
        os.environ.pop("MONITORFISH_LOCAL_NAME")
        os.environ.pop("MONITORFISH_LOCAL_USER")
        os.environ.pop("MONITORFISH_LOCAL_PWD")

        with self.assertRaises(KeyError):
            create_engine("monitorfish_local")
