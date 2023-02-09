from datetime import datetime, timedelta
from io import BytesIO
from pathlib import Path
from typing import Union
from unittest.mock import MagicMock, patch

import pandas as pd
import requests
from prefect import task

from src.pipeline.entities.monitorfish_healthcheck import MonitorfishHealthcheck
from src.pipeline.generic_tasks import extract
from src.pipeline.shared_tasks.datagouv import update_resource


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


def get_utcnow_mock_factory(utcnow: datetime):
    @task(checkpoint=False)
    def mock_get_utcnow():
        return utcnow

    return mock_get_utcnow


@task(checkpoint=False)
def mock_check_flow_not_running():
    return True


def get_monitorfish_healthcheck_mock_factory(
    *,
    last_position_updated_by_prefect_minutes_ago: int = 0,
    last_position_received_by_api_minutes_ago: int = 0,
    logbook_message_received_minutes_ago: int = 0,
):
    @task(checkpoint=False)
    def get_monitorfish_healthcheck() -> MonitorfishHealthcheck:
        utcnow = datetime.utcnow()
        return MonitorfishHealthcheck(
            date_last_position_updated_by_prefect=utcnow
            - timedelta(minutes=last_position_updated_by_prefect_minutes_ago),
            date_last_position_received_by_api=utcnow
            - timedelta(minutes=last_position_received_by_api_minutes_ago),
            date_logbook_message_received=utcnow
            - timedelta(minutes=logbook_message_received_minutes_ago),
        )

    return get_monitorfish_healthcheck


def extract_satellite_operators_statuses_mock_factory(
    operator_1_status: bool = None, operator_2_status: bool = None
):
    @task(checkpoint=False)
    def extract_satellite_operators_statuses() -> pd.DataFrame:
        return pd.DataFrame(
            {
                "satellite_operator_id": [1, 2],
                "operator_is_up": [operator_1_status, operator_2_status],
            }
        )

    return extract_satellite_operators_statuses


@task(checkpoint=False)
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

    with patch("src.pipeline.shared_tasks.datagouv.requests.post", return_200):
        return update_resource.run(
            dataset_id=dataset_id,
            resource_id=resource_id,
            resource_title=resource_title,
            resource=resource,
            mock_update=mock_update,
        )
