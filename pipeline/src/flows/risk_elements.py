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
def extract_vms_vessels(from_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/vms_vessels.sql",
        params={
            "from_datetime_utc": from_datetime_utc,
        },
    )


@task
def extract_reportings(
    risk_element: RiskElement, from_datetime_utc: datetime
) -> pd.DataFrame:
    queries = {
        RiskElement.CLA_CM: (
            "monitorfish_remote",
            "monitorfish/fishing_in_closed_areas.sql",
        )
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
def compute_reportings_vessels_risk_elements(
    vessels: pd.DataFrame, reportings: pd.DataFrame, risk_element: RiskElement
):
    res = duckdb.sql(
        """
        SELECT
            v.cfr,
            COALESCE(r.nb_reportings, 0) AS nb_reportings
        FROM vessels v
        LEFT JOIN reportings r
        ON v.cfr = r.cfr
    """
    ).to_df()

    res["metrics"] = df_to_dict_series(
        res[["nb_reportings"]],
        result_colname="metrics",
    )

    # 0 reportings = 1, 1 reporting = 2, 2 or 3 reportings = 3, 4+ reportings = 4
    risk_thresholds = [-0.1, 0.5, 1.5, 3.5, 1000000]
    res["risk_level"] = pd.cut(res.nb_reportings, risk_thresholds, labels=False) + 1

    res["risk_element_code"] = risk_element.value

    return res[["risk_element_code", "cfr", "metrics", "risk_level"]]


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
    vms_vessels = extract_vms_vessels(from_datetime_utc=from_datetime_utc)

    mot_mr_compliant_trips = extract_compliant_trips(
        RiskElement.MOT_MR, from_datetime_utc=from_datetime_utc
    )
    cla_cm_reportings = extract_reportings(
        RiskElement.CLA_CM, from_datetime_utc=from_datetime_utc
    )

    # Transform
    mot_mr_vessels_risk_elements = compute_vessels_risk_elements(
        total_trips, mot_mr_compliant_trips, RiskElement.MOT_MR
    )
    cla_cm_vessels_risk_elements = compute_reportings_vessels_risk_elements(
        vms_vessels, cla_cm_reportings, RiskElement.CLA_CM
    )

    # Load
    load_vessels_risk_elements(mot_mr_vessels_risk_elements)
    load_vessels_risk_elements(cla_cm_vessels_risk_elements)
