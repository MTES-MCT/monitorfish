import prefect
from prefect import Flow, task

from src.db_config import create_engine
from src.read_query import read_saved_query
from src.utils.database import get_table, psql_insert_copy

# engins du DEP
# taille du bateau
# s'il a le JPE ou non
# MMSI
# quartier du navire
# cadencement
# segment de flotte


@task(checkpoint=False)
def extract_last_departures():
    return read_saved_query(
        "monitorfish_remote", "pipeline/queries/monitorfish/last_departures.sql"
    )


@task(checkpoint=False)
def extract_last_positions():
    return read_saved_query(
        "monitorfish_remote", "pipeline/queries/monitorfish/last_positions.sql"
    )


@task(checkpoint=False)
def extract_vessels():
    return read_saved_query(
        "monitorfish_remote", "pipeline/queries/monitorfish/vessels.sql"
    )
