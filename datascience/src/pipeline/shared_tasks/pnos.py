import pandas as pd
from prefect import task

from src.pipeline.generic_tasks import extract


@task(checkpoint=False)
def extract_pno_units_targeting_vessels() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pno_units_targeting_vessels.sql",
    )


@task(checkpoint=False)
def extract_pno_units_ports_and_segments_subscriptions() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pno_units_ports_and_segments_subscriptions.sql",
    )
