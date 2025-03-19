from pytest import fixture

from config import TEST_DATA_LOCATION
from src.db_config import create_datawarehouse_client


@fixture
def add_monitorfish_database():
    client = create_datawarehouse_client()
    print("Creating monitorfish database")
    client.command("CREATE DATABASE monitorfish")
    yield
    print("Dropping monitorfish database")
    client.command("DROP DATABASE monitorfish")


@fixture
def add_enriched_catches(add_monitorfish_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish.enriched_catches table")
    with open(
        TEST_DATA_LOCATION
        / (
            "external/data_warehouse/forklift/forklift/pipeline/"
            "sql_scripts/ddl/monitorfish/create_enriched_catches_if_not_exists.sql"
        ),
        "r",
    ) as f:
        ddl = f.read()
    client.command(ddl)

    print("Inserting test data into monitorfish.enriched_catches table")
    client.command(
        """
        INSERT INTO TABLE monitorfish.enriched_catches
        SELECT * FROM file('enriched_catches.csv')
    """
    )
    yield
    print("Dropping monitorfish.enriched_catches table")
    client.command("DROP TABLE monitorfish.enriched_catches")


@fixture
def add_landings(add_monitorfish_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish.landings table")
    with open(
        TEST_DATA_LOCATION
        / (
            "external/data_warehouse/forklift/forklift/pipeline/"
            "sql_scripts/ddl/monitorfish/create_landings_if_not_exists.sql"
        ),
        "r",
    ) as f:
        ddl = f.read()
    client.command(ddl)

    print("Inserting test data into monitorfish.landings table")
    client.command(
        """
        INSERT INTO TABLE monitorfish.landings
        SELECT * FROM file('landings.csv')
    """
    )
    yield
    print("Dropping monitorfish.landings table")
    client.command("DROP TABLE monitorfish.landings")
