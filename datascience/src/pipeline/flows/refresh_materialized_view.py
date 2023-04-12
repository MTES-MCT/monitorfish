from pathlib import Path

import pandas as pd
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor
from sqlalchemy import Table, text

from src.db_config import create_engine
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.infrastructure import get_table


@task(checkpoint=False)
def refresh_view(view: Table) -> pd.DataFrame:

    assert isinstance(view, Table)

    query = text(f"REFRESH MATERIALIZED VIEW {view.schema}.{view.name}")
    e = create_engine("monitorfish_remote")
    e.execute(query)


with Flow("Refresh materialized view", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        view_name = Parameter("view_name")
        schema = Parameter("schema", "public")
        view = get_table(table_name=view_name, schema=schema)
        refresh_view(view)

flow.file_name = Path(__file__).name
