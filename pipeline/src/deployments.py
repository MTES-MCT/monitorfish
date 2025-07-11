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
from src.flows.anchorages import anchorages_flow
from src.flows.controls import controls_flow
from src.flows.districts import districts_flow
from src.flows.facade_areas import facade_areas_flow
from src.flows.fao_areas import fao_areas_flow
from src.flows.fishing_gear_codes import fishing_gear_codes_flow
from src.flows.init_pno_types import init_pno_types_flow
from src.flows.init_species_groups import init_species_groups_flow
from src.flows.species import species_flow


################################# List flows to deploy ################################
@dataclass
class FlowAndSchedules:
    flow: Flow
    schedules: List[Schedule] = None


flows_to_deploy = [
    FlowAndSchedules(flow=anchorages_flow),
    FlowAndSchedules(flow=controls_flow),
    FlowAndSchedules(flow=districts_flow),
    FlowAndSchedules(flow=species_flow),
    FlowAndSchedules(flow=facade_areas_flow),
    FlowAndSchedules(flow=fao_areas_flow),
    FlowAndSchedules(flow=fishing_gear_codes_flow),
    FlowAndSchedules(flow=init_pno_types_flow),
    FlowAndSchedules(flow=init_species_groups_flow),
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
