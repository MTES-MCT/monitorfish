import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load


@task(checkpoint=False)
def extract_fishing_gear_codes():
    return extract("ocan", "ocan/codes_engins.sql")


@task(checkpoint=False)
def clean_fishing_gear_codes(fishing_gear_codes):

    fishing_gear_codes = fishing_gear_codes.set_index("fishing_gear_code")

    # Manual changes
    name_changes = {
        "TBS": "Chaluts de fond à crevettes",
        "TMS": "Chaluts pélagiques à crevettes",
    }

    for (gear_code, name) in name_changes.items():
        fishing_gear_codes.loc[gear_code, "fishing_gear"] = name

    category_changes = {
        "OTP": "Chaluts",
        "NS": "Engin inconnu",
        "DRM": "Dragues",
        "OTS": "Engin inconnu",
        "SUX": "Filets tournants",
        "FG": "Engins divers",
        "HAR": "Engins divers",
        "FCN": "Engins divers",
        "SSC": "Sennes traînantes",
        "SDN": "Sennes traînantes",
        "SX": "Sennes traînantes",
        "PS": "Sennes tournantes coulissantes",
        "PS2": "Sennes tournantes coulissantes",
        "PS1": "Sennes tournantes coulissantes",
        "SV": "Sennes tournantes coulissantes",
        "SPR": "Sennes tournantes coulissantes",
        "SB": "Sennes tournantes coulissantes",
    }

    for (gear_code, category) in category_changes.items():
        fishing_gear_codes.loc[gear_code, "fishing_gear_category"] = category

    fishing_gear_codes = fishing_gear_codes.reset_index()

    return fishing_gear_codes


@task(checkpoint=False)
def load_fishing_gear_codes(fishing_gear_codes):
    load(
        fishing_gear_codes,
        table_name="fishing_gear_codes",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        delete_before_insert=True,
    )


with Flow("Fishing gears") as flow:
    fishing_gear_codes = extract_fishing_gear_codes()
    fishing_gear_codes = clean_fishing_gear_codes(fishing_gear_codes)
    load_fishing_gear_codes(fishing_gear_codes)
