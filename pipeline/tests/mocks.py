from datetime import datetime, timedelta
from io import BytesIO
from pathlib import Path
from typing import Union
from unittest.mock import MagicMock, patch

import pandas as pd
import requests
from prefect import task

from src.entities.monitorfish_healthcheck import MonitorfishHealthcheck
from src.generic_tasks import extract
from src.helpers.dates import utcnow
from src.shared_tasks.datagouv import update_resource


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


def mock_utcnow(utcnow: datetime):
    """Replacement for `src.helpers.dates.utcnow` returning a fixed naive datetime.

    Use it to patch the `utcnow` name as imported into the module under test, e.g.
    `@patch("src.flows.some_flow.utcnow", mock_utcnow(datetime(2021, 1, 1)))`.
    """
    return MagicMock(return_value=utcnow)


def get_utcnow_mock_factory(utcnow: datetime):
    @task
    def mock_get_utcnow():
        return utcnow

    return mock_get_utcnow


def get_monitorfish_healthcheck_mock_factory(
    *,
    last_position_updated_by_prefect_minutes_ago: int = 0,
    last_position_received_by_api_minutes_ago: int = 0,
    logbook_message_received_minutes_ago: int = 0,
):
    @task
    def get_monitorfish_healthcheck() -> MonitorfishHealthcheck:
        now = utcnow()
        return MonitorfishHealthcheck(
            date_last_position_updated_by_prefect=now
            - timedelta(minutes=last_position_updated_by_prefect_minutes_ago),
            date_last_position_received_by_api=now
            - timedelta(minutes=last_position_received_by_api_minutes_ago),
            date_logbook_message_received=now
            - timedelta(minutes=logbook_message_received_minutes_ago),
        )

    return get_monitorfish_healthcheck


def extract_satellite_operators_statuses_mock_factory(
    operator_1_status: bool = None, operator_2_status: bool = None
):
    @task
    def extract_satellite_operators_statuses() -> pd.DataFrame:
        return pd.DataFrame(
            {
                "satellite_operator_id": [1, 2],
                "operator_is_up": [operator_1_status, operator_2_status],
            }
        )

    return extract_satellite_operators_statuses


@task
def mock_update_resource(
    dataset_id: str,
    resource_id: str,
    resource_title: str,
    resource: BytesIO,
    mock_update: bool,
) -> pd.DataFrame:
    def return_200(url, **kwargs):
        r = requests.Response()
        r.status_code = 200
        r.url = url
        return r

    with patch("src.shared_tasks.datagouv.requests.post", return_200):
        return update_resource.fn(
            dataset_id=dataset_id,
            resource_id=resource_id,
            resource_title=resource_title,
            resource=resource,
            mock_update=mock_update,
        )


def mock_get_depth(lon: float, lat: float):
    return lon
