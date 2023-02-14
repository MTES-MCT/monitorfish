import itertools
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from time import sleep
from typing import List

import docker
import pytest
from pytest import MonkeyPatch

from config import ROOT_DIRECTORY, TEST_DATA_LOCATION
from src.db_config import create_engine

migrations_folders = [
    ROOT_DIRECTORY
    / Path("../backend/src/main/resources/db/migration/internal").resolve(),
    ROOT_DIRECTORY
    / Path("../backend/src/main/resources/db/migration/layers").resolve(),
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


@pytest.fixture(scope="session")
def create_docker_client():
    client = docker.from_env()
    yield client


@pytest.fixture(scope="session")
def start_remote_database_container(create_docker_client):
    client = create_docker_client
    print("Starting database container")
    remote_database_container = client.containers.run(
        "timescale/timescaledb-postgis:1.7.4-pg11",
        environment={
            "POSTGRES_PASSWORD": os.environ["MONITORFISH_REMOTE_DB_PWD"],
            "POSTGRES_USER": os.environ["MONITORFISH_REMOTE_DB_USER"],
            "POSTGRES_DB": os.environ["MONITORFISH_REMOTE_DB_NAME"],
        },
        ports={"5432/tcp": 5434},
        detach=True,
    )
    sleep(3)
    yield
    print("Stopping database container")
    remote_database_container.stop()
    remote_database_container.remove(v=True)


@pytest.fixture(scope="session")
def create_tables(start_remote_database_container):
    e = create_engine("monitorfish_remote")
    migrations = get_migrations_in_folders(migrations_folders)
    print("Creating tables")
    with e.connect() as connection:
        for m in migrations:
            connection.execute("COMMIT")
            connection.execute(m.script)


@pytest.fixture()
def reset_test_data(create_tables):
    e = create_engine("monitorfish_remote")
    test_data_scripts = get_migrations_in_folder(test_data_scripts_folder)
    print("Inserting test data")
    for s in test_data_scripts:
        print(f"{s.major}.{s.minor}.{s.patch}: {s.path.name}")
        e.execute(s.script)
