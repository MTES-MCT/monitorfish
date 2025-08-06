from prefect import deploy

from config import DOCKER_IMAGE, MONITORFISH_VERSION
from src.deployments import deployments

if __name__ == "__main__":
    deploy(
        *deployments,
        image=f"{DOCKER_IMAGE}:{MONITORFISH_VERSION}",
        build=False,
        work_pool_name="monitorfish",
    )
