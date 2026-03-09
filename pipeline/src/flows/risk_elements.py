from datetime import datetime

import duckdb
import pandas as pd
from prefect import flow, get_run_logger, task

from src.entities.risk_elements import RiskElement
from src.generic_tasks import extract, load
from src.processing import df_to_dict_series
from src.shared_tasks.dates import date_trunc, get_utcnow, make_relativedelta


@task
def extract_total_trips(from_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/total_trips.sql",
        params={
            "from_datetime_utc": from_datetime_utc,
        },
    )


@task
def extract_compliant_trips(
    risk_element: RiskElement, from_datetime_utc: datetime
) -> pd.DataFrame:
    queries = {
        RiskElement.MOT_MR: ("data_warehouse", "data_warehouse/margin_of_tolerance.sql")
    }

    db_name, query_filepath = queries[risk_element]

    return extract(
        db_name=db_name,
        query_filepath=query_filepath,
        params={
            "from_datetime_utc": from_datetime_utc,
        },
    )


@task
def compute_vessels_risk_elements(
    total_trips: pd.DataFrame, compliant_trips: pd.DataFrame, risk_element: RiskElement
):
    res = duckdb.sql(
        """
        SELECT
            tt.cfr,
            total_trips,
            COALESCE(compliant_trips, 0) AS compliant_trips,
            (total_trips - COALESCE(compliant_trips, 0)) / total_trips AS share_of_non_compliant_trips,
        FROM total_trips tt
        LEFT JOIN compliant_trips ct
        ON ct.cfr = tt.cfr
    """
    ).to_df()

    res["metrics"] = df_to_dict_series(
        res[["total_trips", "compliant_trips", "share_of_non_compliant_trips"]],
        result_colname="metrics",
    )

    # ≤10% = 1, (10%, 15%] = 2, (15%, 20%] = 3, (20%, 100%] = 4
    risk_thresholds = [-0.1, 0.1, 0.15, 0.2, 1]
    res["risk_level"] = (
        pd.cut(res.share_of_non_compliant_trips, risk_thresholds, labels=False) + 1
    )

    res["risk_element_code"] = risk_element.value

    return res[["risk_element_code", "cfr", "metrics", "risk_level"]]


@task
def load_vessels_risk_elements(vessels_risk_elements: pd.DataFrame):
    logger = get_run_logger()
    load(
        df=vessels_risk_elements,
        table_name="vessels_risk_elements",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="upsert",
        table_id_column="risk_element_code",
        df_id_column="risk_element_code",
        jsonb_columns=["metrics"],
    )


@flow(name="Monitorfish - Risk elements")
def risk_elements_flow():
    # Extract
    now = get_utcnow()
    today = date_trunc(now, "DAY")
    from_datetime_utc = today - make_relativedelta(years=1)

    total_trips = extract_total_trips(from_datetime_utc=from_datetime_utc)
    mot_mr_compliant_trips = extract_compliant_trips(
        RiskElement.MOT_MR, from_datetime_utc=from_datetime_utc
    )

    mot_mr_vessels_risk_elements = compute_vessels_risk_elements(
        total_trips, mot_mr_compliant_trips, RiskElement.MOT_MR
    )

    # Load
    load_vessels_risk_elements(mot_mr_vessels_risk_elements)
