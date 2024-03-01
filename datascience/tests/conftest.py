import itertools
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from time import sleep
from typing import List

import docker
import pytest
from dotenv import dotenv_values
from pytest import MonkeyPatch
from sqlalchemy import text

from config import (
    HOST_MIGRATIONS_FOLDER,
    LOCAL_MIGRATIONS_FOLDER,
    ROOT_DIRECTORY,
    TEST_DATA_LOCATION,
)
from src.db_config import create_engine

migrations_folders = [
    ROOT_DIRECTORY
    / Path("../backend/src/main/resources/db/migration/internal").resolve(),
    ROOT_DIRECTORY
    / Path("../backend/src/main/resources/db/migration/layers").resolve(),
]

local_migrations_folders = [
    Path(LOCAL_MIGRATIONS_FOLDER) / "internal",
    Path(LOCAL_MIGRATIONS_FOLDER) / "layers",
]

host_migrations_folders = [
    Path(HOST_MIGRATIONS_FOLDER) / "internal",
    Path(HOST_MIGRATIONS_FOLDER) / "layers",
]

# Bind mounts of migrations scripts inside test database container
migrations_mounts_root = "/opt/migrations"

migrations_folders_mounts = [
    (
        f"{str(host_migrations_folder)}:"
        f"{migrations_mounts_root}/{host_migrations_folder.name}"
    )
    for host_migrations_folder in host_migrations_folders
]

test_data_scripts_folder = TEST_DATA_LOCATION / Path("remote_database")


################################## Handle migrations ##################################


@dataclass
class Migration:
    path: Path
    major: int
    minor: int
    patch: int
    script: str = field(init=False)

    def __post_init__(self):
        self.script = read_sql_file(self.path)


def read_sql_file(script_path: Path) -> str:
    cmd_lines = []
    with open(script_path, "r") as f:
        for line in f:
            if not line.startswith("--"):
                cmd_lines.append(line)

    return "".join(cmd_lines)


def sort_migrations(migrations: List[Migration]) -> List[Migration]:
    return sorted(migrations, key=lambda m: (m.major, m.minor, m.patch))


def get_migrations_in_folder(folder: Path) -> List[Migration]:
    files = os.listdir(folder)
    migration_regex = re.compile(
        r"V(?P<major>\d+)\.(?P<minor>\d+)(\.(?P<patch>\d+))?__(?P<name>.*)\.sql"
    )
    migrations = []

    for file in files:
        match = migration_regex.match(file)
        if match:
            major = int(match.group("major"))
            minor = int(match.group("minor"))
            patch = int(match.group("patch") or "0")
            path = (folder / Path(file)).resolve()
            migrations.append(
                Migration(path=path, major=major, minor=minor, patch=patch)
            )

    return sort_migrations(migrations)


def get_migrations_in_folders(migrations_folders: List[Path]) -> List[Migration]:
    migrations = itertools.chain(
        *[get_migrations_in_folder(f) for f in migrations_folders]
    )
    migrations = sort_migrations(migrations)
    return migrations


################################# Start test database #################################
@pytest.fixture(scope="session")
def monkeysession(request):
    mpatch = MonkeyPatch()
    yield mpatch
    mpatch.undo()


@pytest.fixture(scope="session", autouse=True)
def set_environment_variables(monkeysession):
    for k, v in dotenv_values(ROOT_DIRECTORY / ".env.test").items():
        monkeysession.setenv(k, v)


@pytest.fixture(scope="session")
def create_docker_client():
    client = docker.from_env()
    yield client


@pytest.fixture(scope="session")
def start_remote_database_container(set_environment_variables, create_docker_client):
    client = create_docker_client
    print("Starting database container")
    remote_database_container = client.containers.run(
        "timescale/timescaledb-postgis:1.7.4-pg11",
        environment={
            "POSTGRES_PASSWORD": os.environ["MONITORFISH_REMOTE_DB_PWD"],
            "POSTGRES_USER": os.environ["MONITORFISH_REMOTE_DB_USER"],
            "POSTGRES_DB": os.environ["MONITORFISH_REMOTE_DB_NAME"],
        },
        ports={"5432/tcp": os.environ["MONITORFISH_REMOTE_DB_PORT"]},
        detach=True,
        volumes=migrations_folders_mounts,
    )

    timeout = 30
    stop_time = 3
    elapsed_time = 0
    healthcheck_exit_code = None

    while healthcheck_exit_code != 0 and elapsed_time < timeout:
        print(f"Waiting for database container to start ({elapsed_time}/{timeout})")
        sleep(stop_time)
        healthcheck_exit_code = remote_database_container.exec_run(
            (
                f"pg_isready -U {os.environ['MONITORFISH_REMOTE_DB_USER']} -d "
                f"{os.environ['MONITORFISH_REMOTE_DB_NAME']}"
            )
        ).exit_code
        remote_database_container.reload()
        print(f"Container status: {remote_database_container.status}")
        print(f"Healthcheck exit code: {healthcheck_exit_code}")
        elapsed_time += stop_time
        continue

    yield remote_database_container
    print("Stopping database container")
    remote_database_container.stop()
    remote_database_container.remove(v=True)


@pytest.fixture(scope="session")
def create_tables(set_environment_variables, start_remote_database_container):
    container = start_remote_database_container
    migrations = get_migrations_in_folders(local_migrations_folders)

    print("Creating tables")
    for m in migrations:
        print(f"{m.major}.{m.minor}.{m.patch}: {m.path.name}")

        # Script filepath inside database container
        script_filepath = f"{migrations_mounts_root}/{m.path.parent.name}/{m.path.name}"

        # Use psql inside database container to run migration scripts.
        # Using sqlalchemy / psycopg2 to run migration scripts from python is not
        # possible due to the use of `COPY FROM STDIN` in some migrations.
        result = container.exec_run(
            (
                "psql "
                f"-v ON_ERROR_STOP=1 "
                f"-U {os.environ['MONITORFISH_REMOTE_DB_USER']} "
                f"-d {os.environ['MONITORFISH_REMOTE_DB_NAME']} "
                f"-f '{script_filepath}'"
            )
        )
        if result.exit_code != 0:
            raise Exception(
                f"Error running migration {m.path.name}. "
                f"Error message is: {result.output}"
            )


# @pytest.fixture(scope="session")
# def start_remote_database_container(create_docker_client):
#     client = create_docker_client
#     print("Starting database container")
#     remote_database_container = client.containers.run(
#         "timescale/timescaledb-postgis:1.7.4-pg11",
#         environment={
#             "POSTGRES_PASSWORD": os.environ["MONITORFISH_REMOTE_DB_PWD"],
#             "POSTGRES_USER": os.environ["MONITORFISH_REMOTE_DB_USER"],
#             "POSTGRES_DB": os.environ["MONITORFISH_REMOTE_DB_NAME"],
#         },
#         ports={"5432/tcp": 5434},
#         detach=True,
#     )
#     sleep(3)
#     yield
#     print("Stopping database container")
#     remote_database_container.stop()
#     remote_database_container.remove(v=True)


# @pytest.fixture(scope="session")
# def create_tables(start_remote_database_container):
#     e = create_engine("monitorfish_remote")
#     migrations = get_migrations_in_folders(migrations_folders)
#     print("Creating tables")
#     with e.connect() as connection:
#         for m in migrations:
#             print(f"{m.major}.{m.minor}.{m.patch}: {m.path.name}")
#             connection.execute(text("COMMIT"))
#             connection.execute(text(m.script))


@pytest.fixture()
def reset_test_data(create_tables):
    e = create_engine("monitorfish_remote")
    test_data_scripts = get_migrations_in_folder(test_data_scripts_folder)
    print("Inserting test data")
    with e.begin() as connection:
        for s in test_data_scripts:
            print(f"{s.major}.{s.minor}.{s.patch}: {s.path.name}")
            connection.execute(text(s.script))


############################ Share fixtures between modules ############################
pytest_plugins = [
    "tests.test_pipeline.test_shared_tasks.test_segments",
]
