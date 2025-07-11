from prefect import deploy

from config import MONITORFISH_VERSION
from src.deployments import deployments

if __name__ == "__main__":
    deploy(
        *deployments,
        image=f"monitorfish-pipeline-prefect3:{MONITORFISH_VERSION}",
        build=False,
        work_pool_name="monitorfish",
    )
