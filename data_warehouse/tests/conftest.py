import os
from time import sleep

import docker
import pytest
from dotenv import dotenv_values
from pytest import MonkeyPatch

from config import ROOT_DIRECTORY


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
def wait_for_data_warehouse(set_environment_variables, create_docker_client):
    client = create_docker_client
    health = None
    timeout = 30
    stop_time = 1
    elapsed_time = 0

    while health != "healthy" and elapsed_time < timeout:
        print(f"Waiting for data warehouse to start ({elapsed_time}/{timeout})")
        sleep(stop_time)
        health = client.inspect_container("data_warehouse")["State"]["Health"]["Status"]
        elapsed_time += stop_time

    if health == "healthy":
        print("Data warehouse started")
    else:
        raise RuntimeError("Could not start data warehouse")
    yield
