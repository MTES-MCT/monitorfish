import pandas as pd
from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from config import REGULATIONS_CSV_RESOURCE_ID, REGULATIONS_DATASET_ID
from src.pipeline.generic_tasks import extract
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.datagouv import update_resource
from src.pipeline.shared_tasks.utils import df_to_csv_file_object


@task(checkpoint=False)
def extract_regulations_open_data() -> pd.DataFrame:
    return extract("monitorfish_remote", "monitorfish/regulations_open_data.sql")


with Flow("Regulations open data", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        regulations = extract_regulations_open_data()
        csv_file = df_to_csv_file_object()
        update_resource(
            dataset_id=REGULATIONS_DATASET_ID,
            resource_id=REGULATIONS_CSV_RESOURCE_ID,
            resource_title="reglementation-des-peches-cartographiee.csv",
            resource=csv_file,
        )
