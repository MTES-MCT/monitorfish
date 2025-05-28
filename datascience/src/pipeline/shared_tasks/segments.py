from datetime import datetime

import pandas as pd
from prefect import task

from src.pipeline.generic_tasks import extract


@task(checkpoint=False)
def extract_segments_of_year(year: int):
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fleet_segments_of_year.sql",
        params={"year": year},
    )


@task(checkpoint=False)
def extract_all_segments():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fleet_segments.sql",
    )


@task(checkpoint=False)
def extract_control_priorities() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/control_priorities.sql",
        params={"year": datetime.utcnow().year},
    )
