from datetime import datetime

import duckdb
import pandas as pd
from prefect import flow, get_run_logger, task

from src.entities.risk_elements import RiskElement
from src.generic_tasks import extract, load
from src.processing import df_to_dict_series
from src.sentry import report_flow_failure_to_sentry
from src.shared_tasks.dates import date_trunc, get_utcnow, make_relativedelta


@task
def extract_trips(from_datetime_utc: datetime) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/trips.sql",
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
            END AS is_compliant
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
def evaluate_trips_margin_of_tolerance(
    trips: pd.DataFrame, compliant_trips: pd.DataFrame
) -> pd.DataFrame:
    return duckdb.sql(
        """
        SELECT
            t.cfr,
            t.trip_number,
            ct.trip_number IS NOT NULL AS is_compliant
        FROM trips t
        LEFT JOIN compliant_trips ct
        ON ct.cfr = t.cfr AND ct.trip_number::VARCHAR = t.trip_number
        ORDER BY t.cfr, t.trip_number
    """
    ).to_df()


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
    ids_columns = {
        RiskElement.CLA_CM: "reporting_ids",
        RiskElement.VMS_MR: "beacon_malfunction_ids",
    }
    ids_column = ids_columns[risk_element]

    res = vessels[["cfr"]].merge(occurrences, on="cfr", how="left")
    res["occurrences"] = res.occurrences.fillna(0).astype(int)
    res[ids_column] = res[ids_column].apply(
        lambda ids: ids if isinstance(ids, list) else []
    )

    res["metrics"] = df_to_dict_series(
        res[["occurrences", ids_column]].rename(
            columns={
                "reporting_ids": "reportingIds",
                "beacon_malfunction_ids": "beaconMalfunctionIds",
            }
        ),
        result_colname="metrics",
    )

    # 0 reportings = 1, 1 reporting = 2, 2 or 3 reportings = 3, 4+ reportings = 4
    risk_thresholds = [-0.1, 0.5, 1.5, 3.5, 1000000]
    res["risk_level"] = pd.cut(res.occurrences, risk_thresholds, labels=False) + 1

    res["risk_element_code"] = risk_element.value

    return res[["risk_element_code", "cfr", "metrics", "risk_level"]]


@task
def compute_vessels_risk_elements(
    evaluated_trips: pd.DataFrame, trips: pd.DataFrame, risk_element: RiskElement
):
    res = duckdb.sql(
        """
        WITH evaluated_trips_with_dates AS (
            SELECT
                et.cfr,
                et.trip_number::VARCHAR AS trip_number,
                et.is_compliant,
                t.start_datetime_utc,
                t.end_datetime_utc
            FROM evaluated_trips et
            LEFT JOIN trips t
            ON t.cfr = et.cfr AND t.trip_number = et.trip_number::VARCHAR
        )

        SELECT
            cfr,
            COUNT(*) AS total_trips,
            COUNT(*) FILTER (WHERE is_compliant) AS compliant_trips,
            COUNT(*) FILTER (WHERE NOT is_compliant) / COUNT(*) AS share_of_non_compliant_trips,
            COALESCE(
                LIST(
                    {
                        'tripNumber': trip_number,
                        'startDateTimeUtc': strftime(start_datetime_utc, '%Y-%m-%dT%H:%M:%SZ'),
                        'endDateTimeUtc': strftime(end_datetime_utc, '%Y-%m-%dT%H:%M:%SZ')
                    }
                    ORDER BY end_datetime_utc DESC NULLS LAST, trip_number DESC
                ) FILTER (WHERE NOT is_compliant),
                []
            ) AS non_compliant_trips
        FROM evaluated_trips_with_dates
        GROUP BY cfr
        ORDER BY cfr
    """
    ).to_df()

    res["metrics"] = df_to_dict_series(
        res[
            [
                "total_trips",
                "compliant_trips",
                "share_of_non_compliant_trips",
                "non_compliant_trips",
            ]
        ].rename(
            columns={
                "total_trips": "totalTrips",
                "compliant_trips": "compliantTrips",
                "share_of_non_compliant_trips": "shareOfNonCompliantTrips",
                "non_compliant_trips": "nonCompliantTrips",
            }
        ),
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


@flow(
    name="Monitorfish - Risk elements",
    on_failure=[report_flow_failure_to_sentry],
    on_crashed=[report_flow_failure_to_sentry],
)
def risk_elements_flow():
    # Extract
    now = get_utcnow()
    today = date_trunc(now, "DAY")
    from_datetime_utc = today - make_relativedelta(years=1)

    trips = extract_trips(from_datetime_utc=from_datetime_utc)
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
    mot_mr_evaluated_trips = evaluate_trips_margin_of_tolerance(
        trips, mot_mr_compliant_trips
    )
    mot_mr_vessels_risk_elements = compute_vessels_risk_elements(
        mot_mr_evaluated_trips, trips, RiskElement.MOT_MR
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
    pno_mr_risk_elements = compute_vessels_risk_elements(
        evaluated_trips_pno, trips, RiskElement.PNO_MR
    )

    # Load
    load_vessels_risk_elements(mot_mr_vessels_risk_elements)
    load_vessels_risk_elements(cla_cm_vessels_risk_elements)
    load_vessels_risk_elements(vms_mr_vessels_risk_elements)
    load_vessels_risk_elements(pno_mr_risk_elements)
