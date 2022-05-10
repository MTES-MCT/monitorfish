from datetime import datetime, timedelta
from pathlib import Path
from typing import Tuple

import pandas as pd
from geoalchemy2.functions import ST_Intersects
from prefect import Flow, Parameter, task
from sqlalchemy import Table, and_, not_, select
from sqlalchemy.sql import Select

from src.pipeline.generic_tasks import extract
from src.pipeline.processing import df_to_dict_series, join_on_multiple_keys
from src.pipeline.shared_tasks.alerts import load_alerts
from src.pipeline.shared_tasks.infrastructure import get_table
from src.pipeline.shared_tasks.positions import add_vessel_identifier
from src.pipeline.shared_tasks.risk_factors import extract_current_risk_factors
from src.read_query import read_query


@task(checkpoint=False)
def get_dates() -> Tuple[datetime, datetime, datetime]:
    utcnow = datetime.utcnow()
    today_at_zero_hours = utcnow.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_at_zero_hours = today_at_zero_hours - timedelta(days=1)

    return yesterday_at_zero_hours, today_at_zero_hours, utcnow


@task(checkpoint=False)
def make_vessels_at_sea_query(
    positions_table: Table,
    facade_areas_table: Table,
    from_date: datetime,
    to_date: datetime,
    states_to_monitor_iso2: list = None,
    vessels_table: Table = None,
    minimum_length: float = None,
    eez_areas_table: Table = None,
    eez_to_monitor_iso3: list = None,
) -> Select:

    from_table = positions_table.join(
        facade_areas_table,
        ST_Intersects(positions_table.c.geometry, facade_areas_table.c.geometry),
        isouter=True,
    )

    if minimum_length:
        try:
            assert isinstance(vessels_table, Table)
        except AssertionError:
            raise ValueError(
                (
                    "The vessels_table must be provided when "
                    "filtering on a minimum_length"
                )
            )

        from_table = from_table.join(
            vessels_table,
            positions_table.c.internal_reference_number == vessels_table.c.cfr,
        )

    if eez_to_monitor_iso3:
        try:
            assert isinstance(eez_areas_table, Table)
        except AssertionError:
            raise ValueError(
                ("The eez_table must be provided when " "filtering on a eez_to_monitor")
            )

        from_table = from_table.join(
            eez_areas_table,
            ST_Intersects(positions_table.c.geometry, eez_areas_table.c.wkb_geometry),
        )

    q = (
        select(
            [
                positions_table.c.internal_reference_number.label("cfr"),
                positions_table.c.external_reference_number.label(
                    "external_immatriculation"
                ),
                positions_table.c.ircs,
                positions_table.c.vessel_name,
                positions_table.c.flag_state,
                facade_areas_table.c.facade,
            ]
        )
        .distinct()
        .select_from(from_table)
        .where(
            and_(
                positions_table.c.date_time >= from_date,
                positions_table.c.date_time < to_date,
                positions_table.c.internal_reference_number.isnot(None),
                not_(positions_table.c.is_at_port),
            )
        )
    )

    if states_to_monitor_iso2:
        q = q.where(positions_table.c.flag_state.in_(states_to_monitor_iso2))

    if minimum_length:
        q = q.where(vessels_table.c.length >= minimum_length)

    if eez_to_monitor_iso3:
        q = q.where(eez_areas_table.c.iso_sov1.in_(eez_to_monitor_iso3))

    return q


@task(checkpoint=False)
def extract_vessels_at_sea(query: Select) -> pd.DataFrame:

    return read_query(
        "monitorfish_remote",
        query,
    )


@task(checkpoint=False)
def extract_vessels_that_emitted_fars(
    declaration_min_datetime_utc: datetime,
    declaration_max_datetime_utc: datetime,
    fishing_operation_min_datetime_utc: datetime,
    fishing_operation_max_datetime_utc: datetime,
) -> set:

    vessels_that_emitted_fars = extract(
        "monitorfish_remote",
        "monitorfish/vessels_that_emitted_fars.sql",
        params={
            "declaration_min_datetime_utc": declaration_min_datetime_utc,
            "declaration_max_datetime_utc": declaration_max_datetime_utc,
            "fishing_operation_min_datetime_utc": fishing_operation_min_datetime_utc,
            "fishing_operation_max_datetime_utc": fishing_operation_max_datetime_utc,
        },
    )

    return set(vessels_that_emitted_fars.cfr)


@task(checkpoint=False)
def concat(
    vessels_at_sea_yesterday_everywhere: pd.DataFrame,
    vessels_at_sea_yesterday_in_french_eez: pd.DataFrame,
) -> pd.DataFrame:
    return pd.concat(
        [
            vessels_at_sea_yesterday_everywhere,
            vessels_at_sea_yesterday_in_french_eez,
        ],
        ignore_index=True,
    )


@task(checkpoint=False)
def get_vessels_with_missing_fars(
    vessels_at_sea: pd.DataFrame, vessels_that_emitted_fars: pd.DataFrame
) -> pd.DataFrame:
    return vessels_at_sea.loc[
        ~vessels_at_sea.cfr.isin(vessels_that_emitted_fars)
    ].reset_index(drop=True)


@task(checkpoint=False)
def merge_risk_factor(
    vessels_with_missing_fars: pd.DataFrame, current_risk_factors: pd.DataFrame
) -> pd.DataFrame:
    return join_on_multiple_keys(
        vessels_with_missing_fars,
        current_risk_factors,
        how="left",
        on=["cfr", "external_immatriculation", "ircs"],
    )


@task(checkpoint=False)
def make_alerts(
    vessels_with_missing_fars: pd.DataFrame,
    alert_type: str,
    alert_config_name: str,
    creation_date: datetime,
) -> pd.DataFrame:
    alerts = vessels_with_missing_fars.copy(deep=True)
    alerts = alerts.rename(
        columns={
            "cfr": "internal_reference_number",
            "external_immatriculation": "external_reference_number",
        }
    )

    alerts["creation_date"] = creation_date

    alerts["type"] = alert_type
    alerts["value"] = df_to_dict_series(
        alerts.rename(
            columns={
                "facade": "seaFront",
                "flag_state": "flagState",
                "risk_factor": "riskFactor",
            }
        )[["seaFront", "flagState", "type", "riskFactor"]]
    )

    alerts["alert_config_name"] = alert_config_name

    return alerts[
        [
            "vessel_name",
            "internal_reference_number",
            "external_reference_number",
            "ircs",
            "vessel_identifier",
            "creation_date",
            "value",
            "alert_config_name",
        ]
    ]


with Flow("Missing FAR alerts") as flow:

    # Parameters
    alert_type = Parameter("alert_type")
    alert_config_name = Parameter("alert_config_name")
    states_iso2_to_monitor_everywhere = Parameter("states_iso2_to_monitor_everywhere")
    states_iso2_to_monitor_in_french_eez = Parameter(
        "states_iso2_to_monitor_in_french_eez"
    )
    minimum_length = Parameter("minimum_length")

    # Infras
    positions_table = get_table("positions")
    facade_areas_table = get_table("facade_areas_subdivided")
    eez_areas_table = get_table("eez_areas")
    vessels_table = get_table("vessels")

    # Extract
    yesterday_at_zero_hours, today_at_zero_hours, utcnow = get_dates()

    vessels_at_sea_yesterday_everywhere_query = make_vessels_at_sea_query(
        positions_table=positions_table,
        facade_areas_table=facade_areas_table,
        from_date=yesterday_at_zero_hours,
        to_date=today_at_zero_hours,
        states_to_monitor_iso2=states_iso2_to_monitor_everywhere,
        vessels_table=vessels_table,
        minimum_length=minimum_length,
    )

    vessels_at_sea_yesterday_in_french_eez_query = make_vessels_at_sea_query(
        positions_table=positions_table,
        facade_areas_table=facade_areas_table,
        from_date=yesterday_at_zero_hours,
        to_date=today_at_zero_hours,
        states_to_monitor_iso2=states_iso2_to_monitor_in_french_eez,
        vessels_table=vessels_table,
        minimum_length=minimum_length,
        eez_areas_table=eez_areas_table,
        eez_to_monitor_iso3=["FRA"],
    )

    vessels_at_sea_yesterday_in_french_eez = extract_vessels_at_sea(
        vessels_at_sea_yesterday_in_french_eez_query
    )
    vessels_at_sea_yesterday_everywhere = extract_vessels_at_sea(
        vessels_at_sea_yesterday_everywhere_query
    )

    vessels_that_emitted_fars = extract_vessels_that_emitted_fars(
        declaration_min_datetime_utc=yesterday_at_zero_hours,
        declaration_max_datetime_utc=utcnow,
        fishing_operation_min_datetime_utc=yesterday_at_zero_hours,
        fishing_operation_max_datetime_utc=today_at_zero_hours,
    )

    current_risk_factors = extract_current_risk_factors()

    # Transform
    vessels_at_sea = concat(
        vessels_at_sea_yesterday_everywhere, vessels_at_sea_yesterday_in_french_eez
    )

    vessels_with_missing_fars = get_vessels_with_missing_fars(
        vessels_at_sea, vessels_that_emitted_fars
    )

    vessels_with_missing_fars = add_vessel_identifier(vessels_with_missing_fars)

    vessels_with_missing_fars = merge_risk_factor(
        vessels_with_missing_fars, current_risk_factors
    )

    alerts = make_alerts(
        vessels_with_missing_fars=vessels_with_missing_fars,
        alert_type=alert_type,
        alert_config_name=alert_config_name,
        creation_date=utcnow,
    )

    # Load
    load_alerts(alerts, alert_config_name=alert_config_name)

flow.file_name = Path(__file__).name
