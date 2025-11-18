import itertools
import os
import re
from ast import literal_eval
from dataclasses import dataclass, field
from pathlib import Path
from time import sleep
from typing import List

import docker
import pandas as pd
import pytest
from dotenv import dotenv_values
from prefect.testing.utilities import prefect_test_harness
from pytest import MonkeyPatch
from sqlalchemy import text

from config import (
    HOST_MIGRATIONS_FOLDER,
    LOCAL_MIGRATIONS_FOLDER,
    ROOT_DIRECTORY,
    TEST_DATA_LOCATION,
)
from src.db_config import create_engine
from src.entities.control_units import ControlUnit

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
    for proxy_env in ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]:
        os.environ.pop(proxy_env, None)

    for k, v in dotenv_values(ROOT_DIRECTORY / ".env.test").items():
        monkeysession.setenv(k, v)


@pytest.fixture(autouse=True, scope="session")
def prefect_test_fixture(set_environment_variables):
    with prefect_test_harness():
        yield


@pytest.fixture(scope="session")
def create_docker_client():
    client = docker.from_env()
    yield client


@pytest.fixture(scope="session")
def start_remote_database_container(set_environment_variables, create_docker_client):
    client = create_docker_client
    print("Starting database container")
    remote_database_container = client.containers.run(
        "ghcr.io/mtes-mct/monitorfish/monitorfish-database:pg16-ts2.14.2-postgis3.5.1",
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


@pytest.fixture()
def reset_test_data(create_tables):
    e = create_engine("monitorfish_remote")
    test_data_scripts = get_migrations_in_folder(test_data_scripts_folder)
    print("Inserting test data")
    with e.begin() as connection:
        for s in test_data_scripts:
            print(f"{s.major}.{s.minor}.{s.patch}: {s.path.name}")
            connection.execute(text(s.script))


@pytest.fixture(scope="session", autouse=True)
def wait_for_data_warehouse(set_environment_variables, create_docker_client):
    client = create_docker_client
    health = ""
    timeout = 30
    stop_time = 1
    elapsed_time = 0

    # Wait for data warehouse to start
    while not ("Up" in health and "(healthy)" in health) and elapsed_time < timeout:
        print(f"Waiting for data warehouse to start ({elapsed_time}/{timeout})")
        sleep(stop_time)
        container = [
            c
            for c in client.api.containers()
            if True in ["data_warehouse" in n for n in c["Names"]]
        ][0]
        health = container["Status"]
        elapsed_time += stop_time

    if "Up" in health and "(healthy)" in health:
        print("Data warehouse started")
    else:
        raise RuntimeError("Could not start data warehouse.")

    yield


############################ Share fixtures between modules ############################
pytest_plugins = []


@pytest.fixture
def pno_units_targeting_vessels():
    return pd.DataFrame(
        {
            "vessel_id": [2, 4, 7],
            "cfr": ["ABC000542519", None, "___TARGET___"],
            "control_unit_ids_targeting_vessel": [[4], [1, 2], [4]],
        }
    )


@pytest.fixture
def pno_units_ports_and_segments_subscriptions():
    return pd.DataFrame(
        {
            "port_locode": [
                "FRCQF",
                "FRDKK",
                "FRDPE",
                "FRLEH",
                "FRLEH",
                "FRZJZ",
                "FRZJZ",
            ],
            "control_unit_id": [1, 2, 4, 2, 3, 2, 3],
            "receive_all_pnos_from_port": [
                False,
                False,
                True,
                False,
                False,
                False,
                False,
            ],
            "unit_subscribed_segments": [
                ["SWW01/02/03"],
                [],
                [],
                [],
                ["SWW01/02/03", "NWW01"],
                [],
                ["SWW01/02/03", "NWW01"],
            ],
        }
    )


@pytest.fixture
def monitorenv_control_units_api_response() -> list:
    return [
        {
            "id": 1,
            "administration": {
                "id": 1,
                "isArchived": False,
                "name": "Administration 1",
            },
            "controlUnitContacts": [],
            "isArchived": False,
            "name": "Unité 1",
            "otherUneededField_1": [1250],
            "otherUneededField_2": None,
        },
        {
            "id": 2,
            "administration": {
                "id": 1,
                "isArchived": False,
                "name": "Administration 1",
            },
            "controlUnitContacts": [
                {
                    "id": 559,
                    "controlUnitId": 2,
                    "email": "some.email@control.unit.4",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "otherUneededField_1": [1250],
                    "otherUneededField_2": None,
                    "name": "OFFICE",
                    "phone": "'00 11 22 33 44 55",
                },
                {
                    "id": 556,
                    "controlUnitId": 2,
                    "email": "alternative@email",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HNO",
                    "phone": "11 11 11 11 11",
                },
                {
                    "id": 557,
                    "controlUnitId": 2,
                    "email": "unused_email.adresse@somewhere",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HO",
                    "phone": "xx xx xx xx xx",
                },
                {
                    "id": 951357,
                    "controlUnitId": 2,
                    "email": "unused_email.adresse@somewhere",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": True,
                    "name": "OPERATIONAL_CENTER_HO",
                    "phone": "",
                },
            ],
            "isArchived": False,
            "name": "Unité 2",
            "otherUneededField_1": [1250],
            "otherUneededField_2": None,
        },
        {
            "id": 3,
            "administration": {
                "id": 1,
                "isArchived": False,
                "name": "Administration 1",
            },
            "controlUnitContacts": [
                {
                    "id": 320,
                    "controlUnitId": 3,
                    "email": "com.email@bla1",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "22 22 22 22 22",
                },
                {
                    "id": 321,
                    "controlUnitId": 3,
                    "email": "com.email@bla2",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "33 33 33 33 33",
                },
                {
                    "id": 322,
                    "controlUnitId": 3,
                    "email": None,
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "UNKNOWN",
                    "phone": "44 44 44 44 44",
                },
            ],
            "isArchived": False,
            "name": "Unité 3",
        },
        {
            "id": 4,
            "administration": {
                "id": 3,
                "isArchived": False,
                "name": "Administration 3",
            },
            "controlUnitContacts": [
                {
                    "id": 1182,
                    "controlUnitId": 4,
                    "email": None,
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "PERMANENT_CONTACT_ONBOARD",
                    "phone": "77 77 77 77 77",
                },
                {
                    "id": 1180,
                    "controlUnitId": 4,
                    "email": "--",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "88 88 88 88 88 (HO) / 99 99 99 99 99 (HNO)",
                },
                {
                    "id": 1181,
                    "controlUnitId": 4,
                    "email": "email4@email.com",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "Unité",
                },
            ],
            "isArchived": False,
            "name": "Unité 4",
        },
        {
            "id": 5,
            "administration": {
                "id": 1,
                "isArchived": False,
                "name": "Administration 1",
            },
            "controlUnitContacts": [
                {
                    "id": 382,
                    "controlUnitId": 5,
                    "email": "------",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OFFICE",
                    "phone": "0000000000",
                },
                {
                    "id": 381,
                    "controlUnitId": 5,
                    "email": None,
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "ONBOARD_PHONE",
                    "phone": "0000000000",
                },
                {
                    "id": 379,
                    "controlUnitId": 5,
                    "email": "----",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HNO",
                    "phone": "00000000000",
                },
                {
                    "id": 380,
                    "controlUnitId": 5,
                    "email": "--",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HO",
                    "phone": "00000000000",
                },
            ],
            "isArchived": False,
            "name": "Unité 5",
        },
        {
            "id": 6,
            "administration": {
                "id": 1,
                "isArchived": False,
                "name": "Administration 1",
            },
            "controlUnitContacts": [
                {
                    "id": 631,
                    "controlUnitId": 6,
                    "email": "****",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": True,
                    "name": "UNKNOWN",
                },
                {
                    "id": 1540,
                    "controlUnitId": 6,
                    "email": "-----",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": None,
                },
                {
                    "id": 1541,
                    "controlUnitId": 6,
                    "email": "",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": False,
                    "name": "Référent police",
                    "phone": None,
                },
            ],
            "isArchived": False,
            "name": "Unité 6",
        },
        {
            "id": 7,
            "administration": {
                "id": 1,
                "isArchived": False,
                "name": "Administration 1",
            },
            "controlUnitContacts": [
                {
                    "id": 1540,
                    "controlUnitId": 7,
                    "email": "archived.email",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "55 55 55 55 55",
                },
            ],
            "isArchived": True,
            "name": "Unité 7 (historique)",
        },
    ]


@pytest.fixture
def monitorenv_control_units() -> pd.DataFrame:
    return [
        ControlUnit(
            control_unit_id=2,
            control_unit_name="Unité 2",
            administration="Administration 1",
            emails=["alternative@email", "some.email@control.unit.4"],
            phone_numbers=["'00 11 22 33 44 55"],
        ),
        ControlUnit(
            control_unit_id=3,
            control_unit_name="Unité 3",
            administration="Administration 1",
            emails=[],
            phone_numbers=["44 44 44 44 44"],
        ),
        ControlUnit(
            control_unit_id=4,
            control_unit_name="Unité 4",
            administration="Administration 3",
            emails=["email4@email.com"],
            phone_numbers=[],
        ),
    ]


@pytest.fixture
def segments_of_year() -> pd.DataFrame:
    df = pd.read_csv(
        TEST_DATA_LOCATION / "csv/segments.csv",
        converters={
            "gears": literal_eval,
            "fao_areas": literal_eval,
            "target_species": literal_eval,
            "vessel_types": literal_eval,
        },
    )

    df = df[df.year == 2050].reset_index(drop=True)
    return df
