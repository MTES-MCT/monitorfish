import pandas as pd
from dotenv import get_key
from pytest import fixture

from config import DOTENV_PATH, TEST_DATA_LOCATION
from src.db_config import create_datawarehouse_client, db_env


@fixture
def add_monitorfish_database():
    client = create_datawarehouse_client()
    print("Creating monitorfish database")
    client.command("CREATE DATABASE monitorfish")
    yield
    print("Dropping monitorfish database")
    client.command("DROP DATABASE monitorfish")


@fixture
def add_monitorfish_proxy_database(add_monitorfish_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish_proxy database")

    client.command("DROP DATABASE IF EXISTS monitorfish_proxy")
    host = get_key(DOTENV_PATH, db_env["monitorfish_remote"]["host"])
    port = get_key(DOTENV_PATH, db_env["monitorfish_remote"]["port"])
    sid = get_key(DOTENV_PATH, db_env["monitorfish_remote"]["sid"])
    usr = get_key(DOTENV_PATH, db_env["monitorfish_remote"]["usr"])
    pwd = get_key(DOTENV_PATH, db_env["monitorfish_remote"]["pwd"])
    schema = "public"

    sql = f"""
        CREATE DATABASE monitorfish_proxy
        ENGINE = PostgreSQL(
            '{host}:{port}',
            '{sid}',
            '{usr}',
            '{pwd}',
            '{schema}'
        )
    """

    client.command(sql)
    yield
    print("Dropping monitorfish_proxy database")
    client.command("DROP DATABASE monitorfish_proxy")


@fixture
def add_vessels(add_monitorfish_proxy_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish.vessels table")
    client.command(
        """
        CREATE TABLE monitorfish.vessels
        ENGINE MergeTree
        ORDER BY id
        AS
        SELECT * FROM monitorfish_proxy.vessels
    """
    )
    yield
    print("Dropping monitorfish.vessels table")
    client.command("DROP TABLE monitorfish.vessels")


@fixture
def add_activity_dates_table(add_monitorfish_proxy_database):
    client = create_datawarehouse_client()

    print("Creating monitorfish.activities table")
    with open(
        TEST_DATA_LOCATION
        / (
            "external/data_warehouse/forklift/forklift/pipeline/sql_scripts/"
            "ddl/monitorfish/create_activities_if_not_exists.sql"
        ),
        "r",
    ) as f:
        ddl = f.read()
    client.command(ddl)

    print("Populating monitorfish.activities table")
    client.command(
        """
        INSERT INTO monitorfish.activities
        SELECT
            operation_datetime_utc,
            cfr,
            activity_datetime_utc,
            log_type,
            trip_number,
            trip_number_was_computed,
            report_id
        FROM monitorfish_proxy.logbook_reports
        WHERE
            log_type IS NOT NULL
            AND trip_number IS NOT NULL
            AND operation_datetime_utc::TimeStamp < NOW() - INTERVAL 1 DAYS
    """
    )
    yield
    print("Dropping monitorfish.activities table")
    client.command("DROP TABLE monitorfish.activities")


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


@fixture
def control_priorities() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "facade": ["Facade 1", "Facade 1", "Facade 2", "Facade 2"],
            "segment": ["T8-9", "L", "T8-9", "L"],
            "control_priority_level": [2.5, 2.8, 2.9, 2.4],
        }
    )
