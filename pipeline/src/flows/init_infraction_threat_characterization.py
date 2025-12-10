from ast import literal_eval

import pandas as pd
from prefect import flow, get_run_logger, task
from sqlalchemy import DDL, Table

from config import LIBRARY_LOCATION
from src.db_config import create_engine
from src.generic_tasks import load
from src.shared_tasks.infrastructure import get_table
from src.utils import delete


@task
def extract_threat():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/threats.csv",
        encoding="utf8",
    )


@task
def extract_threat_characterization():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/threat_characterizations.csv",
        encoding="utf8",
    )


@task
def extract_infraction_threat_characterization():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/infraction_threat_characterization.csv",
        encoding="utf8",
    )


@task
def load_threat_characterization_and_join_table(
    threats: pd.DataFrame,
    threat_characterizations: pd.DataFrame,
    infraction_threat_characterization: pd.DataFrame,
    threats_table: Table,
    threat_characterizations_table: Table,
    infraction_threat_characterization_table: Table,
):
    logger = get_run_logger()

    e = create_engine("monitorfish_remote")

    with e.begin() as con:
        delete(
            tables=[infraction_threat_characterization_table, threat_characterizations_table, threats_table],
            connection=con,
            logger=logger,
        )

        load(
            threats,
            table_name="threats",
            schema="public",
            connection=con,
            logger=logger,
            how="append",
            init_ddls=[
                DDL(
                    "SELECT setval("
                    "pg_get_serial_sequence('threats', 'id'), 1, false"
                    ")"
                )
            ],
        )

        load(
            threat_characterizations,
            table_name="threat_characterizations",
            schema="public",
            connection=con,
            logger=logger,
            how="append",
            init_ddls=[
                DDL(
                    "SELECT setval("
                    "pg_get_serial_sequence('threat_characterizations', 'id'), 1, false"
                    ")"
                )
            ],
        )

        load(
            infraction_threat_characterization,
            table_name="infraction_threat_characterization",
            schema="public",
            connection=con,
            logger=logger,
            how="append",
            init_ddls=[
                DDL(
                    "SELECT setval("
                    "pg_get_serial_sequence('infraction_threat_characterization', 'id'), 1, false"
                    ")"
                )
            ],
        )


@flow(name="Monitorfish - Init infractions threat characterization")
def init_infraction_threat_characterization_flow():
    threats_table = get_table("threats")
    threat_characterizations_table = get_table("threat_characterizations")
    infraction_threat_characterization_table = get_table("infraction_threat_characterization")
    threats = extract_threat()
    threat_characterizations = extract_threat_characterization()
    infraction_threat_characterization = extract_infraction_threat_characterization()
    load_threat_characterization_and_join_table(
        threats, threat_characterizations, infraction_threat_characterization, threats_table, threat_characterizations_table, infraction_threat_characterization_table
    )
