from pathlib import Path
from typing import Union
from unittest.mock import patch

from src.pipeline.generic_tasks import extract
from src.read_query import read_saved_query


def mock_extract_side_effect(
    db_name: str,
    query_filepath: Union[Path, str],
    dtypes: Union[None, dict] = None,
    parse_dates: Union[list, dict, None] = None,
    ):
    @patch("src.read_query.pd")
    @patch("src.read_query.create_engine")
    def mock_extract_side_effect_(
        db_name, query_filepath, dtypes, parse_dates, mock_create_engine, mock_pd
    ):
        def read_sql_mock(query, engine, **kwargs):
            return query

        mock_pd.read_sql.side_effect = read_sql_mock

        return extract(db_name, query_filepath, dtypes, parse_dates)

    return mock_extract_side_effect_(db_name, query_filepath, dtypes, parse_dates)
