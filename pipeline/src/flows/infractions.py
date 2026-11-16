import requests
from prefect import flow, get_run_logger, task
from sqlalchemy import DDL

from config import INFRACTIONS_CACHE_INVALIDATION_ENDPOINT

from src.generic_tasks import extract, load
from src.sentry import report_flow_failure_to_sentry


@task
def extract_infractions():
    return extract("fmc", "fmc/natinf.sql")


@task
def clean_infractions(infractions):
    infractions.loc[:, "infraction"] = infractions.infraction.map(str.capitalize)
    return infractions


@task
def load_infractions(infractions):
    load(
        infractions,
        table_name="infractions",
        schema="public",
        db_name="monitorfish_remote",
        logger=get_run_logger(),
        how="replace",
        replace_with_truncate=True,
        init_ddls=[
            DDL(
                "ALTER TABLE public.infraction_threat_characterization "
                "DROP CONSTRAINT infraction_threat_characterization_natinf_code_fkey;"
            ),
        ],
        end_ddls=[
            DDL(
                "ALTER TABLE public.infraction_threat_characterization "
                "ADD CONSTRAINT infraction_threat_characterization_natinf_code_fkey "
                "FOREIGN KEY (natinf_code) "
                "REFERENCES public.infractions (natinf_code);"
            ),
        ],
    )


@task
def invalidate_cache():
    requests.put(INFRACTIONS_CACHE_INVALIDATION_ENDPOINT)


@flow(
    name="Monitorfish - Infractions",
    on_failure=[report_flow_failure_to_sentry],
    on_crashed=[report_flow_failure_to_sentry],
)
def infractions_flow():
    infractions = extract_infractions()
    infractions = clean_infractions(infractions)
    loaded_infractions = load_infractions(infractions)
    invalidate_cache(wait_for=[loaded_infractions])
