from datetime import datetime, timedelta
from pathlib import Path
from typing import Union
from unittest.mock import MagicMock, patch

import pandas as pd
from prefect import task

from src.pipeline.entities.monitorfish_healthcheck import MonitorfishHealthcheck
from src.pipeline.generic_tasks import extract


def mock_extract_side_effect(
    db_name: str,
    query_filepath: Union[Path, str],
    dtypes: Union[None, dict] = None,
    parse_dates: Union[list, dict, None] = None,
    params: Union[dict, None] = None,
    backend: str = "pandas",
    geom_col: str = "geom",
    crs: Union[int, None] = None,
):
    @patch("src.read_query.pd")
    @patch("src.read_query.create_engine")
    def mock_extract_side_effect_(
        db_name,
        query_filepath,
        dtypes,
        parse_dates,
        params,
        mock_create_engine,
        mock_pd,
    ):
        def read_sql_mock(query, engine, **kwargs):
            return query

        mock_pd.read_sql.side_effect = read_sql_mock

        return extract(
            db_name=db_name,
            query_filepath=query_filepath,
            dtypes=None,
            parse_dates=parse_dates,
            params=params,
        )

    return mock_extract_side_effect_(
        db_name, query_filepath, dtypes, parse_dates, params
    )


def mock_datetime_utcnow(utcnow: datetime):
    mock_datetime = MagicMock()
    mock_datetime.utcnow = MagicMock(return_value=utcnow)
    return mock_datetime


@task(checkpoint=False)
def mock_check_flow_not_running():
    return True


@task(checkpoint=False)
def mock_extract_monitorfish_recent_positions_histogram():
    truncated_utwnow = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    return pd.DataFrame(
        {
            "datetime_utc_hour": [
                truncated_utwnow - timedelta(hours=i) for i in range(48, 0, -1)
            ],
            "number_of_positions": [780 + 10 * i for i in range(48)],
        }
    )


def get_monitorfish_healthcheck_mock_factory(
    *,
    position_received_minutes_ago: int = 0,
    last_position_minutes_ago: int = 0,
    logbook_message_received_minutes_ago: int = 0,
):
    @task(checkpoint=False)
    def get_monitorfish_healthcheck() -> MonitorfishHealthcheck:
        utcnow = datetime.utcnow()
        return MonitorfishHealthcheck(
            date_position_received=utcnow
            - timedelta(minutes=position_received_minutes_ago),
            date_last_position=utcnow - timedelta(minutes=last_position_minutes_ago),
            date_logbook_message_received=utcnow
            - timedelta(minutes=logbook_message_received_minutes_ago),
        )

    return get_monitorfish_healthcheck
