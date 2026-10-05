import pandas as pd
from prefect import task

from src.generic_tasks import extract
from src.helpers.dates import utcnow


@task
def extract_segments_of_year(year: int):
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fleet_segments_of_year.sql",
        params={"year": year},
    )


@task
def extract_all_segments():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/fleet_segments.sql",
    )


@task
def extract_control_priorities_and_infringement_risk_levels() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/control_priorities_and_infringement_risk_levels.sql",
        params={"year": utcnow().year},
    )
