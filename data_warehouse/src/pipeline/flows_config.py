from dotenv import dotenv_values
from prefect.run_configs.docker import DockerRun
from prefect.schedules import CronSchedule
from prefect.storage.local import Local

from config import (
    DATA_WAREHOUSE_VERSION,
    DOCKER_IMAGE,
    FLOWS_LABEL,
    FLOWS_LOCATION,
    ROOT_DIRECTORY,
)
from src.pipeline.flows import clean_flow_runs

################################ Define flow schedules ################################
clean_flow_runs.flow.schedule = CronSchedule("8,18,28,38,48,58 * * * *")


###################### List flows to register with prefect server #####################
flows_to_register = [
    clean_flow_runs.flow,
]


################################ Define flows' storage ################################
# This defines where the executor can find the flow.py file for each flow **inside**
# the container.
for flow in flows_to_register:
    flow.storage = Local(
        add_default_labels=False,
        stored_as_script=True,
        path=(FLOWS_LOCATION / flow.file_name).as_posix(),
    )

################### Define flows' run config ####################
for flow in flows_to_register:
    host_config = None

    flow.run_config = DockerRun(
        image=f"{DOCKER_IMAGE}:{DATA_WAREHOUSE_VERSION}",
        host_config=host_config,
        env=dotenv_values(ROOT_DIRECTORY / ".env"),
        labels=[FLOWS_LABEL],
    )
