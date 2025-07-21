import pandas as pd
from prefect import flow, get_run_logger, task

from config import UNKNOWN_VESSEL_ID
from src.generic_tasks import extract, load
from src.processing import coalesce, concatenate_columns, zeros_ones_to_bools


@task
def extract_french_vessels() -> pd.DataFrame:
    """
    Extracts french vessels from Navpro.

    Returns:
        pd.DataFrame: french vessels
    """
    return extract("ocan", "ocan/french_vessels.sql")


@task
def extract_eu_vessels() -> pd.DataFrame:
    """
    Extracts EU vessels from Navpro.

    Returns:
        pd.DataFrame: EU vessels
    """
    return extract("ocan", "ocan/eu_vessels.sql")


@task
def extract_non_eu_vessels() -> pd.DataFrame:
    """
    Extracts non-EU vessels from Navpro.

    Returns:
        pd.DataFrame: non-EU vessels
    """
    return extract("ocan", "ocan/non_eu_vessels.sql")


@task
def extract_vessels_operators() -> pd.DataFrame:
    """
    Extracts vessel operators (in the sense of "the people or organisation that operate
    or manage the operations of the vessel") data from Poséidon (name, contact info).

    Returns:
        pd.DataFrame: Vessels operators
    """
    return extract("fmc", "fmc/vessels_operators.sql")


@task
def extract_vessels_logbook_equipement() -> pd.DataFrame:
    """
    Extracts vessels logbook equipement data

    Returns:
        pd.DataFrame: Vessels logbook equipment data
    """
    return extract("fmc", "fmc/vessels_logbook_equipment.sql")


@task
def extract_french_vessels_navigation_licences() -> pd.DataFrame:
    """
    Extracts the navigation licence sailing category and expiration date of french
    vessels from Gina.

    Returns:
        pd.DataFrame: French vessels navigation licence information
    """
    return extract("ocan", "ocan/french_vessels_navigation_licences.sql")


@task
def extract_control_charters() -> pd.DataFrame:
    """
    Extracts vessels with the information of whether they are under control charter or
    not from Monitorfish, based on historical control data.

    Returns:
        pd.DataFrame: Vessels with a boolean column `under_charter`
    """
    return extract("monitorfish_remote", "monitorfish/control_charter.sql")


@task
def concat_merge_vessels(
    french_vessels: pd.DataFrame,
    eu_vessels: pd.DataFrame,
    non_eu_vessels: pd.DataFrame,
    vessels_logbook_equipement: pd.DataFrame,
    vessels_operators: pd.DataFrame,
    licences: pd.DataFrame,
    control_charters: pd.DataFrame,
) -> pd.DataFrame:
    """
    Concatenates `french_vessels`, `eu_vessels` and `non_eu_vessels`, then performs a
    left join of the resulting DataFrame with `vessels_operators`, `licences` and
    `control_charters` successively.

    Vessels, identified by their `id` should be unique :

      - accross `french_vessels`, `eu_vessels` and `non_eu_vessels` : a given `id`
        cannot be in more than one of the three DataFrames, and it must be present just
        once (a single row)
      - in  `vessels_operators`, `licences` and `control_charters`: a given `id` can be
        in 1, 2 or all 3 DataFrames, but it cannot have more than one row in each
        DataFrame.

    Args:
        french_vessels (pd.DataFrame): French vessels
        eu_vessels (pd.DataFrame): EU vessels
        non_eu_vessels (pd.DataFrame): non-EU vessels
        vessels_logbook_equipement (pd.DataFrame): vessels logbook equipment data
        vessels_operators (pd.DataFrame): vessels' operators data
        licences (pd.DataFrame): french vessels navigation licences data
        control_charters (pd.DataFrame): vessels under_charter status

    Raises:
        ValueError: if a vessel `id` is duplicated

    Returns:
        pd.DataFrame: merged vessels data
    """
    all_vessels = pd.concat([french_vessels, eu_vessels, non_eu_vessels])

    all_vessels = pd.merge(all_vessels, vessels_logbook_equipement, on="id", how="left")

    all_vessels = pd.merge(all_vessels, vessels_operators, on="id", how="left")

    all_vessels = pd.merge(all_vessels, licences, on="id", how="left")

    all_vessels = pd.merge(all_vessels, control_charters, on="id", how="left")

    all_vessels = all_vessels.fillna({"under_charter": False})

    try:
        assert not all_vessels.duplicated(subset="id").any()
    except AssertionError:
        raise ValueError("Several vessels have the same id. Cannot continue.")

    dtypes = {
        "imo": "category",
        "mmsi": "category",
        "flag_state": "category",
        "district_code": "category",
        "district": "category",
        "vessel_phone_1": "category",
        "vessel_phone_2": "category",
        "vessel_phone_3": "category",
        "vessel_mobile_phone": "category",
        "vessel_fax": "category",
        "vessel_telex": "category",
        "vessel_email_1": "category",
        "vessel_email_2": "category",
        "vessel_type": "category",
        "registry_port": "category",
        "nav_licence_status": "category",
        "sailing_category": "category",
        "sailing_type": "category",
        "operator_email": "category",
        "operator_phone": "category",
        "operator_mobile_phone": "category",
        "operator_fax": "category",
        "proprietor_name": "category",
        "proprietor_email": "category",
        "proprietor_phone": "category",
        "proprietor_mobile_phone": "category",
        "fishing_gear_main": "category",
        "fishing_gear_secondary": "category",
        "fishing_gear_third": "category",
        "logbook_equipment_status": "category",
        "operator_email_1": "category",
        "operator_email_2": "category",
        "operator_phone_1": "category",
        "operator_phone_2": "category",
        "operator_name_pos": "category",
        "operator_email_pos": "category",
        "operator_phone_1_pos": "category",
        "operator_phone_2_pos": "category",
        "operator_phone_3_pos": "category",
        "operator_mobile_phone_pos": "category",
        "operator_fax_pos": "category",
        "under_charter": bool,
    }

    all_vessels = all_vessels.astype(dtypes)

    return all_vessels


@task
def clean_vessels(all_vessels: pd.DataFrame) -> pd.DataFrame:
    """
    Combines and concatenates data of some columns as coalesced values or lists (phone
    numbers, emails...)

    Args:
        all_vessels (pd.DataFrame): Output of concat_merge_vessels

    Returns:
        pd.DataFrame: vessels data ready to be loaded.
    """

    logger = get_run_logger()

    # Concatenate several columns into lists when several values can be kept.
    logger.info("Combining columns into lists: emails, phone numbers...")
    concat_cols = {
        "proprietor_phones": ["proprietor_phone", "proprietor_mobile_phone"],
        "proprietor_emails": ["proprietor_email"],
        "operator_phones_navpro": [
            "operator_phone",
            "operator_phone_1",
            "operator_phone_2",
            "operator_mobile_phone",
        ],
        "operator_phones_poseidon": [
            "operator_phone_1_pos",
            "operator_phone_2_pos",
            "operator_phone_3_pos",
            "operator_mobile_phone_pos",
        ],
        "vessel_phones": [
            "vessel_phone_1",
            "vessel_phone_2",
            "vessel_phone_3",
            "vessel_mobile_phone",
        ],
        "vessel_emails": [
            "vessel_email_1",
            "vessel_email_2",
        ],
        "declared_fishing_gears": [
            "fishing_gear_main",
            "fishing_gear_secondary",
            "fishing_gear_third",
        ],
    }

    res = all_vessels.copy(deep=True)
    for col_name, cols_list in concat_cols.items():
        res.loc[:, col_name] = concatenate_columns(res, cols_list)

    # Replacing empty lists with None values is required to coalesce phones lists
    # properly
    res.operator_phones_poseidon = res.operator_phones_poseidon.where(
        res.operator_phones_poseidon.map(lambda x: x != []), None
    )
    res.operator_phones_navpro = res.operator_phones_navpro.where(
        res.operator_phones_navpro.map(lambda x: x != []), None
    )

    logger.info("Columns combined into lists.")

    # Combine several columns into one value when only one value must be kept.
    logger.info("Combining columns into single values: names, characteristics...")
    combine_cols = {
        "operator_name": [
            "operator_name_pos",
            "operator_name",
        ],
        "operator_email": [
            "operator_email_pos",
            "operator_email",
            "operator_email_1",
            "operator_email_2",
        ],
        "operator_phones": [
            "operator_phones_poseidon",
            "operator_phones_navpro",
        ],
        "operator_fax": ["operator_fax_pos", "operator_fax"],
        "operator_mobile_phone": [
            "operator_mobile_phone_pos",
            "operator_mobile_phone",
        ],
    }

    for col_name, cols_list in combine_cols.items():
        res.loc[:, col_name] = coalesce(res[cols_list])
    logger.info("Columns combined into single values.")

    # Data conversions
    logger.info("Converting data...")
    res["has_esacapt"] = zeros_ones_to_bools(res.has_esacapt).fillna(False)

    # Sort columns
    logger.info("Sorting columns...")

    columns = [
        "id",
        "imo",
        "cfr",
        "external_immatriculation",
        "mmsi",
        "ircs",
        "vessel_name",
        "flag_state",
        "width",
        "length",
        "district",
        "district_code",
        "gauge",
        "registry_port",
        "power",
        "vessel_type",
        "sailing_category",
        "sailing_type",
        "declared_fishing_gears",
        "nav_licence_status",
        "nav_licence_expiration_date",
        "nav_licence_extension_date",
        "proprietor_name",
        "proprietor_phones",
        "proprietor_emails",
        "operator_name",
        "operator_phones",
        "operator_mobile_phone",
        "operator_email",
        "operator_fax",
        "vessel_phones",
        "vessel_mobile_phone",
        "vessel_emails",
        "vessel_fax",
        "vessel_telex",
        "under_charter",
        "logbook_equipment_status",
        "has_esacapt",
    ]
    res = res[columns]
    logger.info("Columns sorted.")

    return res


@task
def add_unknown_vessel(all_vessels: pd.DataFrame) -> pd.DataFrame:
    """
    Adds an "UNKNOWN" vessel to the list, to be used when reporting an action on a
    vessel that is not part of the officiel vessels list.

    Args:
        all_vessels (pd.DataFrame): List of vessels

    Returns:
        pd.DataFrame: Same as input with one added "Unknown vessel"

    Raises:
        AssertionError: if one of the input vessels has the id reserved for the UNKNOWN
        vessel
    """

    try:
        assert UNKNOWN_VESSEL_ID not in all_vessels.id.values
    except AssertionError:
        logger = get_run_logger()
        logger.error(
            f"Reserved unkwnown vessel id {UNKNOWN_VESSEL_ID} "
            "was found in the vessels list."
        )
        raise

    unknown_vessel = pd.DataFrame(
        {
            "id": [UNKNOWN_VESSEL_ID],
            "cfr": ["UNKNOWN"],
            "ircs": ["UNKNOWN"],
            "external_immatriculation": ["UNKNOWN"],
            "vessel_name": ["UNKNOWN"],
            "has_esacapt": False,
        }
    )

    all_vessels = pd.concat([all_vessels, unknown_vessel])

    return all_vessels


@task
def load_vessels(all_vessels: pd.DataFrame):
    """
    Replaces the content of the `vessels` table with the content of the `all_vessels`
    DataFrame.

    Args:
        all_vessels (pd.DataFrame): vessels data to load
    """

    load(
        all_vessels,
        table_name="vessels",
        schema="public",
        db_name="monitorfish_remote",
        logger=get_run_logger(),
        how="replace",
        replace_with_truncate=True,
        pg_array_columns=[
            "declared_fishing_gears",
            "operator_phones",
            "proprietor_phones",
            "proprietor_emails",
            "vessel_phones",
            "vessel_emails",
        ],
    )


@flow(name="Vessels")
def vessels_flow():
    # Extract
    french_vessels = extract_french_vessels.submit()
    eu_vessels = extract_eu_vessels.submit()
    non_eu_vessels = extract_non_eu_vessels.submit()
    vessels_operators = extract_vessels_operators.submit()
    licences = extract_french_vessels_navigation_licences.submit()
    control_charters = extract_control_charters.submit()
    vessels_logbook_equipement = extract_vessels_logbook_equipement.submit()

    # Transform
    all_vessels = concat_merge_vessels(
        french_vessels,
        eu_vessels,
        non_eu_vessels,
        vessels_logbook_equipement,
        vessels_operators,
        licences,
        control_charters,
    )
    all_vessels = clean_vessels(all_vessels)
    all_vessels = add_unknown_vessel(all_vessels)

    # Load
    load_vessels(all_vessels)
