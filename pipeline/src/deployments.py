from dataclasses import dataclass
from typing import List

from prefect import Flow
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
    ROOT_DIRECTORY,
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
from src.flows.ports import ports_flow
from src.flows.recompute_controls_segments import recompute_controls_segments_flow
from src.flows.species import species_flow


################################# List flows to deploy ################################
@dataclass
class FlowAndSchedules:
    flow: Flow
    schedules: List[Schedule] = None


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
                cron="* * * * *",
                parameters={"minutes": 1440, "action": "update"},
            ),
        ],
    ),
    FlowAndSchedules(
        flow=logbook_flow,
        schedules=[Schedule("0,5,10,15,20,25,30,35,40,45,50,55 * * * *")],
    ),
    FlowAndSchedules(
        flow=missing_dep_alerts_flow, schedules=[Schedule(cron="5,25,45 * * * *")]
    ),
    FlowAndSchedules(flow=ports_flow),
    FlowAndSchedules(flow=recompute_controls_segments_flow),
]


deployments = [
    flow_to_deploy.flow.to_deployment(
        name=flow_to_deploy.flow.name, schedules=flow_to_deploy.schedules
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
    }
    deployment.concurrency_limit = 1
    deployment.work_pool_name = "monitorfish"
    deployment.storage = LocalStorage(ROOT_DIRECTORY.as_posix())

    if deployment.name == "logbook":
        deployment.job_variables["docker"] = {
            "run_config": {"group_add": [LOGBOOK_FILES_GID]}
        }
        deployment.job_variables[
            "volumes"
        ] += f"{ERS_FILES_LOCATION}:{ERS_FILES_LOCATION}"
