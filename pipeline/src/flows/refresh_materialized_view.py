import pandas as pd
from prefect import flow, task
from sqlalchemy import Table, text

from src.db_config import create_engine
from src.shared_tasks.infrastructure import get_table


@task
def refresh_view(view: Table) -> pd.DataFrame:
    assert isinstance(view, Table)

    query = text(f"REFRESH MATERIALIZED VIEW {view.schema}.{view.name}")
    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(query)


@flow(name="Refresh materialized view")
def refresh_materialized_view_flow(
    view_name: str,
    schema: str = "public",
):
    view = get_table(table_name=view_name, schema=schema)
    refresh_view(view)
