# from functools import partial

# import prefect
# from prefect import Flow, task

# from src.db_config import create_engine
# from src.pipeline.generic_tasks import extract, load
# from src.read_query import read_saved_query
# from src.utils.database import get_table, psql_insert_copy

# engins du DEP
# taille du bateau
# s'il a le JPE ou non
# MMSI
# quartier du navire
# cadencement
# segment de flotte


# @task
# def extract_last_departures():
#     partial(
#     extract,
#     db_name="monitorfish_remote",
#     query_filepath="monitorfish/last_departures.sql"
# )


# @task(checkpoint=False)
# def extract_last_positions():
#     return read_saved_query(
#         "monitorfish_remote", "monitorfish/last_positions.sql"
#     )


# @task(checkpoint=False)
# def extract_vessels():
#     return read_saved_query(
#         "monitorfish_remote", "monitorfish/vessels.sql"
#     )
