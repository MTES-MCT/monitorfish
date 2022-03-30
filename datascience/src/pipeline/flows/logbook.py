import os
import re
from enum import Enum
from pathlib import Path
from typing import List, Union
from zipfile import ZipFile

import prefect
from prefect import Flow, Parameter, task
from prefect.tasks.control_flow import case

from config import ERS_FILES_LOCATION
from src.db_config import create_engine
from src.pipeline.parsers.ers import ers
from src.pipeline.parsers.flux import flux
from src.pipeline.processing import drop_rows_already_in_table, to_json
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.utils import get_table, move, psql_insert_copy

RECEIVED_DIRECTORY = ERS_FILES_LOCATION / "received"
TREATED_DIRECTORY = ERS_FILES_LOCATION / "treated"
ERROR_DIRECTORY = ERS_FILES_LOCATION / "error"


class LogbookZippedFileType(Enum):
    ERS3 = "ERS3"
    ERS3_ACK = "ERS3_ACK"
    UN = "UN"


class LogbookTransmissionFormat(Enum):
    ERS3 = "ERS3"
    FLUX = "FLUX"

    @staticmethod
    def from_zipped_file_type(t: LogbookZippedFileType):
        mapping = {
            LogbookZippedFileType.ERS3: LogbookTransmissionFormat.ERS3,
            LogbookZippedFileType.ERS3_ACK: LogbookTransmissionFormat.ERS3,
            LogbookZippedFileType.UN: LogbookTransmissionFormat.FLUX,
        }
        return mapping[t]


####################################### HELPERS #######################################


def get_logbook_zipped_file_type(zipfile_name: str) -> LogbookZippedFileType:
    """Takes a zipfile name like UN_JBE202001123614.zip or ERS3_ACK_JBE202102365445.zip
    and returns the coresponding `LogbookZippedFileType`, based on pattern matching.

    The expected pattern is of the form

        `<prefix>_JBE<YYYYMMXXXXXX>.zip`

    where :

    * prefix is one of the `LogbookZippedFileType` enum values
    * Y, M and X are digits

    Args:
        zipfile_name (str): name of a zipfile containing logbook data.

    Returns:
        LogbookZippedFileType: the type of data corresponding to the name of the
          zipfile

    Raises:
        ValueError: if the name does not match the expected pattern or the matched
          string does not correspond to a known `LogbookZippedFileType`.

    Examples:
        >>> get_logbook_zipped_file_type("UN_JBE2020010199999.zip")
        <LogbookZippedFileType.UN: 'UN'>

        >>> get_logbook_zipped_file_type("UN_JBE20200101999999.zip")
        ValueError

        >>> get_logbook_zipped_file_type("UN_JBE2020010199999.txt")
        ValueError
    """
    zipfile_name_pattern = r"^(?P<logbook_type>.*)_JBE\d{12}.zip"
    match = re.match(zipfile_name_pattern, zipfile_name)

    try:
        assert match
        return LogbookZippedFileType[match["logbook_type"]]
    except (AssertionError, KeyError):
        raise ValueError(
            (
                "Unexpected file name. Files containing logbook data are expected to "
                f"have a name matching the pattern {zipfile_name_pattern}, with "
                "`logbook_type` equal to one of "
                f"{list(map(lambda s: s.name, LogbookZippedFileType))} .Got "
                f"{zipfile_name} which does not match."
            )
        )


######################################## TASKS ########################################


@task(checkpoint=False)
def extract_zipfiles(
    input_dir: Path,
    treated_dir: Path,
    error_dir: Path,
) -> List[dict]:
    """Scans `input_dir`, in which logbook zipfiles are expected to be arranged in a
    hierarchy of folders like by year / month / zipfiles, and returns a list of `dict`
    that describe the zipfiles found.

    Files whose name does not match the expected pattern (see
    `get_logbook_zipped_file_type` for details) are moved to `error_dir`.

    Files located in `input_dir` but whose location does not match the expected
    year / month hierarchy of subfolders are ignored.

    Args:
        input_dir (Path): location of input zipfiles. Zipfiles are expected to be
          organized in subfolers inside this directory :

            - by year
            - by month, inside yearly subfolders

        treated_dir (Path): directory where zipfiles are to be transfered after
          integration into the monitorfish database
        error_dir (Path): directory where zipfiles are to be transfered if an error
          occurs during their treatment

    Returns:
        List[dict]: list of `dict`, one for each of the found zipfiles. Each `dict` in
          the list has the following elements :

          - full_name (`str`): name of the zipfile, e.g.g. "UN_JBE_202001999999.zip"
          - input_dir (`Path`): path of the folder container the zipfile (including
            year/month)
          - treated_dir (`Path`): path where the zipfile should be transfered to
            after integration (year/month subfolder to the supplied `treated_dir`
            argument)
          - error_dir (`Path`): path where the zipfile should be transfered to
            in case of error during its treatment (year/month subfolder to the supplied
            `error_dir` argument)
          - transmission_format (`LogbookTransmissionFormat`): transmission format,
            inferred from the zipfile's name.
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

        logger.info(f"Starting extraction of logbook messages for year {year}.")
        months = os.listdir(input_dir / year)

        for month in months:
            if month not in expected_months:
                logger.warning(f"Unexpected month {month}. Skipping directory.")
                continue

            logger.info(f"Starting extraction of logbook messages for {year}/{month}.")

            zipfile_input_dir = input_dir / year / month
            zipfile_treated_dir = treated_dir / year / month
            zipfile_error_dir = error_dir / year / month

            zipfile_names = os.listdir(zipfile_input_dir)

            for zipfile_name in zipfile_names:
                try:
                    zipped_file_type = get_logbook_zipped_file_type(zipfile_name)
                except ValueError as e:
                    logger.error(e)
                    move(
                        zipfile_input_dir / zipfile_name,
                        zipfile_error_dir,
                        if_exists="replace",
                    )
                    continue

                res.append(
                    {
                        "full_name": zipfile_name,
                        "input_dir": zipfile_input_dir,
                        "treated_dir": zipfile_treated_dir,
                        "error_dir": zipfile_error_dir,
                        "transmission_format": LogbookTransmissionFormat.from_zipped_file_type(
                            zipped_file_type
                        ),
                    }
                )
                n += 1
                if n == 200:
                    return res

    return res


@task(checkpoint=False)
def extract_xmls_from_zipfile(zipfile: Union[None, dict]) -> Union[None, dict]:
    """Takes a `dict` with the following structure :

          - full_name (`str`): name of the zipfile
          - input_dir (`Path`): path of the folder container the zipfile
          - treated_dir (`Path`): path where the zipfile is be transfered after
            integration
          - error_dir (`Path`): path where the zipfile should be transfered
            in case of error during its treatment
          - transmission_format (`LogbookTransmissionFormat`): transmission format

    Opens the corresponding zipfile on the filesystem, reads the xml files it is
    expected to contain, puts the content of these xml files in a list of strings,
    then returns a copy of the input `dict` with an added `xml_messages` item that
    contains that list of strings.

    Args:
        zipfile (Union[None, dict]):

    Returns:
        Union[None, dict]: Copy of the input `dict` with an additionnal `xml_messages`
          item that contains the list of strings contained inside the zipfile
          identified by the `input_dir` and `full_name` in the input dictionnary
    """

    if zipfile:
        logger = prefect.context.get("logger")
        logger.info(f"Extracting zipfile {zipfile['full_name']}.")

        with ZipFile(zipfile["input_dir"] / zipfile["full_name"]) as zipobj:
            xml_filenames = zipobj.namelist()
            xml_messages = []
            for xml_filename in xml_filenames:
                with zipobj.open(xml_filename, mode="r") as f:
                    xml_messages.append(f.read().decode("utf-8"))
            zipfile["xml_messages"] = xml_messages
            return zipfile


@task(checkpoint=False)
def parse_xmls(zipfile: Union[None, dict]) -> Union[None, dict]:
    batch_parsers = {
        LogbookTransmissionFormat.ERS3: ers.batch_parse,
        LogbookTransmissionFormat.FLUX: flux.batch_parse,
    }

    logger = prefect.context.get("logger")
    if zipfile:
        logger.info(f"Parsing messages of zipfile {zipfile['full_name']}")
        transmission_format = zipfile["transmission_format"]
        batch_parser = batch_parsers[transmission_format]
        parsed_batch = batch_parser(zipfile["xml_messages"])
        parsed_batch["logbook_reports"][
            "transmission_format"
        ] = transmission_format.value
        zipfile.pop("xml_messages")
        zipfile = {**zipfile, **parsed_batch}
        return zipfile


@task(checkpoint=False)
def clean(zipfile: Union[None, dict]) -> Union[None, dict]:
    logger = prefect.context.get("logger")
    if zipfile:
        if zipfile["transmission_format"] is LogbookTransmissionFormat.ERS3:
            logger.info(
                "Removing QUE and RSP messages from messages of "
                + f"zipfile {zipfile['full_name']}."
            )
            zipfile["logbook_reports"] = zipfile["logbook_reports"][
                zipfile["logbook_reports"].operation_type.isin(
                    ["DAT", "DEL", "COR", "RET"]
                )
            ]
            zipfile["logbook_raw_messages"] = zipfile["logbook_raw_messages"][
                zipfile["logbook_raw_messages"].operation_number.isin(
                    zipfile["logbook_reports"]["operation_number"]
                )
            ]
        return zipfile


@task(checkpoint=False)
def load_logbook_data(cleaned_data: List[dict]):
    """Loads logbook data into public.logbook_reports and public.logbook_raw_messages tables.

    Args:
        cleaned_data (list) : list of dictionaries (output of `clean` task)
    """
    schema = "public"
    logbook_reports_table_name = "logbook_reports"
    logbook_raw_messages_table_name = "logbook_raw_messages"
    engine = create_engine("monitorfish_remote")
    logger = prefect.context.get("logger")

    logbook_reports_table = get_table(
        logbook_reports_table_name, schema, engine, logger
    )
    logbook_raw_messages_table = get_table(
        logbook_raw_messages_table_name, schema, engine, logger
    )

    cleaned_data = list(filter(lambda x: True if x else False, cleaned_data))

    for zipfile in cleaned_data:

        with engine.begin() as connection:
            logbook_reports = zipfile["logbook_reports"]
            logbook_raw_messages = zipfile["logbook_raw_messages"]
            transmission_format = zipfile["transmission_format"]
            try:
                assert transmission_format in (
                    LogbookTransmissionFormat.FLUX,
                    LogbookTransmissionFormat.ERS3,
                )
            except AssertionError:
                logger.error(
                    (
                        f"Unexpected transmission_format {transmission_format}. "
                        f"Moving {zipfile['full_name']} to error_dir"
                    )
                )
                move(
                    zipfile["input_dir"] / zipfile["full_name"],
                    zipfile["error_dir"],
                    if_exists="replace",
                )
                continue

            # Drop rows for which the operation number already exists in the
            # logbook_raw_messages database

            logbook_raw_messages = drop_rows_already_in_table(
                df=logbook_raw_messages,
                df_column_name="operation_number",
                table=logbook_raw_messages_table,
                table_column_name="operation_number",
                connection=connection,
                logger=logger,
            )

            if zipfile["transmission_format"] is LogbookTransmissionFormat.FLUX:
                logbook_reports = drop_rows_already_in_table(
                    df=logbook_reports,
                    df_column_name="report_id",
                    table=logbook_reports_table,
                    table_column_name="report_id",
                    connection=connection,
                    logger=logger,
                )

            else:
                # With ERS3 data, we cannot rely on having unique report_ids like we do
                # in FLUX data for two reasons :
                # - DEL messages have a NULL report_id
                # - Visiocapture data holds multiple reports in a single ERS element,
                #   and therefore several logbook_reports with the same report_id
                #
                # What we do instead is ensure we only insert logbook_reports for which
                # the corresponding logbook_raw_message is not yet in the database.
                logbook_reports = logbook_reports[
                    logbook_reports.operation_number.isin(
                        logbook_raw_messages.operation_number
                    )
                ]

            if len(logbook_raw_messages) > 0:
                n_lines = len(logbook_raw_messages)
                logger.info(
                    f"Inserting {n_lines} messages in logbook_raw_messages table."
                )

                logbook_raw_messages.to_sql(
                    name=logbook_raw_messages_table_name,
                    con=connection,
                    schema=schema,
                    index=False,
                    method=psql_insert_copy,
                    if_exists="append",
                )

            if len(logbook_reports) > 0:
                n_lines = len(logbook_reports)
                logger.info(f"Inserting {n_lines} messages in logbook_reports table.")

                # Serialize dicts to prepare for insertion as json in database
                logbook_reports["value"] = logbook_reports.value.map(to_json)

                logbook_reports.to_sql(
                    name=logbook_reports_table_name,
                    con=connection,
                    schema=schema,
                    index=False,
                    method=psql_insert_copy,
                    if_exists="append",
                )

            if zipfile["batch_generated_errors"]:
                logger.error(
                    "Errors occurred during parsing of some of the messages. "
                    f"Moving {zipfile['full_name']} to error directory."
                )
                move(
                    zipfile["input_dir"] / zipfile["full_name"],
                    zipfile["error_dir"],
                    if_exists="replace",
                )
            else:
                move(
                    zipfile["input_dir"] / zipfile["full_name"],
                    zipfile["treated_dir"],
                    if_exists="replace",
                )


with Flow("Logbook") as flow:

    # Only run if the previous run has finished running
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        received_directory = Parameter("received_directory", default=RECEIVED_DIRECTORY)
        treated_directory = Parameter("treated_directory", default=TREATED_DIRECTORY)
        error_directory = Parameter("error_directory", default=ERROR_DIRECTORY)
        zipfiles = extract_zipfiles(
            received_directory,
            treated_directory,
            error_directory,
        )
        zipfiles = extract_xmls_from_zipfile.map(zipfiles)
        zipfiles = parse_xmls.map(zipfiles)
        zipfiles = clean.map(zipfiles)
        load_logbook_data(zipfiles)

flow.file_name = Path(__file__).name
