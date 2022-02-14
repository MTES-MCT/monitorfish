from pathlib import Path
from time import sleep

import prefect
from prefect import Flow, task


@task
def ping():
    logger = prefect.context.get("logger")
    for n in range(300):
        logger.info(f"Ping n°{n}")
        sleep(3)


with Flow("dummy flow") as flow:
    ping()

flow.file_name = Path(__file__).name
