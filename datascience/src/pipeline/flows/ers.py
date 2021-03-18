import copy
import logging
import os
import pathlib
from typing import Generator, Union
from zipfile import ZipFile

import pandas as pd
import prefect
import sqlalchemy
from prefect import Flow, Parameter, task
from sqlalchemy import DateTime, MetaData, String, Table, select, text
from sqlalchemy.dialects.postgresql import JSONB

from src.db_config import create_engine
from src.pipeline.parsers.ers import batch_parse
from src.pipeline.processing import dict2json
from src.pipeline.utils import delete, grouper, move
from src.read_query import read_query
from src.utils.database import get_table, psql_insert_copy

ERS_DIRECTORY = pathlib.Path("../../../data/raw/ers/dam/")
RECEIVED_DIRECTORY = ERS_DIRECTORY / "received"
TREATED_DIRECTORY = ERS_DIRECTORY / "treated"
NON_TREATED_DIRECTORY = ERS_DIRECTORY / "non_treated"
ERROR_DIRECTORY = ERS_DIRECTORY / "error"


def list_years_months_zipfiles(
    input_dir: pathlib.Path,
    treated_dir: pathlib.Path,
    non_treated_dir: pathlib.Path,
    error_dir: pathlib.Path,
    logger: logging.Logger,
) -> Generator[dict, None, None]:
    """Scans input_dir, in which ers zipfiles are expected to be arranged in a
     hierarchy folders like : year / month / zipfiles.
    Yields founds zipfiles along with the corresponding paths of :
    - input_directory where the zipfile is located
    - treated_directory where the zipfile will be transfered after integration into the
    monitorfish database
    - non_treated_directory where the zipfile will be transfered if it is a FLUX type
    of message (currently not handled)
    - error_directory if an error occurs during the treatment of messages.
    """

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
                    move(zipfile_input_dir / non_zipfile, zipfile_error_dir)

            for zipfile in zipfiles:
                yield {
                    "full_name": zipfile,
                    "input_dir": zipfile_input_dir,
                    "treated_dir": zipfile_treated_dir,
                    "non_treated_dir": zipfile_non_treated_dir,
                    "error_dir": zipfile_error_dir,
                }


def get_message_type(zipfile_name: str) -> str:
    """For zipfile name like UN_JBE202001123614.zip or ERS3_ACK_JBE202102365445.zip,
    extract the message type, which may be one of :
    - ERS3 (a set of messages in ERS3 format)
    - ERS3_ACK (a set of acknowledgement statuses from BIA for ERS3 messages)
    - UN (a set of FLUX messages)"""
    name_parts = zipfile_name.split("_")
    message_type = "_".join(name_parts[:-1])
    return message_type


@task
def extract_ers():

    logger = prefect.context.get("logger")

    for zipfile in list_years_months_zipfiles(
        RECEIVED_DIRECTORY,
        TREATED_DIRECTORY,
        NON_TREATED_DIRECTORY,
        ERROR_DIRECTORY,
        logger,
    ):

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
                raw_ers = copy.deepcopy(zipfile)
                raw_ers["xml_messages"] = xml_messages
                yield raw_ers

        # Handle FLUX messages (move them to non_treated_directory
        # as there is currently no parser available)
        elif message_type in ["UN"]:
            logger.info(
                f"Skipping zipfile {zipfile['full_name']} of type {message_type} "
                + "which is currently not handled. "
                + f"Moving {zipfile['full_name']} to non-treated directory."
            )
            move(
                zipfile["input_dir"] / zipfile["full_name"], zipfile["non_treated_dir"]
            )

        # Move unexpected file types to error directory
        else:
            logger.error(
                f"Unexpected message type '{message_type}' ({zipfile}). "
                + f"Moving {zipfile} to error directory."
            )
            move(zipfile["input_dir"] / zipfile["full_name"], zipfile["error_dir"])


@task
def parse_xml(raw_ers_iter: Generator[dict, None, None]) -> Generator[dict, None, None]:
    logger = prefect.context.get("logger")
    for raw_ers in raw_ers_iter:
        logger.info(f"Parsing messages of zipfile {raw_ers['full_name']}")
        parsed_batch = batch_parse(raw_ers["xml_messages"])
        parsed_ers = copy.deepcopy(raw_ers)
        parsed_ers.pop("xml_messages")
        parsed_ers = {**parsed_ers, **parsed_batch}
        yield parsed_ers


@task
def clean(parsed_ers_iter: Generator[dict, None, None]) -> Generator[dict, None, None]:
    logger = prefect.context.get("logger")
    for parsed_ers in parsed_ers_iter:
        logger.info(
            "Removing QUE and RSP messages from messages of "
            + f"zipfile {parsed_ers['full_name']}."
        )
        ers = copy.deepcopy(parsed_ers)
        ers["parsed"] = ers["parsed"][
            ers["parsed"].operation_type.isin(["DAT", "DEL", "COR", "RET"])
        ]
        ers["parsed_with_xml"] = ers["parsed_with_xml"][
            ers["parsed_with_xml"].operation_type.isin(["DAT", "DEL", "COR", "RET"])
        ]
        yield ers


def drop_rows_already_in_table(
    df: pd.DataFrame,
    df_column_name: str,
    table: sqlalchemy.Table,
    table_column_name: str,
    connection: sqlalchemy.engine.base.Connection,
    logger: logging.Logger,
) -> pd.DataFrame:
    """Removes rows from the input DataFrame `df` in which the column `df_column_name`
    contains values that are already present in the column `table_column_name` of the
    table `table`, and returns the filtered DataFrame."""

    df_n_rows = len(df)
    df_ids = tuple(df[df_column_name].unique())
    df_n_ids = len(df_ids)

    statement = select([getattr(table.c, table_column_name)]).where(
        getattr(table.c, table_column_name).in_(df_ids)
    )

    df_ids_already_in_table = tuple(
        pd.read_sql(statement, connection)[table_column_name]
    )

    # Remove keys already present in the database table from df
    res = df[~df[df_column_name].isin(df_ids_already_in_table)]

    # Remove possible duplicate ids in df
    res = res[~res[df_column_name].duplicated()]

    res_n_rows = len(res)
    res_n_ids = res[df_column_name].nunique()

    log = (
        f"From {df_n_rows} rows with {df_n_ids} distinct {df_column_name} values, "
        + f"{res_n_rows} rows with {res_n_ids} distinct {df_column_name} values "
        + "are new and will be inserted in the database."
    )

    logger.info(log)
    return res


@task
def load_ers(ers_iter: Generator[dict, None, None]):
    """Loads parsed ERS data into public.ers and public.ers_messages tables.

    Args:
        parsed (Iterator) : iterator of dictionaries (output of `clean` task)
        if_exists (str) : one of
            append : append data to existing tables
            replace : delete all data from existing tables then insert data
    """
    schema = "public"
    ers_table_name = "ers"
    ers_messages_table_name = "ers_messages"
    engine = create_engine("monitorfish_remote")
    logger = prefect.context.get("logger")

    # Check that ers tables exist
    get_table(ers_table_name, schema, engine, logger)
    ers_messages_table = get_table(ers_messages_table_name, schema, engine, logger)

    for ers in ers_iter:
        with engine.begin() as connection:
            parsed = ers["parsed"]
            parsed_with_xml = ers["parsed_with_xml"]

            # Drop rows for which the operation number already exists in the
            # ers_messages database

            parsed = drop_rows_already_in_table(
                df=parsed,
                df_column_name="operation_number",
                table=ers_messages_table,
                table_column_name="operation_number",
                connection=connection,
                logger=logger,
            )

            parsed_with_xml = drop_rows_already_in_table(
                df=parsed_with_xml,
                df_column_name="operation_number",
                table=ers_messages_table,
                table_column_name="operation_number",
                connection=connection,
                logger=logger,
            )

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
                parsed["value"] = parsed.value.map(dict2json)

                parsed.to_sql(
                    name=ers_table_name,
                    con=connection,
                    schema=schema,
                    index=False,
                    method=psql_insert_copy,
                    if_exists="append",
                )

            if ers["batch_generated_errors"]:
                move(ers["input_dir"] / ers["full_name"], ers["error_dir"])
            else:
                move(ers["input_dir"] / ers["full_name"], ers["treated_dir"])


with Flow("Extract parse load ERS messages") as flow:
    raw_xml = extract_ers()
    parsed_data = parse_xml(raw_xml)
    cleaned_data = clean(parsed_data)
    load_ers(cleaned_data)
