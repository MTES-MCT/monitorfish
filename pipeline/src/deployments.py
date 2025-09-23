from dataclasses import dataclass, field
from typing import List

from prefect import Flow
from prefect.client.schemas.objects import (
    ConcurrencyLimitConfig,
    ConcurrencyLimitStrategy,
)
from prefect.runner.storage import LocalStorage
from prefect.schedules import Schedule

from config import (
    ERS_FILES_LOCATION,
    HOST_ENV_FILE_LOCATION,
    IS_INTEGRATION,
    LOGBOOK_FILES_GID,
    MAX_FISHING_SPEED_THRESHOLD,
    MIN_FISHING_SPEED_THRESHOLD,
    MINIMUM_CONSECUTIVE_POSITIONS,
    MINIMUM_MINUTES_OF_EMISSION_AT_SEA,
    PNO_TEST_MODE,
    PREFECT_API_URL,
    TEST_MODE,
    WEEKLY_CONTROL_REPORT_EMAIL_TEST_MODE,
)
from src.flows.activity_visualizations import activity_visualizations_flow
from src.flows.admin_areas import admin_areas_flow
from src.flows.anchorages import anchorages_flow
from src.flows.beacons import beacons_flow
from src.flows.control_anteriority import control_anteriority_flow
from src.flows.control_units import control_units_flow
from src.flows.controls import controls_flow
from src.flows.controls_open_data import controls_open_data_flow
from src.flows.current_segments import current_segments_flow
from src.flows.distribute_pnos import distribute_pnos_flow
from src.flows.districts import districts_flow
from src.flows.email_actions_to_units import email_actions_to_units_flow
from src.flows.enrich_logbook import enrich_logbook_flow
from src.flows.enrich_positions import enrich_positions_flow
from src.flows.facade_areas import facade_areas_flow
from src.flows.fao_areas import fao_areas_flow
from src.flows.fishing_gear_codes import fishing_gear_codes_flow
from src.flows.foreign_fmcs import foreign_fmcs_flow
from src.flows.infractions import infractions_flow
from src.flows.init_pno_types import init_pno_types_flow
from src.flows.init_species_groups import init_species_groups_flow
from src.flows.last_positions import last_positions_flow
from src.flows.logbook import logbook_flow
from src.flows.missing_dep_alerts import missing_dep_alerts_flow
from src.flows.missing_far_alerts import missing_far_alerts_flow
from src.flows.missing_trip_numbers import missing_trip_numbers_flow
from src.flows.missions import missions_flow
from src.flows.notify_beacon_malfunctions import notify_beacon_malfunctions_flow
from src.flows.ports import ports_flow
from src.flows.position_alert import position_alert_flow
from src.flows.position_alerts import position_alerts_flow
from src.flows.recompute_controls_segments import recompute_controls_segments_flow
from src.flows.refresh_materialized_view import refresh_materialized_view_flow
from src.flows.regulations import regulations_flow
from src.flows.regulations_checkup import regulations_checkup_flow
from src.flows.risk_factors import risk_factors_flow
from src.flows.scrape_legipeche import scrape_legipeche_flow
from src.flows.species import species_flow
from src.flows.suspicions_of_under_declaration_alerts import (
    suspicions_of_under_declaration_alerts_flow,
)
from src.flows.update_beacon_malfunctions import update_beacon_malfunctions_flow
from src.flows.validate_pending_alerts import validate_pending_alerts_flow
from src.flows.vessel_profiles import vessel_profiles_flow
from src.flows.vessels import vessels_flow

################################# List flows to deploy ################################


def default_concurrency_limit() -> ConcurrencyLimitConfig:
    return ConcurrencyLimitConfig(
        limit=1, collision_strategy=ConcurrencyLimitStrategy.CANCEL_NEW
    )


@dataclass
class FlowAndSchedules:
    flow: Flow
    schedules: List[Schedule] = None
    concurrency_limit: ConcurrencyLimitConfig = field(
        default_factory=default_concurrency_limit
    )


flows_to_deploy = [
    FlowAndSchedules(
        flow=activity_visualizations_flow, schedules=[Schedule(cron="0 20 1 * *")]
    ),
    FlowAndSchedules(
        flow=admin_areas_flow, schedules=[Schedule(cron="43 4 * * 1,2,3,4,5")]
    ),
    FlowAndSchedules(flow=anchorages_flow),
    FlowAndSchedules(
        flow=beacons_flow, schedules=[Schedule(cron="4,14,24,34,44,54 * * * *")]
    ),
    FlowAndSchedules(
        flow=control_anteriority_flow, schedules=[Schedule(cron="5 * * * *")]
    ),
    FlowAndSchedules(flow=control_units_flow, schedules=[Schedule(cron="12 8 * * *")]),
    FlowAndSchedules(flow=controls_flow),
    FlowAndSchedules(
        flow=controls_open_data_flow, schedules=[Schedule(cron="15 3 * * 5")]
    ),
    FlowAndSchedules(
        flow=current_segments_flow, schedules=[Schedule(cron="2,22,42 * * * *")]
    ),
    FlowAndSchedules(
        flow=distribute_pnos_flow,
        schedules=[
            Schedule(
                cron="* * * * *",
                parameters={
                    "test_mode": PNO_TEST_MODE,
                    "is_integration": IS_INTEGRATION,
                    "start_hours_ago": 120,
                    "end_hours_ago": 0,
                },
            )
        ],
    ),
    FlowAndSchedules(flow=districts_flow),
    FlowAndSchedules(
        flow=email_actions_to_units_flow,
        schedules=[
            Schedule(
                cron="0 5 * * 1",
                parameters={
                    "start_days_ago": 7,
                    "end_days_ago": 1,
                    "test_mode": WEEKLY_CONTROL_REPORT_EMAIL_TEST_MODE,
                    "is_integration": IS_INTEGRATION,
                },
            )
        ],
    ),
    FlowAndSchedules(
        flow=enrich_logbook_flow,
        schedules=[
            Schedule(
                cron="1,6,11,16,21,26,31,36,41,46,51,56 * * * *",
                parameters={
                    "start_hours_ago": 6,
                    "end_hours_ago": 0,
                    "minutes_per_chunk": 480,
                    "recompute_all": False,
                },
            )
        ],
    ),
    FlowAndSchedules(
        flow=enrich_positions_flow,
        schedules=[
            Schedule(
                cron="1-59 * * * *",
                parameters={
                    "start_hours_ago": 7,
                    "end_hours_ago": 0,
                    "minutes_per_chunk": 420,
                    "chunk_overlap_minutes": 0,
                    "minimum_consecutive_positions": MINIMUM_CONSECUTIVE_POSITIONS,
                    "minimum_minutes_of_emission_at_sea": MINIMUM_MINUTES_OF_EMISSION_AT_SEA,
                    "min_fishing_speed_threshold": MIN_FISHING_SPEED_THRESHOLD,
                    "max_fishing_speed_threshold": MAX_FISHING_SPEED_THRESHOLD,
                    "recompute_all": False,
                },
            ),
            Schedule(
                cron="0 * * * *",
                parameters={
                    "start_hours_ago": 24,
                    "end_hours_ago": 0,
                    "minutes_per_chunk": 1440,
                    "chunk_overlap_minutes": 0,
                    "minimum_consecutive_positions": MINIMUM_CONSECUTIVE_POSITIONS,
                    "minimum_minutes_of_emission_at_sea": MINIMUM_MINUTES_OF_EMISSION_AT_SEA,
                    "min_fishing_speed_threshold": MIN_FISHING_SPEED_THRESHOLD,
                    "max_fishing_speed_threshold": MAX_FISHING_SPEED_THRESHOLD,
                    "recompute_all": True,
                },
            ),
        ],
    ),
    FlowAndSchedules(flow=species_flow),
    FlowAndSchedules(flow=facade_areas_flow),
    FlowAndSchedules(flow=fao_areas_flow),
    FlowAndSchedules(flow=fishing_gear_codes_flow),
    FlowAndSchedules(flow=foreign_fmcs_flow, schedules=[Schedule(cron="37 10 * * *")]),
    FlowAndSchedules(flow=infractions_flow, schedules=[Schedule(cron="1 8 * * *")]),
    FlowAndSchedules(flow=init_pno_types_flow),
    FlowAndSchedules(flow=init_species_groups_flow),
    FlowAndSchedules(
        flow=last_positions_flow,
        schedules=[
            Schedule(
                cron=(
                    "0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,"
                    "32,34,36,38,40,42,44,46,48,50,52,54,56,58 "
                    "* * * *"
                ),
                parameters={"minutes": 1440, "action": "update"},
            ),
        ],
    ),
    FlowAndSchedules(
        flow=logbook_flow,
        schedules=[Schedule(cron="0,5,10,15,20,25,30,35,40,45,50,55 * * * *")],
    ),
    FlowAndSchedules(
        flow=missing_dep_alerts_flow, schedules=[Schedule(cron="5,25,45 * * * *")]
    ),
    FlowAndSchedules(
        flow=missing_far_alerts_flow,
        schedules=[
            Schedule(
                cron="45 6 * * *",
                parameters={
                    "alert_type": "MISSING_FAR_ALERT",
                    "name": "FAR manquant en 24h",
                    "states_iso2_to_monitor_everywhere": ["FR"],
                    "states_iso2_to_monitor_in_french_eez": ["BE", "VE"],
                    "max_share_of_vessels_with_missing_fars": 0.5,
                    "minimum_length": 12.0,
                    "only_raise_if_route_shows_fishing": True,
                    "days_without_far": 1,
                },
            ),
            Schedule(
                cron="55 6 * * *",
                parameters={
                    "alert_type": "MISSING_FAR_48_HOURS_ALERT",
                    "name": "FAR manquant en 48h",
                    "states_iso2_to_monitor_everywhere": ["FR"],
                    "states_iso2_to_monitor_in_french_eez": ["BE", "VE"],
                    "max_share_of_vessels_with_missing_fars": 0.5,
                    "minimum_length": 12.0,
                    "only_raise_if_route_shows_fishing": True,
                    "days_without_far": 2,
                },
            ),
        ],
    ),
    FlowAndSchedules(
        flow=missing_trip_numbers_flow,
        schedules=[Schedule(cron="4,14,24,34,44,54 * * * *")],
    ),
    FlowAndSchedules(
        flow=missions_flow,
        schedules=[
            Schedule(
                cron="6 4 * * *",
                parameters={"number_of_months": 200},
            )
        ],
    ),
    FlowAndSchedules(
        flow=notify_beacon_malfunctions_flow,
        schedules=[
            Schedule(
                cron=(
                    "1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,"
                    "33,35,37,39,41,43,45,47,49,51,53,55,57,59 "
                    "* * * *"
                ),
                parameters={
                    "test_mode": TEST_MODE,
                    "is_integration": IS_INTEGRATION,
                },
            ),
        ],
    ),
    FlowAndSchedules(flow=ports_flow),
    FlowAndSchedules(flow=position_alert_flow),
    FlowAndSchedules(
        flow=position_alerts_flow,
        schedules=[
            Schedule(
                cron="1,11,21,31,41,51 * * * *",
            )
        ],
    ),
    FlowAndSchedules(flow=recompute_controls_segments_flow),
    FlowAndSchedules(
        flow=refresh_materialized_view_flow,
        schedules=[
            Schedule(
                cron="20 4 * * *",
                parameters={
                    "view_name": "analytics_controls_full_data",
                },
            ),
        ],
    ),
    FlowAndSchedules(
        flow=regulations_checkup_flow,
        schedules=[Schedule(cron="5 6 * * 1,2,3,4,5")],
    ),
    FlowAndSchedules(
        flow=regulations_flow,
        schedules=[Schedule(cron="2,32 * * * *")],
    ),
    FlowAndSchedules(
        flow=risk_factors_flow,
        schedules=[Schedule(cron="3,23,43 * * * *")],
    ),
    FlowAndSchedules(
        flow=scrape_legipeche_flow,
        schedules=[Schedule(cron="15 5 * * 1,2,3,4,5")],
    ),
    FlowAndSchedules(
        flow=suspicions_of_under_declaration_alerts_flow,
        schedules=[Schedule(cron="57 6 * * *")],
    ),
    FlowAndSchedules(
        flow=update_beacon_malfunctions_flow,
        schedules=[Schedule(cron="6,16,26,36,46,56 * * * *")],
    ),
    FlowAndSchedules(
        flow=validate_pending_alerts_flow,
        schedules=[
            Schedule(
                cron="50 6 * * *",
                parameters={"alert_type": "MISSING_FAR_ALERT"},
            )
        ],
    ),
    FlowAndSchedules(
        flow=vessel_profiles_flow,
        schedules=[Schedule(cron="51 * * * *")],
    ),
    FlowAndSchedules(
        flow=vessels_flow,
        schedules=[Schedule(cron="2 2,5,8,11,14,20,23 * * *")],
    ),
]


deployments = [
    flow_to_deploy.flow.to_deployment(
        name=flow_to_deploy.flow.name,
        schedules=flow_to_deploy.schedules,
        concurrency_limit=flow_to_deploy.concurrency_limit,
    )
    for flow_to_deploy in flows_to_deploy
]

################### Define flows' run config ####################
for deployment in deployments:
    deployment.job_variables = {
        "env": {"PREFECT_API_URL": PREFECT_API_URL},
        "volumes": [
            f"{HOST_ENV_FILE_LOCATION}:/home/monitorfish-pipeline/pipeline/.env"
        ],
        "auto_remove": True,
    }
    deployment.work_pool_name = "monitorfish"
    deployment.storage = LocalStorage("/home/monitorfish-pipeline/pipeline")

    if deployment.name == "Logbook":
        deployment.job_variables["docker"] = {
            "run_config": {"group_add": [LOGBOOK_FILES_GID]}
        }
        deployment.job_variables["volumes"].append(
            f"{ERS_FILES_LOCATION}:{ERS_FILES_LOCATION}"
        )
