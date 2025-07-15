from dataclasses import dataclass
from typing import List

from prefect import Flow
from prefect.runner.storage import LocalStorage
from prefect.schedules import Schedule

from config import (
    ERS_FILES_LOCATION,
    HOST_ENV_FILE_LOCATION,
    LOGBOOK_FILES_GID,
    PREFECT_API_URL,
    ROOT_DIRECTORY,
)
from src.flows.activity_visualizations import activity_visualizations_flow
from src.flows.admin_areas import admin_areas_flow
from src.flows.anchorages import anchorages_flow
from src.flows.beacons import beacons_flow
from src.flows.control_anteriority import control_anteriority_flow
from src.flows.control_units import control_units_flow
from src.flows.controls import controls_flow
from src.flows.controls_open_data import controls_open_data_flow
from src.flows.districts import districts_flow
from src.flows.facade_areas import facade_areas_flow
from src.flows.fao_areas import fao_areas_flow
from src.flows.fishing_gear_codes import fishing_gear_codes_flow
from src.flows.init_pno_types import init_pno_types_flow
from src.flows.init_species_groups import init_species_groups_flow
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
    FlowAndSchedules(flow=districts_flow),
    FlowAndSchedules(flow=species_flow),
    FlowAndSchedules(flow=facade_areas_flow),
    FlowAndSchedules(flow=fao_areas_flow),
    FlowAndSchedules(flow=fishing_gear_codes_flow),
    FlowAndSchedules(flow=init_pno_types_flow),
    FlowAndSchedules(flow=init_species_groups_flow),
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
