from logging import Logger
from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task, unmapped
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract
from src.pipeline.helpers.dates import Period
from src.pipeline.processing import prepare_df_for_loading
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.dates import make_periods
from src.pipeline.shared_tasks.segments import extract_all_segments
from src.pipeline.utils import psql_insert_copy


@task(checkpoint=False)
def extract_pno_types() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote", query_filepath="monitorfish/pno_types.sql"
    )


@task(checkpoint=False)
def reset_pnos(period: Period):
    """
    Deletes enriched data from pnos in logbook table in the designated Period.
    """

    logger = prefect.context.get("logger")
    e = create_engine("monitorfish_remote")

    logger.info(f"Resetting pnos for period {period.start} - {period.end}.")

    with e.begin() as connection:
        connection.execute(
            text(
                "UPDATE public.logbook_reports p "
                "SET "
                "    enriched = false,"
                "    trip_gears = NULL,"
                "    pno_types = NULL,"
                "    trip_segments = NULL"
                "WHERE p.date_time >= :start "
                "AND p.date_time <= :end;"
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
    return Period(
        start=dates.loc[0, "min_trip_start_date"].to_pydatetime(),
        end=dates.loc[0, "max_predicted_arrival_datetime_utc"].to_pydatetime(),
    )


def extract_pno_species_and_gears(
    pno_emission_period: Period, trips_period: Period
) -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/pno_species_and_gears.sql",
        params={
            "min_pno_date": pno_emission_period.start,
            "max_pno_date": pno_emission_period.end,
            "min_trip_date": trips_period.start,
            "max_trip_date": trips_period.end,
        },
    )


def compute_pno_segments(
    pno_species_and_gears: pd.DataFrame, segments: pd.DataFrame
) -> pd.DataFrame:
    pass


def compute_pno_types(
    pno_species_and_gears: pd.DataFrame, pno_types: pd.DataFrame
) -> pd.DataFrame:
    breakpoint()


def load_enriched_pnos(enriched_pnos: pd.DataFrame, period: Period, logger: Logger):
    e = create_engine("monitorfish_remote")

    with e.begin() as connection:
        logger.info("Creating temporary table")
        connection.execute(
            text(
                "CREATE TEMP TABLE tmp_enriched_pnos("
                "    id INTEGER PRIMARY KEY,"
                "    is_at_port BOOLEAN,"
                "    meters_from_previous_position REAL,"
                "    time_since_previous_position INTERVAL,"
                "    average_speed REAL,"
                "    is_fishing BOOLEAN,"
                "    time_emitting_at_sea INTERVAL"
                ")"
                "ON COMMIT DROP;"
            )
        )

        enriched_pnos = prepare_df_for_loading(
            enriched_pnos,
            logger,
        )

        columns_to_load = [
            "id",
            "is_at_port",
            "meters_from_previous_position",
            "time_since_previous_position",
            "average_speed",
            "is_fishing",
            "time_emitting_at_sea",
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
                "UPDATE public.logbook p "
                "SET "
                "    is_at_port = ep.is_at_port, "
                "    meters_from_previous_position = COALESCE( "
                "        ep.meters_from_previous_position, "
                "        p.meters_from_previous_position "
                "    ), "
                "    time_since_previous_position = COALESCE( "
                "        ep.time_since_previous_position, "
                "        p.time_since_previous_position "
                "    ), "
                "    average_speed = COALESCE( "
                "        ep.average_speed, "
                "        p.average_speed "
                "    ), "
                "    is_fishing = COALESCE( "
                "        ep.is_fishing, "
                "        p.is_fishing "
                "    ),"
                "    time_emitting_at_sea = COALESCE( "
                "        ep.time_emitting_at_sea, "
                "        p.time_emitting_at_sea "
                "    )"
                "FROM tmp_enriched_pnos ep "
                "WHERE p.id = ep.id "
                "AND p.date_time >= :start "
                "AND p.date_time <= :end;"
            ),
            {
                "start": period.start,
                "end": period.end,
            },
        )


@task(checkpoint=False)
def extract_enrich_load_logbook(
    period: Period, segments: pd.DataFrame, pno_types: pd.DataFrame
):
    """Extract pnos for the given `Period`, enrich and update the `logbook` table.

    This is all done in one `Task` in order to avoid having tasks returning anything.
    Indeed Prefect stores all task results in memory until the flow run is done
    running, which in this case must be avoided in order to benefit from the chunked
    processing logic in terms of memory consumption.
    """

    logger = prefect.context.get("logger")
    logger.info(f"Processing pnos for period {period.start} - {period.end}.")

    trips_period = extract_pno_trips_period()

    logger.info("Extracting PNO...")
    pnos_species_and_gears = extract_pno_species_and_gears(
        pno_emission_period=period, trips_period=trips_period
    )
    logger.info(
        f"Extracted {len(pnos_species_and_gears)} PNO species from {pnos_species_and_gears.id.nunique()} PNOs."
    )

    logger.info("Computing PNO segments...")
    pnos = compute_pno_segments(
        pno_species_and_gears=pnos_species_and_gears, segments=segments
    )

    logger.info("Loading")
    load_enriched_pnos(pnos, period, logger)


with Flow("Enrich Logbook") as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        start_hours_ago = Parameter("start_hours_ago")
        end_hours_ago = Parameter("end_hours_ago")
        minutes_per_chunk = Parameter("minutes_per_chunk")
        recompute_all = Parameter("recompute_all")

        periods = make_periods(
            start_hours_ago,
            end_hours_ago,
            minutes_per_chunk,
            0,
        )

        segments = extract_all_segments()
        pno_types = extract_pno_types()

        with case(recompute_all, True):
            reset = reset_pnos.map(periods)
            extract_enrich_load_logbook.map(
                periods,
                segments=unmapped(segments),
                pno_types=unmapped(pno_types),
                upstream_tasks=[reset],
            )

        with case(recompute_all, False):
            extract_enrich_load_logbook.map(
                periods,
                segments=unmapped(segments),
                pno_types=unmapped(pno_types),
            )

flow.file_name = Path(__file__).name
