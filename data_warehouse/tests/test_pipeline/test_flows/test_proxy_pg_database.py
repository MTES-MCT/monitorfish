from forklift.db_engines import create_datawarehouse_client
from forklift.pipeline.flows.proxy_pg_database import flow
from tests.mocks import mock_check_flow_not_running

flow.schedule = None
flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_proxy_pg_database():
    client = create_datawarehouse_client()
    initial_databases = client.query_df("SHOW DATABASES")
    flow.run(
        database="monitorfish_remote",
        schema="public",
        database_name_in_dw="monitorfish_proxy",
    )
    final_databases = client.query_df("SHOW DATABASES")
    assert set(final_databases.name.values) - set(initial_databases.name.values) == {
        "monitorfish_proxy"
    }
    df = client.query_df("SELECT * FROM monitorfish_proxy.analytics_controls_full_data")
    assert len(df) == 26
    client.command("DROP DATABASE monitorfish_proxy")
