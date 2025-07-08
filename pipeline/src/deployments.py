from prefect.runner.storage import LocalStorage

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
from src.flows.species import species_flow

# from prefect.schedules import Schedule


################################# List flows to deploy ################################
deployments = [
    anchorages_flow.to_deployment(
        name=anchorages_flow.name,
    ),
    controls_flow.to_deployment(
        name=controls_flow.name,
    ),
    districts_flow.to_deployment(
        name=districts_flow.name,
    ),
    species_flow.to_deployment(
        name=species_flow.name,
    ),
    facade_areas_flow.to_deployment(
        name=facade_areas_flow.name,
    ),
    # (
    #     github_stars_flow.to_deployment(
    #         name=github_stars_flow.__name__,
    #         schedule=Schedule(
    #             cron="* * * * *", parameters={"repos": ["Repo 1", "Repo 2"]}
    #         ),
    #     )
    # )
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
