from datetime import datetime
from typing import Tuple

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
def extract_trips_subject_to_pno(from_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/trips_subject_to_pno.sql",
        params={
            "from_datetime_utc": from_datetime_utc,
        },
    )


@task
def extract_rtps(from_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/rtps.sql",
        params={
            "from_datetime_utc": from_datetime_utc,
        },
    )


@task
def extract_logbook_pnos(from_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/logbook_pnos.sql",
        params={
            "from_datetime_utc": from_datetime_utc,
        },
    )


@task
def extract_manual_pnos(from_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/manual_pnos.sql",
        params={
            "from_datetime_utc": from_datetime_utc,
        },
    )


@task
def evaluate_trips_pnos(
    trips_subject_to_pno: pd.DataFrame,
    rtps: pd.DataFrame,
    manual_pnos: pd.DataFrame,
    logbook_pnos: pd.DataFrame,
) -> pd.DataFrame:
    trips = duckdb.sql(
        """
        SELECT
            t.cfr,
            t.trip_number,
            CASE
                WHEN
                    r.return_datetime > (
                       lp.predicted_arrival_datetime_utc - INTERVAL '15 minutes'
                    ) AND
                    lp.predicted_arrival_datetime_utc >= (
                       lp.report_datetime_utc +
                       to_hours(minimum_notification_period::Int) -
                       to_minutes(5)
                    )
                THEN true
                WHEN
                    r.return_datetime > (
                       mp.predicted_arrival_datetime_utc - INTERVAL '15 minutes'
                    ) AND
                    r.return_datetime < (
                       mp.predicted_arrival_datetime_utc + INTERVAL '4 hours'
                    ) AND
                    mp.predicted_arrival_datetime_utc >= (
                       mp.report_datetime_utc +
                       to_hours(minimum_notification_period::Int) -
                       to_minutes(5))
                THEN true
                ELSE false
            END AS is_valid
        FROM trips_subject_to_pno t
        LEFT JOIN rtps r
        ON r.cfr = t.cfr AND r.trip_number = t.trip_number
        LEFT JOIN logbook_pnos lp
        ON lp.cfr = t.cfr AND lp.trip_number = t.trip_number
        ASOF LEFT JOIN manual_pnos mp
        ON mp.cfr = t.cfr AND mp.report_datetime_utc < r.return_datetime
        ORDER BY t.trip_number
    """
    ).to_df()
    return trips


@task
def compute_pno_mr_trips_per_vessel(
    evaluated_trips_pnos: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    total_trips = duckdb.sql(
        """
        SELECT
            cfr,
            COUNT(*) AS total_trips
        FROM evaluated_trips_pnos
        GROUP BY cfr
        ORDER BY cfr
    """
    ).to_df()

    compliant_trips = duckdb.sql(
        """
        SELECT
            cfr,
            COUNT(*) AS compliant_trips
        FROM evaluated_trips_pnos
        WHERE is_valid
        GROUP BY cfr
        ORDER BY cfr
    """
    ).to_df()

    return (total_trips, compliant_trips)


@task
def extract_occurrences(
    risk_element: RiskElement, from_datetime_utc: datetime
) -> pd.DataFrame:
    queries = {
        RiskElement.CLA_CM: (
            "monitorfish_remote",
            "monitorfish/fishing_in_closed_areas.sql",
        ),
        RiskElement.VMS_MR: (
            "monitorfish_remote",
            "monitorfish/targeted_malfunctions.sql",
        ),
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
def compute_occurrences_vessels_risk_elements(
    vessels: pd.DataFrame, occurrences: pd.DataFrame, risk_element: RiskElement
):
    res = duckdb.sql(
        """
        SELECT
            v.cfr,
            COALESCE(o.occurrences, 0) AS occurrences
        FROM vessels v
        LEFT JOIN occurrences o
        ON v.cfr = o.cfr
    """
    ).to_df()

    res["metrics"] = df_to_dict_series(
        res[["occurrences"]],
        result_colname="metrics",
    )

    # 0 reportings = 1, 1 reporting = 2, 2 or 3 reportings = 3, 4+ reportings = 4
    risk_thresholds = [-0.1, 0.5, 1.5, 3.5, 1000000]
    res["risk_level"] = pd.cut(res.occurrences, risk_thresholds, labels=False) + 1

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
    trips_subject_to_pno = extract_trips_subject_to_pno(
        from_datetime_utc=from_datetime_utc
    )
    rtps = extract_rtps(from_datetime_utc=from_datetime_utc)
    manual_pnos = extract_manual_pnos(from_datetime_utc=from_datetime_utc)
    logbook_pnos = extract_logbook_pnos(from_datetime_utc=from_datetime_utc)

    mot_mr_compliant_trips = extract_compliant_trips(
        RiskElement.MOT_MR, from_datetime_utc=from_datetime_utc
    )
    cla_cm_occurrences = extract_occurrences(
        RiskElement.CLA_CM, from_datetime_utc=from_datetime_utc
    )
    targeted_vms_malfunction_occurrences = extract_occurrences(
        RiskElement.VMS_MR, from_datetime_utc=from_datetime_utc
    )

    # Transform
    mot_mr_vessels_risk_elements = compute_vessels_risk_elements(
        total_trips, mot_mr_compliant_trips, RiskElement.MOT_MR
    )
    cla_cm_vessels_risk_elements = compute_occurrences_vessels_risk_elements(
        vms_vessels, cla_cm_occurrences, RiskElement.CLA_CM
    )
    vms_mr_vessels_risk_elements = compute_occurrences_vessels_risk_elements(
        vms_vessels, targeted_vms_malfunction_occurrences, RiskElement.VMS_MR
    )
    evaluated_trips_pno = evaluate_trips_pnos(
        trips_subject_to_pno, rtps, manual_pnos, logbook_pnos
    )

    pno_total_trips, pno_mr_compliant_trips = compute_pno_mr_trips_per_vessel(
        evaluated_trips_pno
    )
    pno_mr_risk_elements = compute_vessels_risk_elements(
        pno_total_trips, pno_mr_compliant_trips, RiskElement.PNO_MR
    )

    # Load
    load_vessels_risk_elements(mot_mr_vessels_risk_elements)
    load_vessels_risk_elements(cla_cm_vessels_risk_elements)
    load_vessels_risk_elements(vms_mr_vessels_risk_elements)
    load_vessels_risk_elements(pno_mr_risk_elements)
