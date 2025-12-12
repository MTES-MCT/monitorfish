from datetime import datetime
from logging import Logger

import duckdb
import pandas as pd
from prefect import flow, get_run_logger, task, unmapped
from sqlalchemy import text

from config import (
    FLAG_STATES_WITHOUT_SYSTEMATIC_VERIFICATION,
    RISK_FACTOR_VERIFICATION_THRESHOLD,
    default_risk_factors,
    risk_factor_coefficients,
)
from src.db_config import create_engine
from src.generic_tasks import extract
from src.helpers.dates import Period
from src.helpers.segments import allocate_segments_to_catches
from src.processing import prepare_df_for_loading
from src.shared_tasks.dates import get_utcnow, make_periods
from src.shared_tasks.pnos import (
    extract_pno_units_ports_and_segments_subscriptions,
    extract_pno_units_targeting_vessels,
)
from src.shared_tasks.segments import extract_all_segments
from src.utils import psql_insert_copy


@task
def extract_pno_types() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/pno_types.sql"
    )


@task
def extract_control_anteriority() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/control_anteriority_for_pnos.sql",
    )


@task
def extract_vessels_with_active_reportings() -> set:
    vessels_with_active_reportings = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/vessels_with_active_reportings_for_pnos.sql",
    )

    return set(vessels_with_active_reportings.internal_reference_number)


@task
def reset_pnos(period: Period):
    """
    Deletes enriched data from pnos in logbook table in the designated Period.

    Distribution attributes (`isInVerificationScope`, `IsVerified`, `IsSent`,
    `IsBeingSent`) are not reset.
    """

    logger = get_run_logger()
    e = create_engine("monitorfish_remote")

    logger.info(f"Resetting pnos for period {period.start} - {period.end}.")

    with e.begin() as connection:
        connection.execute(
            text(
                "UPDATE public.logbook_reports p "
                "SET "
                "    enriched = false,"
                "    trip_gears = NULL,"
                "    value = value - 'pnoTypes' - 'riskFactor',"
                "    trip_segments = NULL "
                "WHERE p.operation_datetime_utc >= :start "
                "AND p.operation_datetime_utc <= :end "
                "AND log_type = 'PNO';"
            ),
            {
                "start": period.start,
                "end": period.end,
            },
        )


def extract_pno_trips_period(period: Period) -> Period:
    """
    Extracts the earliest `tripStartDate` and the latest `predictedArrivalDatetimeUtc`
    from all PNOs emitted during the given `Period`.

    Args:
        period (Period): `Period` of reception of PNOs

    Returns:
        Period: `Period` with `start` = `min_trip_start_date` and
          `end` = `max_predicted_arrival_datetime_utc`
    """
    dates = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/trip_dates_of_pnos.sql",
        params={
            "pno_emission_start_datetime_utc": period.start,
            "pno_emission_end_datetime_utc": period.end,
        },
    )

    assert len(dates) == 1
    dates = dates.iloc[0].to_dict()

    min_trip_start_date = dates["min_trip_start_date"]
    max_predicted_arrival_datetime_utc = dates["max_predicted_arrival_datetime_utc"]

    if min_trip_start_date and max_predicted_arrival_datetime_utc:
        return Period(
            start=min_trip_start_date.to_pydatetime(),
            end=max_predicted_arrival_datetime_utc.to_pydatetime(),
        )
    else:
        return None


def extract_pno_catches(
    pno_emission_period: Period, trips_period: Period
) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pno_catches.sql",
        params={
            "min_pno_date": pno_emission_period.start,
            "max_pno_date": pno_emission_period.end,
            "min_trip_date": trips_period.start,
            "max_trip_date": trips_period.end,
        },
    )


def compute_pno_segments(
    pno_catches: pd.DataFrame, segments: pd.DataFrame
) -> pd.DataFrame:
    """
    Computes the segments of the input PNO species and gears.

    Args:
        pno_catches (pd.DataFrame): DataFrame of PNO species. 1 line = catch.
          Must have columns :

          - logbook_reports_pno_id `int` `1`
          - trip_gears `List[dict]`
            `[{"gear": "xxx", "mesh": yyy, "dimensions": "zzz}, {...}]`
          - species `str` `'COD'`
          - fao_area `str` `'27.7.d'`
          - year `int` `2022`
          - facade `str` `'MED'`
          - weight `float` `230.2`
          - vessel_type `str` `Fishing vessel`
          - scip_species_type `str` `DEMERSAL`

        segments (pd.DataFrame): DataFrame of segments definitions. 1 line = 1 segment.
          Must have columns :

          - year `int` `2022`
          - segment `str` `SWW1`
          - segment_name `str` `Nom du segment`
          - gears `List[str]` `["OTB", ...]`
          - fao_areas `List[str]` `["27.8", ...]`
          - target_species `List[str]` `["COD", ...]`
          - impact_risk_factor `float` `2.8`
          - min_mesh `float` `80.0`
          - max_mesh `float` `120.0`
          - min_share_of_target_species `float` `0.2`
          - main_scip_species_type `str` `DEMERSAL`
          - vessel_types `List[str]` `['Fishing vessel', 'Trawler']`
          - priority `float` `1.0`

    Returns:
        pd.DataFrame: DataFrame of PNOs with attributed PNO types. 1 line = 1 PNO.
          Has columns:

            - logbook_reports_pno_id `int` `1`
            - trip_gears `List[dict]`
              `[{"gear": "xxx", "mesh": yyy, "dimensions": "zzz}, {...}]`
            - pno_types `List[dict]`
              ```[
                    {
                        "pno_type_name": "Type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True
                    },
                    {...}
                ]```
            - impact_risk_factor `float` `2.8`
    """
    unnested_gears_catches = pno_catches.explode("trip_gears")
    unnested_gears_catches["catch_id"] = range(len(unnested_gears_catches))
    unnested_gears_catches["gear"] = unnested_gears_catches.trip_gears.map(
        lambda d: d.get("gear", None), na_action="ignore"
    ).astype(
        str
    )  # Necessary for case where there are only NULL values
    unnested_gears_catches["mesh"] = unnested_gears_catches.trip_gears.map(
        lambda d: d.get("mesh", None), na_action="ignore"
    )

    segmented_catches = allocate_segments_to_catches(  # noqa: F841
        catches=unnested_gears_catches,
        segments=segments,
        batch_id_column="logbook_reports_pno_id",
        catch_id_column="catch_id",
    )

    query = """
        SELECT
            sc.logbook_reports_pno_id,
            LIST_SORT(
                ARRAY_AGG(
                    DISTINCT {
                        'segment': sc.segment,
                        'segmentName': sc.segment_name
                    }
                ) FILTER (WHERE sc.segment IS NOT NULL)
            ) AS trip_segments,
            MAX(sc.impact_risk_factor) AS impact_risk_factor
        FROM segmented_catches sc
        GROUP BY 1
        ORDER BY 1
    """

    res = duckdb.sql(query).to_df()

    res = res.fillna(
        {
            "impact_risk_factor": default_risk_factors["impact_risk_factor"],
        }
    )

    return res


def compute_pno_types(
    pno_catches: pd.DataFrame, pno_types: pd.DataFrame
) -> pd.DataFrame:
    """
    Computes the PNO types of the input PNO species and gears.

    Args:
        pno_catches (pd.DataFrame): DataFrame of PNO species. 1 line = catch.
          Must have columns :

          - logbook_reports_pno_id `int` `1`
          - cfr `str` `FRA000000000`
          - `predicted_arrival_datetime_utc` `datetime`
          - year `int` `2023`
          - species `str` `'COD'`
          - trip_gears `List[dict]`
            `[{"gear": "xxx", "mesh": yyy, "dimensions": "zzz}, {...}]`
          - fao_area `str` `'27.7.d'`
          - weight `float` `150.5`
          - flag_state `str` `'FRA'`
          - locode `str` `CCXXX`

        pno_types (pd.DataFrame): DataFrame of pno_types definitions. 1 line = 1 rule.
          Must have columns :

          - pno_type_id `int` `1`
          - pno_type_name `str` `"Ports désignés thon rouge"`
          - minimum_notification_period `float` `4.0`
          - has_designated_ports `bool` `True`
          - pno_type_rule_id `int` `1`
          - species `List[str]` `["COD", ...]`
          - gears `List[str]` `["OTB", ...]`
          - fao_areas `List[str]` `["27.8", ...]`
          - flag_states `List[str]` `["GBR", ...]`
          - minimum_quantity_kg `float` `2500.0`

    Returns:
        pd.DataFrame: DataFrame of PNOs with attributed PNO types. 1 line = 1 PNO.
          Has columns:

            - logbook_reports_pno_id `int` `1`
            - cfr `str` `FRA000000000`
            - locode `str` `CCXXX`
            - `predicted_arrival_datetime_utc` `datetime`
            - trip_gears `List[dict]`
              `[{"gear": "xxx", "mesh": yyy, "dimensions": "zzz}, {...}]`
            - pno_types `List[dict]`
              ```[
                    {
                        "pnoTypeName": "Type 1",
                        "minimumNotificationPeriod": 4.0,
                        "hasDesignatedPorts": True
                    },
                    {...}
                ]```
    """
    trip_gear_codes = (  # noqa: F841
        pno_catches[["logbook_reports_pno_id", "trip_gears"]]
        .explode("trip_gears")
        .dropna()
        .assign(trip_gear_codes=lambda x: x.trip_gears.map(lambda d: d["gear"]))
        .groupby("logbook_reports_pno_id")[["trip_gear_codes"]]
        .agg({"trip_gear_codes": "unique"})
        .reset_index()
    )

    trips_info = pno_catches[
        [
            "logbook_reports_pno_id",
            "cfr",
            "locode",
            "flag_state",
            "predicted_arrival_datetime_utc",
        ]
    ].drop_duplicates()

    pnos_trip_gears = pno_catches.drop_duplicates(  # noqa: F841
        subset=["logbook_reports_pno_id"]
    )[["logbook_reports_pno_id", "trip_gears"]]

    db = duckdb.connect()

    pnos_pno_types = db.sql(
        """
        WITH pnos_pno_types_tmp AS (
            SELECT
                pc.logbook_reports_pno_id,
                t.pno_type_name,
                t.minimum_notification_period,
                t.has_designated_ports,
                t.minimum_quantity_kg,
                SUM(COALESCE(weight, 0)) OVER (PARTITION BY pc.logbook_reports_pno_id, pno_type_rule_id) AS pno_quantity_kg
            FROM pno_catches pc
            LEFT JOIN trip_gear_codes tgc
            ON tgc.logbook_reports_pno_id = pc.logbook_reports_pno_id
            JOIN pno_types t
            ON
                (pc.species = ANY(t.species) OR t.species = '[]'::VARCHAR[]) AND
                (list_has_any(tgc.trip_gear_codes, t.gears) OR t.gears = '[]'::VARCHAR[]) AND
                (length(filter(t.fao_areas, a -> pc.fao_area LIKE a || '%')) > 0 OR t.fao_areas = '[]'::VARCHAR[]) AND
                (pc.flag_state = ANY(t.flag_states) OR t.flag_states = '[]'::VARCHAR[])
        )

        SELECT
            logbook_reports_pno_id,
            LIST_SORT(ARRAY_AGG(DISTINCT {
                'pnoTypeName': pno_type_name,
                'minimumNotificationPeriod': minimum_notification_period,
                'hasDesignatedPorts': has_designated_ports
            })) AS pno_types
        FROM pnos_pno_types_tmp
        WHERE pno_quantity_kg >= minimum_quantity_kg
        GROUP BY logbook_reports_pno_id
    """
    ).to_df()

    res = pd.merge(
        trips_info,
        pd.merge(
            pnos_trip_gears,
            pnos_pno_types,
            how="left",
            on="logbook_reports_pno_id",
            validate="1:1",
        ).sort_values("logbook_reports_pno_id"),
        on="logbook_reports_pno_id",
        how="inner",
        validate="1:1",
    )

    return res


def merge_pnos_data(
    pnos_with_types: pd.DataFrame,
    pnos_with_segments: pd.DataFrame,
) -> pd.DataFrame:
    """
    Merges the input DataFrames on `logbook_reports_pno_id`

    Args:
        pnos_with_types (pd.DataFrame): DataFrame of PNOs with their types
        pnos_with_segments (pd.DataFrame): DataFrame of PNOs with their segments

    Returns:
        pd.DataFrame: DataFrame of PNOs with their types and segments
    """

    res = pd.merge(
        pnos_with_types,
        pnos_with_segments,
        on="logbook_reports_pno_id",
        validate="1:1",
        how="inner",
    )

    return res


def compute_pno_risk_factors(
    pnos: pd.DataFrame, control_anteriority: pd.DataFrame
) -> pd.DataFrame:
    res = pd.merge(
        pnos,
        control_anteriority,
        on="cfr",
        how="left",
        validate="m:1",
    )

    res = res.fillna({**default_risk_factors})

    res["probability_risk_factor"] = res["infraction_rate_risk_factor"]

    res["detectability_risk_factor"] = res["control_rate_risk_factor"]

    res["risk_factor"] = (
        (res["impact_risk_factor"] ** risk_factor_coefficients["impact"])
        * (res["probability_risk_factor"] ** risk_factor_coefficients["probability"])
        * (
            res["detectability_risk_factor"]
            ** risk_factor_coefficients["detectability"]
        )
    )

    res = res.drop(
        columns=[
            "infraction_rate_risk_factor",
            "impact_risk_factor",
            "probability_risk_factor",
            "detectability_risk_factor",
            "control_rate_risk_factor",
        ]
    )

    return res


def flag_pnos_to_verify_and_send(
    pnos: pd.DataFrame,
    pno_units_targeting_vessels: pd.DataFrame,
    pno_units_ports_and_segments_subscriptions: pd.DataFrame,
    predicted_arrival_threshold: datetime,
    vessels_with_active_reportings: set,
):
    pnos = pnos.copy(deep=True)

    pnos["is_in_verification_scope"] = (
        (pnos.risk_factor >= RISK_FACTOR_VERIFICATION_THRESHOLD)
        | (~pnos.flag_state.isin(FLAG_STATES_WITHOUT_SYSTEMATIC_VERIFICATION))
        | (pnos.cfr.isin(vessels_with_active_reportings))
    )

    pnos["is_verified"] = False
    pnos["is_sent"] = False

    segment_subscriptions = (
        pno_units_ports_and_segments_subscriptions.explode("unit_subscribed_segments")[
            ["port_locode", "unit_subscribed_segments"]
        ]
        .dropna()
        .reset_index(drop=True)
        .assign(is_target_segment=True)
    )

    target_ports = set(
        pno_units_ports_and_segments_subscriptions.loc[
            pno_units_ports_and_segments_subscriptions.receive_all_pnos_from_port,
            "port_locode",
        ].tolist()
    )

    target_vessels = set(pno_units_targeting_vessels["cfr"].dropna().tolist())

    pnos_with_segments = (
        pnos[["logbook_reports_pno_id", "locode", "trip_segments"]]
        .explode("trip_segments")
        .assign(
            trip_segment=lambda x: x.trip_segments.map(
                lambda d: d.get("segment"), na_action="ignore"
            )
        )
        .drop(columns=["trip_segments"])
        .reset_index(drop=True)
        .dropna()
    )

    if len(pnos_with_segments) > 0 and len(segment_subscriptions) > 0:
        segment_matches = pd.merge(
            pnos_with_segments,
            segment_subscriptions,
            how="left",
            left_on=["locode", "trip_segment"],
            right_on=["port_locode", "unit_subscribed_segments"],
        )
        logbook_reports_targeting_segment_ids = set(
            segment_matches.loc[
                segment_matches.is_target_segment.fillna(False),
                "logbook_reports_pno_id",
            ]
        )
    else:
        logbook_reports_targeting_segment_ids = set()

    if len(target_ports) > 0:
        logbook_reports_targeting_port_ids = set(
            pnos.loc[pnos.locode.isin(target_ports), "logbook_reports_pno_id"].tolist()
        )
    else:
        logbook_reports_targeting_port_ids = set()

    if len(target_vessels) > 0:
        logbook_reports_targeting_vessel_ids = set(
            pnos.loc[pnos.cfr.isin(target_vessels), "logbook_reports_pno_id"].tolist()
        )
    else:
        logbook_reports_targeting_vessel_ids = set()

    logbook_reports_to_sent_ids = logbook_reports_targeting_segment_ids.union(
        logbook_reports_targeting_port_ids
    ).union(logbook_reports_targeting_vessel_ids)

    pnos["is_being_sent"] = (
        (~pnos.is_in_verification_scope)
        * (pnos.predicted_arrival_datetime_utc >= predicted_arrival_threshold)
        * pnos.logbook_reports_pno_id.isin(logbook_reports_to_sent_ids)
    )

    return pnos


def load_enriched_pnos(enriched_pnos: pd.DataFrame, period: Period, logger: Logger):
    """Loads `enriched_pnos` data to `logbook_reports` table.

    If distribution attributes (`isInVerificationScope`, `IsVerified`, `IsSent`,
    `IsBeingSent`) are already present in the `value` field of the `logbook_reports`
    table, the values in the table are preserved and values from the DataFrame are
    ignored.

    Args:
        enriched_pnos (pd.DataFrame): Enriched PNOs data
        period (Period): Date range of PNOs
        logger (Logger): logger instance
    """
    e = create_engine("monitorfish_remote")

    with e.begin() as connection:
        logger.info("Creating temporary table")
        connection.execute(
            text(
                "CREATE TEMP TABLE tmp_enriched_pnos("
                "    logbook_reports_pno_id INTEGER PRIMARY KEY,"
                "    enriched BOOLEAN,"
                "    trip_gears JSONB,"
                "    pno_types JSONB,"
                "    trip_segments JSONB,"
                "    is_in_verification_scope BOOLEAN,"
                "    is_verified BOOLEAN,"
                "    is_sent BOOLEAN,"
                "    is_being_sent BOOLEAN, "
                "    risk_factor DOUBLE PRECISION "
                ")"
                "ON COMMIT DROP;"
            )
        )

        enriched_pnos = prepare_df_for_loading(
            enriched_pnos,
            logger,
            jsonb_columns=["trip_gears", "pno_types", "trip_segments"],
        )

        columns_to_load = [
            "logbook_reports_pno_id",
            "trip_gears",
            "pno_types",
            "trip_segments",
            "is_in_verification_scope",
            "is_verified",
            "is_sent",
            "is_being_sent",
            "risk_factor",
        ]

        logger.info("Loading to temporary table")

        enriched_pnos[columns_to_load].to_sql(
            "tmp_enriched_pnos",
            connection,
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )

        logger.info("Updating pnos from temporary table")
        connection.execute(
            text(
                "UPDATE public.logbook_reports r "
                "SET"
                "    enriched  = true,"
                "    trip_gears = CASE "
                "       WHEN ep.trip_gears = 'null' THEN '[]'::jsonb "
                "       ELSE ep.trip_gears END, "
                "    value = ("
                "       jsonb_build_object("
                "           'pnoTypes', CASE WHEN ep.pno_types = 'null' THEN '[]'::jsonb ELSE ep.pno_types END, "
                "           'isInVerificationScope', is_in_verification_scope, "
                "           'isVerified', is_verified, "
                "           'isSent', is_sent, "
                "           'isBeingSent', is_being_sent, "
                "           'riskFactor', risk_factor "
                "       ) || value"
                "   ), "
                "    trip_segments = CASE "
                "       WHEN ep.trip_segments = 'null' THEN '[]'::jsonb "
                "       ELSE ep.trip_segments END "
                "FROM tmp_enriched_pnos ep "
                "WHERE r.id = ep.logbook_reports_pno_id "
                "AND r.operation_datetime_utc >= :start "
                "AND r.operation_datetime_utc <= :end "
                "AND log_type = 'PNO';"
            ),
            {
                "start": period.start,
                "end": period.end,
            },
        )


@task
def extract_enrich_load_logbook(
    period: Period,
    segments: pd.DataFrame,
    pno_types: pd.DataFrame,
    control_anteriority: pd.DataFrame,
    pno_units_targeting_vessels: pd.DataFrame,
    pno_units_ports_and_segments_subscriptions: pd.DataFrame,
    utcnow: datetime,
    vessels_with_active_reportings: set,
):
    """Extract pnos for the given `Period`, enrich and update the `logbook` table.

    This is all done in one `Task` in order to avoid having tasks returning anything.
    Indeed Prefect stores all task results in memory until the flow run is done
    running, which in this case must be avoided in order to benefit from the chunked
    processing logic in terms of memory consumption.
    """

    logger = get_run_logger()
    logger.info(f"Processing pnos for period {period.start} - {period.end}.")

    trips_period = extract_pno_trips_period(period)
    if trips_period is None:
        logger.info("No PNO to enrich, skipping.")
        return

    logger.info("Extracting PNOs...")
    pnos_catches = extract_pno_catches(
        pno_emission_period=period, trips_period=trips_period
    )
    logger.info(
        f"Extracted {len(pnos_catches)} PNO catches from "
        f"{pnos_catches.logbook_reports_pno_id.nunique()} PNOs."
    )

    logger.info("Computing PNO segments...")
    pnos_with_segments = compute_pno_segments(
        pno_catches=pnos_catches, segments=segments
    )

    logger.info("Computing PNO types...")
    pnos_with_types = compute_pno_types(pno_catches=pnos_catches, pno_types=pno_types)

    logger.info("Merging PNO types and segments...")
    pnos = merge_pnos_data(pnos_with_types, pnos_with_segments)

    logger.info("Computing risk factors...")
    pnos_with_risk_factors = compute_pno_risk_factors(
        pnos=pnos, control_anteriority=control_anteriority
    )

    logger.info("Flagging PNOs to verify_and_distribute...")
    pnos = flag_pnos_to_verify_and_send(
        pnos=pnos_with_risk_factors,
        pno_units_targeting_vessels=pno_units_targeting_vessels,
        pno_units_ports_and_segments_subscriptions=pno_units_ports_and_segments_subscriptions,
        predicted_arrival_threshold=utcnow,
        vessels_with_active_reportings=vessels_with_active_reportings,
    )

    logger.info("Loading")
    load_enriched_pnos(pnos, period, logger)


@flow(name="Monitorfish - Enrich Logbook")
def enrich_logbook_flow(
    start_hours_ago: int,
    end_hours_ago: int,
    minutes_per_chunk: int,
    recompute_all: bool,
):
    utcnow = get_utcnow()
    periods = make_periods(
        start_hours_ago,
        end_hours_ago,
        minutes_per_chunk,
        0,
    )

    segments = extract_all_segments()
    pno_types = extract_pno_types()
    control_anteriority = extract_control_anteriority()
    pno_units_targeting_vessels = extract_pno_units_targeting_vessels()
    pno_units_ports_and_segments_subscriptions = (
        extract_pno_units_ports_and_segments_subscriptions()
    )
    vessels_with_active_reportings = extract_vessels_with_active_reportings()

    if recompute_all:
        reset_pnos.map(periods).wait()
        extract_enrich_load_logbook.map(
            periods,
            segments=unmapped(segments),
            pno_types=unmapped(pno_types),
            control_anteriority=unmapped(control_anteriority),
            pno_units_targeting_vessels=unmapped(pno_units_targeting_vessels),
            pno_units_ports_and_segments_subscriptions=unmapped(
                pno_units_ports_and_segments_subscriptions
            ),
            utcnow=unmapped(utcnow),
            vessels_with_active_reportings=unmapped(vessels_with_active_reportings),
        ).wait()
    else:
        extract_enrich_load_logbook.map(
            periods,
            segments=unmapped(segments),
            pno_types=unmapped(pno_types),
            control_anteriority=unmapped(control_anteriority),
            pno_units_targeting_vessels=unmapped(pno_units_targeting_vessels),
            pno_units_ports_and_segments_subscriptions=unmapped(
                pno_units_ports_and_segments_subscriptions
            ),
            utcnow=unmapped(utcnow),
            vessels_with_active_reportings=unmapped(vessels_with_active_reportings),
        ).wait()
