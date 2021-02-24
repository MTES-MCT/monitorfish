from datetime import datetime

import prefect
from prefect import Flow, task


@task
def print_time():
    utc_datetime_now = datetime.utcnow().strftime("%d/%m/%Y %H:%M")
    logger = prefect.context.get("logger")
    logger.info(f"The UTC date and time right now : {utc_datetime_now}")


with Flow("Heartbeat") as flow:
    print_time()


if __name__ == "__main__":
    flow.run()
