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
def add_catches(add_monitorfish_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish.catches table")
    with open(
        TEST_DATA_LOCATION
        / (
            "external/data_warehouse/forklift/forklift/pipeline/"
            "sql_scripts/ddl/monitorfish/create_catches_if_not_exists.sql"
        ),
        "r",
    ) as f:
        ddl = f.read()
    client.command(ddl)

    print("Inserting test data into monitorfish.catches table")
    client.command(
        """
        INSERT INTO TABLE monitorfish.catches
        SELECT * FROM file('catches.csv')
    """
    )
    yield
    print("Dropping monitorfish.catches table")
    client.command("DROP TABLE monitorfish.catches")


@fixture
def add_pno_type_rules_unnested(add_monitorfish_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish.pno_type_rules_unnested table")
    with open(
        TEST_DATA_LOCATION
        / (
            "external/data_warehouse/forklift/forklift/pipeline/"
            "sql_scripts/ddl/monitorfish/create_pno_type_rules_unnested.sql"
        ),
        "r",
    ) as f:
        ddl = f.read()
    client.command(ddl)

    print("Inserting test data into monitorfish.pno_type_rules_unnested table")
    client.command(
        """
        INSERT INTO TABLE monitorfish.pno_type_rules_unnested
        SELECT * FROM file('pno_type_rules_unnested.csv')
    """
    )
    yield
    print("Dropping monitorfish.pno_type_rules_unnested table")
    client.command("DROP TABLE monitorfish.pno_type_rules_unnested")


@fixture
def add_pnos(add_monitorfish_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish.pnos table")
    with open(
        TEST_DATA_LOCATION
        / (
            "external/data_warehouse/forklift/forklift/pipeline/"
            "sql_scripts/ddl/monitorfish/create_pnos_if_not_exists.sql"
        ),
        "r",
    ) as f:
        ddl = f.read()
    client.command(ddl)

    print("Inserting test data into monitorfish.pnos table")
    client.command(
        """
        INSERT INTO TABLE monitorfish.pnos
        SELECT * FROM file('pnos.csv')
    """
    )
    yield
    print("Dropping monitorfish.pnos table")
    client.command("DROP TABLE monitorfish.pnos")


@fixture
def add_rtps(add_monitorfish_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish.rtps table")
    with open(
        TEST_DATA_LOCATION
        / (
            "external/data_warehouse/forklift/forklift/pipeline/"
            "sql_scripts/ddl/monitorfish/create_rtps_if_not_exists.sql"
        ),
        "r",
    ) as f:
        ddl = f.read()
    client.command(ddl)

    print("Inserting test data into monitorfish.rtps table")
    client.command(
        """
        INSERT INTO TABLE monitorfish.rtps
        SELECT * FROM file('rtps.csv')
    """
    )
    yield
    print("Dropping monitorfish.rtps table")
    client.command("DROP TABLE monitorfish.rtps")


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
def add_vms(add_monitorfish_database):
    client = create_datawarehouse_client()
    print("Creating monitorfish.vms table")
    with open(
        TEST_DATA_LOCATION
        / (
            "external/data_warehouse/forklift/forklift/pipeline/"
            "sql_scripts/ddl/monitorfish/create_vms_if_not_exists.sql"
        ),
        "r",
    ) as f:
        ddl = f.read()
    client.command(ddl)

    print("Inserting test data into monitorfish.vms table")
    client.command(
        """
        INSERT INTO monitorfish.vms
        SELECT
            id,
            cfr,
            external_reference_number,
            ircs,
            vessel_name,
            flag_state,
            latitude,
            longitude,
            speed,
            course,
            date_time,
            is_manual,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing,
            time_emitting_at_sea,
            network_type,
            (longitude, latitude)::Point AS geometry,
            geoToH3(longitude, latitude, 8) AS h3_8
        FROM file('vms.csv')
    """
    )
    yield
    print("Dropping monitorfish.vms table")
    client.command("DROP TABLE monitorfish.vms")


@fixture
def control_priorities_and_infringement_risk_levels() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "facade": ["Facade 1", "Facade 1", "Facade 2", "Facade 2"],
            "segment": ["T8-9", "L", "T8-9", "L"],
            "control_priority_level": [2.5, 2.8, 2.9, 2.4],
            "infringement_risk_level": [3.4, 2.1, 3.0, 3.4],
        }
    )
