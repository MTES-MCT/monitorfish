from datetime import datetime
from typing import List

import pandas as pd
from prefect import flow, task
from prefect.deployments import run_deployment

from src.entities.alerts import PositionAlertSpecification
from src.flows.position_alert import position_alert_flow
from src.generic_tasks import extract
from src.helpers.alerts import position_alert_specification_must_run_now
from src.shared_tasks.dates import get_utcnow


@task
def extract_position_alerts() -> pd.DataFrame:
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/position_alerts.sql",
    )


@task
def to_position_alert_specifications(
    position_alerts: pd.DataFrame,
) -> List[PositionAlertSpecification]:
    return [
        PositionAlertSpecification(**position_alert)
        for position_alert in position_alerts.to_dict(orient="records")
    ]


@task
def get_alerts_that_must_run_now(
    alert_specifications: List[PositionAlertSpecification],
    now: datetime,
) -> List[PositionAlertSpecification]:
    return [
        a
        for a in alert_specifications
        if position_alert_specification_must_run_now(alert_spec=a, now=now)
    ]


@flow(name="Monitorfish - Position alerts")
def position_alerts_flow():
    positions_alerts = extract_position_alerts()
    now = get_utcnow()

    position_alert_specifications = to_position_alert_specifications(positions_alerts)
    position_alert_specifications_to_run = get_alerts_that_must_run_now(
        alert_specifications=position_alert_specifications, now=now
    )

    for position_alert_specification in position_alert_specifications_to_run:
        run_deployment(
            name=f"{position_alert_flow.name}/{position_alert_flow.name}",
            parameters=dict(
                position_alert_id=position_alert_specification.id,
                name=position_alert_specification.name,
                description=position_alert_specification.description,
                natinf_code=position_alert_specification.natinf_code,
                track_analysis_depth=position_alert_specification.track_analysis_depth,
                only_fishing_positions=position_alert_specification.only_fishing_positions,
                gears=position_alert_specification.gears,
                species=position_alert_specification.species,
                species_catch_areas=position_alert_specification.species_catch_areas,
                administrative_areas=position_alert_specification.administrative_areas,
                regulatory_areas=position_alert_specification.regulatory_areas,
                min_depth=position_alert_specification.min_depth,
                flag_states_iso2=position_alert_specification.flag_states_iso2,
                vessel_ids=position_alert_specification.vessel_ids,
                district_codes=position_alert_specification.district_codes,
                producer_organizations=position_alert_specification.producer_organizations,
            ),
            timeout=0,
        )
