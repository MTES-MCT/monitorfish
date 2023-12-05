from src.db_config import create_datawarehouse_client
from src.pipeline.flows.create_database import flow
from tests.mocks import mock_check_flow_not_running

flow.schedule = None
flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_create_database():
    client = create_datawarehouse_client()
    initial_databases = client.query_df("SHOW DATABASES")
    flow.run(database_name="dyNemoDB")
    final_databases = client.query_df("SHOW DATABASES")
    assert set(final_databases.name.values) - set(initial_databases.name.values) == {
        "dyNemoDB"
    }
    client.command("DROP DATABASE dyNemoDB")
