from dataclasses import dataclass
from datetime import datetime
from typing import List, Union

import pandas as pd
import prefect
from dateutil.relativedelta import relativedelta
from prefect import Flow, Parameter, task

from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.spatial import (
    compute_movement_metrics,
    detect_fishing_activity,
    tag_port_movements,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.positions import tag_positions_at_port


@dataclass
class Period:
    start: datetime
    end: datetime


@task(checkpoint=False)
def make_periods() -> List[Period]:
    end = datetime.utcnow()
    start = end - relativedelta(days=1)
    return [Period(start=start, end=end)]


@task(checkpoint=False)
def extract_positions(period: Period) -> pd.DataFrame:
    """
    Extracts all positions of a given Period.

    Args:
        period (Period): Period of extraction

    Returns:
        pd.DataFrame: DataFrame of positions.
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/all_positions.sql",
        params={
            "start": period.start,
            "end": period.end,
        },
        dtypes={"datetime_utc": "datetime64[ns]"},
    )


@task(checkpoint=False)
def compute_movement_metrics_by_vessel(positions: pd.DataFrame) -> pd.DataFrame:
    return (
        positions.groupby(
            ["cfr", "ircs", "external_immatriculation"], dropna=False, group_keys=False
        )
        .apply(compute_movement_metrics)
        .copy(deep=True)
    )


@task(checkpoint=False)
def tag_port_movements_by_vessel(positions: pd.DataFrame) -> pd.DataFrame:
    return (
        positions.groupby(
            ["cfr", "ircs", "external_immatriculation"], dropna=False, group_keys=False
        )
        .apply(tag_port_movements)
        .copy(deep=True)
    )


@task(checkpoint=False)
def detect_fishing_activity_by_vessel(positions: pd.DataFrame) -> pd.DataFrame:
    return (
        positions.groupby(
            ["cfr", "ircs", "external_immatriculation"], dropna=False, group_keys=False
        )
        .apply(detect_fishing_activity)
        .copy(deep=True)
    )


@task(checkpoint=False)
def load_fishing_activity(positions: pd.DataFrame):
    pass


with Flow("Enrich positions") as flow:

    periods = make_periods()
    positions = extract_positions.map(periods)
    positions = tag_positions_at_port.map(positions)
    positions = compute_movement_metrics_by_vessel.map(positions)
    positions = tag_port_movements_by_vessel.map(positions)
    positions = detect_fishing_activity_by_vessel.map(positions)
