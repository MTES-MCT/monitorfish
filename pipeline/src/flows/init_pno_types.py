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
def extract_pno_types():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/pno_types.csv",
        encoding="utf8",
        dtype={"has_designated_ports": bool},
    )


@task
def extract_pno_type_rules():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/pno_type_rules.csv",
        encoding="utf8",
        converters=dict.fromkeys(
            ["species", "fao_areas", "cgpm_areas", "gears", "flag_states"], literal_eval
        ),
    )


@task
def load_pno_types_and_rules(
    pno_types: pd.DataFrame,
    pno_type_rules: pd.DataFrame,
    pno_types_table: Table,
    pno_type_rules_table: Table,
):
    logger = get_run_logger()

    e = create_engine("monitorfish_remote")

    with e.begin() as con:
        delete(
            tables=[pno_type_rules_table, pno_types_table],
            connection=con,
            logger=logger,
        )

        load(
            pno_types,
            table_name="pno_types",
            schema="public",
            connection=con,
            logger=logger,
            how="append",
            end_ddls=[
                DDL(
                    "SELECT setval("
                    "pg_get_serial_sequence('pno_types', 'id'), "
                    "coalesce(max(id),0) + 1, false"
                    ") "
                    "FROM pno_types;"
                )
            ],
        )

        load(
            pno_type_rules,
            table_name="pno_type_rules",
            schema="public",
            connection=con,
            logger=logger,
            how="append",
            pg_array_columns=[
                "species",
                "fao_areas",
                "cgpm_areas",
                "gears",
                "flag_states",
            ],
            init_ddls=[
                DDL(
                    "SELECT setval("
                    "pg_get_serial_sequence('pno_type_rules', 'id'), 1, false"
                    ")"
                )
            ],
        )


@flow(name="Init pno types")
def init_pno_types_flow():
    pno_types_table = get_table("pno_types")
    pno_type_rules_table = get_table("pno_type_rules")
    pno_types = extract_pno_types()
    pno_type_rules = extract_pno_type_rules()
    load_pno_types_and_rules(
        pno_types, pno_type_rules, pno_types_table, pno_type_rules_table
    )
