import pandas as pd
from prefect import task

from src.pipeline.generic_tasks import extract


@task(checkpoint=False)
def extract_current_risk_factors() -> pd.DataFrame:
    """
    Extracts vessels' current risk factor in `last_positions` table.
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/current_risk_factors.sql",
    )
