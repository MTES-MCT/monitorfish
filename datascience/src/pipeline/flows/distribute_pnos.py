from datetime import datetime
from pathlib import Path

import pandas as pd
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.generic_tasks import extract
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.dates import get_utcnow, make_timedelta


@task(checkpoint=False)
def extract_pnos_to_distribute(
    start_datetime_utc: datetime, end_datetime_utc: datetime
) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pnos_to_distribute.sql",
        params={
            "start_datetime_utc": start_datetime_utc,
            "end_datetime_utc": end_datetime_utc,
        },
    )


with Flow("Distribute pnos", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        start_hours_ago = Parameter("start_hours_ago")
        end_hours_ago = Parameter("end_hours_ago")
        timedelta_from_start_to_now = make_timedelta(hours=start_hours_ago)
        timedelta_from_end_to_now = make_timedelta(hours=end_hours_ago)
        utcnow = get_utcnow()
        start_datetime_utc = utcnow - timedelta_from_start_to_now
        end_datetime_utc = utcnow - timedelta_from_end_to_now
        pnos = extract_pnos_to_distribute(
            start_datetime_utc=start_datetime_utc,
            end_datetime_utc=end_datetime_utc,
        )


flow.file_name = Path(__file__).name
