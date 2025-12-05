from prefect import flow, get_run_logger, task

from src.generic_tasks import extract, load


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
    )


@flow(name="Monitorfish - Infractions")
def infractions_flow():
    infractions = extract_infractions()
    infractions = clean_infractions(infractions)
    load_infractions(infractions)
