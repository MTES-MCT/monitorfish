import itertools
import os
from time import sleep

import docker
import pytest
from dotenv import dotenv_values
from pytest import MonkeyPatch

from forklift.config import ROOT_DIRECTORY
from forklift.db_engines import create_datawarehouse_client
from forklift.pipeline.flows.proxy_pg_database import create_proxy_pg_database


################################# Start test database #################################
@pytest.fixture(scope="session")
def monkeysession(request):
    mpatch = MonkeyPatch()
    yield mpatch
    mpatch.undo()


@pytest.fixture(scope="session", autouse=True)
def set_environment_variables(monkeysession):
    for proxy_env in ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]:
        os.environ.pop(proxy_env, None)

    for k, v in dotenv_values(ROOT_DIRECTORY / ".env.test").items():
        monkeysession.setenv(k, v)


@pytest.fixture(scope="session")
def create_docker_client():
    client = docker.APIClient()
    yield client


@pytest.fixture(scope="session", autouse=True)
def wait_for_data_warehous_and_migrations(
    set_environment_variables, create_docker_client
):
    client = create_docker_client
    health = None
    timeout = 30
    stop_time = 1
    elapsed_time = 0
    migrations_in_progress = True

    # Start data warehouse
    while health != "healthy" and elapsed_time < timeout:
        print(f"Waiting for data warehouse to start ({elapsed_time}/{timeout})")
        sleep(stop_time)
        health = client.inspect_container("data_warehouse")["State"]["Health"]["Status"]
        elapsed_time += stop_time

    if health == "healthy":
        print("Data warehouse started")
    else:
        raise RuntimeError("Could not start data warehouse.")

    # Migrate test data
    elapsed_time = 0
    while migrations_in_progress and elapsed_time < timeout:
        print(f"Waiting for test data migrations ({elapsed_time}/{timeout})")
        running_containers = list(
            itertools.chain.from_iterable([c["Names"] for c in client.containers()])
        )
        running_migrations = [c for c in running_containers if "flyway" in c]
        print(f"Migrations running: {running_migrations}")
        migrations_in_progress = len(running_migrations) > 0
        sleep(stop_time)
        elapsed_time += stop_time

    if not migrations_in_progress:
        print("Test data migrated")
    else:
        raise RuntimeError("Could not migrate test data.")

    yield


@pytest.fixture
def add_monitorfish_proxy_database():
    print("Creating monitorfish database proxy")
    create_proxy_pg_database.run(
        database="monitorfish_remote",
        schema="public",
        database_name_in_dw="monitorfish_proxy",
    )
    yield
    print("Dropping monitorfish database proxy")
    client = create_datawarehouse_client()
    client.command("DROP DATABASE monitorfish_proxy")
