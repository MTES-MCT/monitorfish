import os
import pathlib
from typing import List, Union
from zipfile import ZipFile

import prefect
from prefect import Flow, task
from prefect.tasks.control_flow import case

from config import ERS_FILES_LOCATION
from src.db_config import create_engine
from src.pipeline.parsers.ers import batch_parse
from src.pipeline.processing import drop_rows_already_in_table, to_json
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.utils import get_table, move, psql_insert_copy

RECEIVED_DIRECTORY = ERS_FILES_LOCATION / "received"
TREATED_DIRECTORY = ERS_FILES_LOCATION / "treated"
NON_TREATED_DIRECTORY = ERS_FILES_LOCATION / "non_treated"
ERROR_DIRECTORY = ERS_FILES_LOCATION / "error"


####################################### HELPERS #######################################


def get_message_type(zipfile_name: str) -> str:
    """For a zipfile name like UN_JBE202001123614.zip or ERS3_ACK_JBE202102365445.zip,
    extract the message type, which may be one of :

    - ERS3 (a set of messages in ERS3 format)
    - ERS3_ACK (a set of acknowledgement statuses from BIA for ERS3 messages)
    - UN (a set of FLUX messages)"""
    name_parts = zipfile_name.split("_")
    message_type = "_".join(name_parts[:-1])
    return message_type


######################################## TASKS ########################################


@task(checkpoint=False)
def extract_zipfiles(
    input_dir: pathlib.Path,
    treated_dir: pathlib.Path,
    non_treated_dir: pathlib.Path,
    error_dir: pathlib.Path,
) -> List[dict]:
    """
    Scans ``input_dir``, in which ers zipfiles are expected to be arranged in a
    hierarchy folders like : year / month / zipfiles. Yields found zipfiles
    along with the corresponding paths of :

    - ``input_directory`` where the zipfile is located
    - ``treated_directory`` where the zipfile will be transfered after integration into
      the monitorfish database
    - ``non_treated_directory`` where the zipfile will be transfered if it is a FLUX type
      of message (currently not handled)
    - ``error_directory`` if an error occurs during the treatment of messages.
    """

    logger = prefect.context.get("logger")

    expected_months = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
    ]

    expected_years = list(map(str, range(2000, 2050)))

    years = os.listdir(input_dir)

    res = []
    n = 0

    for year in years:
        if year not in expected_years:
            logger.warning(f"Unexpected year {year}. Skipping directory.")
            continue

        logger.info(f"Starting extraction of ERS messages for year {year}.")
        months = os.listdir(input_dir / year)

        for month in months:
            if month not in expected_months:
                logger.warning(f"Unexpected month {month}. Skipping directory.")
                continue

            logger.info(f"Starting extraction of ERS messages for {year}/{month}.")

            zipfile_input_dir = input_dir / year / month
            zipfile_treated_dir = treated_dir / year / month
            zipfile_non_treated_dir = non_treated_dir / year / month
            zipfile_error_dir = error_dir / year / month

            files = os.listdir(zipfile_input_dir)

            zipfiles = list(filter(lambda s: s[-4:] == ".zip", files))
            non_zipfiles = list(filter(lambda s: s[-4:] != ".zip", files))

            if len(non_zipfiles) > 0:
                logger.warning(
                    f"Non zip files found in {year} / {month}."
                    + "Moving files to error_directory."
                )
                for non_zipfile in non_zipfiles:
                    move(
                        zipfile_input_dir / non_zipfile,
                        zipfile_error_dir,
                        if_exists="replace",
                    )

            for zipfile in zipfiles:
                res.append(
                    {
                        "full_name": zipfile,
                        "input_dir": zipfile_input_dir,
                        "treated_dir": zipfile_treated_dir,
                        "non_treated_dir": zipfile_non_treated_dir,
                        "error_dir": zipfile_error_dir,
                    }
                )
                n += 1
                if n == 200:
                    return res

    return res


@task(checkpoint=False)
def extract_xmls_from_zipfile(zipfile: Union[None, dict]) -> Union[None, dict]:

    if zipfile:
        logger = prefect.context.get("logger")

        logger.info(f"Extracting zipfile {zipfile['full_name']}.")
        message_type = get_message_type(zipfile["full_name"])

        # Handle ERS3 messages and acknoledgement statuses
        if message_type in ["ERS3", "ERS3_ACK"]:
            with ZipFile(zipfile["input_dir"] / zipfile["full_name"]) as zipobj:
                xml_filenames = zipobj.namelist()
                xml_messages = []
                for xml_filename in xml_filenames:
                    with zipobj.open(xml_filename, mode="r") as f:
                        xml_messages.append(f.read().decode("utf-8"))
                zipfile["xml_messages"] = xml_messages
                return zipfile

        # Handle FLUX messages (move them to non_treated_directory
        # as there is currently no parser available)
        elif message_type in ["UN"]:
            logger.info(
                f"Skipping zipfile {zipfile['full_name']} of type {message_type} "
                + "which is currently not handled. "
                + f"Moving {zipfile['full_name']} to non-treated directory."
            )
            move(
                zipfile["input_dir"] / zipfile["full_name"],
                zipfile["non_treated_dir"],
                if_exists="replace",
            )

        # Move unexpected file types to error directory
        else:
            logger.error(
                f"Unexpected message type '{message_type}' ({zipfile}). "
                + f"Moving {zipfile} to error directory."
            )
            move(
                zipfile["input_dir"] / zipfile["full_name"],
                zipfile["error_dir"],
                if_exists="replace",
            )


@task(checkpoint=False)
def parse_xmls(zipfile: Union[None, dict]) -> Union[None, dict]:
    logger = prefect.context.get("logger")
    if zipfile:
        logger.info(f"Parsing messages of zipfile {zipfile['full_name']}")
        parsed_batch = batch_parse(zipfile["xml_messages"])
        zipfile.pop("xml_messages")
        zipfile = {**zipfile, **parsed_batch}
        return zipfile
    else:
        pass


@task(checkpoint=False)
def clean(zipfile: Union[None, dict]) -> Union[None, dict]:
    logger = prefect.context.get("logger")
    if zipfile:
        logger.info(
            "Removing QUE and RSP messages from messages of "
            + f"zipfile {zipfile['full_name']}."
        )
        zipfile["parsed"] = zipfile["parsed"][
            zipfile["parsed"].operation_type.isin(["DAT", "DEL", "COR", "RET"])
        ]
        zipfile["parsed_with_xml"] = zipfile["parsed_with_xml"][
            zipfile["parsed_with_xml"].operation_type.isin(["DAT", "DEL", "COR", "RET"])
        ]
        return zipfile
    else:
        pass


@task(checkpoint=False)
def load_ers(cleaned_data: List[dict]):
    """Loads ERS data into public.ers and public.ers_messages tables.

    Args:
        cleaned_data (list) : list of dictionaries (output of `clean` task)
    """
    schema = "public"
    ers_table_name = "ers"
    ers_messages_table_name = "ers_messages"
    engine = create_engine("monitorfish_remote")
    logger = prefect.context.get("logger")

    # Check that ers tables exist
    get_table(ers_table_name, schema, engine, logger)
    ers_messages_table = get_table(ers_messages_table_name, schema, engine, logger)

    cleaned_data = list(filter(lambda x: True if x else False, cleaned_data))

    for ers in cleaned_data:

        with engine.begin() as connection:
            parsed = ers["parsed"]
            parsed_with_xml = ers["parsed_with_xml"]

            # Drop rows for which the operation number already exists in the
            # ers_messages database

            parsed_with_xml = drop_rows_already_in_table(
                df=parsed_with_xml,
                df_column_name="operation_number",
                table=ers_messages_table,
                table_column_name="operation_number",
                connection=connection,
                logger=logger,
            )

            parsed = parsed[
                parsed.operation_number.isin(parsed_with_xml.operation_number)
            ]

            if len(parsed_with_xml) > 0:
                n_lines = len(parsed_with_xml)
                logger.info(f"Inserting {n_lines} messages in ers_messages table.")

                parsed_with_xml.to_sql(
                    name=ers_messages_table_name,
                    con=connection,
                    schema=schema,
                    index=False,
                    method=psql_insert_copy,
                    if_exists="append",
                )

            if len(parsed) > 0:
                n_lines = len(parsed)
                logger.info(f"Inserting {n_lines} messages in ers table.")

                # Serialize dicts to prepare for insertion as json in database
                parsed["value"] = parsed.value.map(to_json)

                parsed.to_sql(
                    name=ers_table_name,
                    con=connection,
                    schema=schema,
                    index=False,
                    method=psql_insert_copy,
                    if_exists="append",
                )

            if ers["batch_generated_errors"]:
                logger.error(
                    "Errors occurred during parsing of some of the messages. "
                    f"Moving {ers['full_name']} to error directory."
                )
                move(
                    ers["input_dir"] / ers["full_name"],
                    ers["error_dir"],
                    if_exists="replace",
                )
            else:
                move(
                    ers["input_dir"] / ers["full_name"],
                    ers["treated_dir"],
                    if_exists="replace",
                )


with Flow("ERS") as flow:

    # Only run if the previous run has finished running
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        zipfiles = extract_zipfiles(
            RECEIVED_DIRECTORY,
            TREATED_DIRECTORY,
            NON_TREATED_DIRECTORY,
            ERROR_DIRECTORY,
        )
        zipfiles = extract_xmls_from_zipfile.map(zipfiles)
        zipfiles = parse_xmls.map(zipfiles)
        zipfiles = clean.map(zipfiles)
        load_ers(zipfiles)
