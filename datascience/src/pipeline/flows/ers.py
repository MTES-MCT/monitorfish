from typing import Iterator, Union

import pandas as pd
import prefect
from prefect import Flow, Parameter, task
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    func,
    select,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import InvalidRequestError

from src.db_config import create_engine
from src.pipeline.parsers.ers import batch_parse
from src.pipeline.processing import dict2json
from src.read_query import read_query
from src.utils.database import psql_insert_copy

RAW_XML_TABLE = {"dam": "raw_jpe_dam_xml", "dpma": "raw_jpe_dpma_xml"}


@task
def extract_raw_xml(
    data_source: str = "dam", chunksize: Union[None, int] = 10000
) -> Iterator[pd.DataFrame]:
    """Extract raw XML messages from the monitorfish_remote_i database (dump made end of 2020).
    Data is extracted in chunks and return as an iterator that yields results as
    pandas DataFrames.

    data_source : "dam" or "dpma"
    """

    table = RAW_XML_TABLE[data_source]

    raw_xml = read_query(
        "monitorfish_remote_i",
        f"SELECT xml_message FROM raw.{table}",
        chunksize=chunksize,
    )

    return raw_xml


@task
def parse_xml(raw_xml: Iterator[pd.DataFrame]) -> Iterator[pd.DataFrame]:
    logger = prefect.context.get("logger")
    for i, raw_xml_chunk in enumerate(raw_xml):
        logger.info(f"Parsing chunk {i}")
        parsed, parsed_with_xml = batch_parse(raw_xml_chunk.xml_message.values)
        yield parsed, parsed_with_xml


@task
def clean(parsed_data):
    logger = prefect.context.get("logger")
    for i, (ers_json, ers_xml) in enumerate(parsed_data):
        logger.info(f"Removing QUE and RSP messages from chunk {i}.")
        cleaned_ers_json = ers_json[
            ers_json.operation_type.isin(["DAT", "DEL", "COR", "RET"])
        ]
        cleaned_ers_xml = ers_xml[
            ers_xml.operation_type.isin(["DAT", "DEL", "COR", "RET"])
        ]
        yield cleaned_ers_json, cleaned_ers_xml


def remove_already_existing_messages(
    existing_operation_numbers, ers_json, ers_xml, connection, logger
):

    n_messages = len(ers_xml)
    n_logs = len(ers_json)
    n_operations = ers_xml.operation_number.nunique()

    # Remove keys already present in the database from dataframes
    cleaned_ers_json = ers_json[
        ~ers_json.operation_number.isin(existing_operation_numbers)
    ]
    cleaned_ers_xml = ers_xml[
        ~ers_xml.operation_number.isin(existing_operation_numbers)
    ]
    
    new_operation_numbers = set(cleaned_ers_xml.operation_number)
    
    existing_operation_numbers = existing_operation_numbers.union(new_operation_numbers)

    n_messages_cleaned = len(cleaned_ers_xml)
    n_logs_cleaned = len(cleaned_ers_json)
    n_operations_cleaned = cleaned_ers_xml.operation_number.nunique()

    log = (
        f"From {n_messages} xml messages with {n_operations} distinct operation numbers "
        + f"containing {n_logs} logs, {n_messages_cleaned} xml messages with {n_operations_cleaned} "
        + f"distinct operation numbers containing {n_logs_cleaned} logs are new and will be inserted "
        + "in the database."
    )

    logger.info(log)
    return cleaned_ers_json, cleaned_ers_xml, existing_operation_numbers


def delete(table, logger, connection):
    count_statement = select([func.count()]).select_from(table)
    n = connection.execute(count_statement).fetchall()[0][0]
    if logger:
        logger.info(f"Found existing table {table.name} with {n} rows.")
        logger.info(f"Deleting table {table.name}...")
    connection.execute(table.delete())
    count_statement = select([func.count()]).select_from(table)
    n = connection.execute(count_statement).fetchall()[0][0]
    if logger:
        logger.info(f"Rows after deletion: {n}.")


@task
def load_ers(parsed_data, if_exists: str = "append"):
    """Loads parsed ERS data into public.ers and public.ers_messages tables.

    Args:
        parsed (Iterator) : iterator of pandas DataFrames (output of `parse_xml` task)
        if_exists (str) : one of
            append : append data to existing tables
            replace : delete all data from existing tables then insert data
    """
    schema = "public"
    ers_table_name = "ers"
    ers_messages_table_name = "ers_messages"
    #     schema = "processed"
    #     ers_table_name = "ers"
    #     ers_messages_table_name = "ers_messages"

    engine = create_engine("monitorfish_remote_i")
    logger = prefect.context.get("logger")

    with engine.begin() as connection:
        meta = MetaData(schema=schema)
        meta.bind = connection
        try:
            logger.info("Searching for ers and ers_messages tables...")
            meta.reflect(only=[ers_table_name, ers_messages_table_name])
            ers_table = Table(ers_table_name, meta, mustexist=True)
            ers_messages_table = Table(ers_messages_table_name, meta, mustexist=True)
            logger.info("ers and ers_messages tables found.")
        except InvalidRequestError:
            logger.error(
                "ers and ers_messages tables must exist. Make appropriate migrations and try again."
            )
            raise

        if if_exists == "replace":
            logger.info("Deleting ers tables.")
            delete(ers_table, logger, connection)
            delete(ers_messages_table, logger, connection)

        # Extract existing operation numbers in ers_messages table
        try:
            assert "operation_number" in [c.name for c in ers_messages_table.columns]
        except AssertionError:
            logger.error(
                "Missing primary key column 'operation_number' in ers_messages table."
                + "This is required to avoid inserting duplicated data into the table."
                + "Check database migrations."
            )
        logger.info("Fetching existing operation numbers in database.")
        s = select([ers_messages_table.c.operation_number])
        existing_operation_numbers = connection.execute(s).fetchall()
        existing_operation_numbers = [x[0] for x in existing_operation_numbers]
        existing_operation_numbers = set(existing_operation_numbers)

        for i, (ers_json, ers_xml) in enumerate(parsed_data):

            logger.info(f"Inserting chunk {i}")
            # Drop rows for which the operation number already exists in the ers_messages database
            ers_json, ers_xml, existing_operation_numbers = remove_already_existing_messages(
                existing_operation_numbers, ers_json, ers_xml, connection, logger
            )
            if len(ers_xml) == 0:
                logger.warning("No messages to insert.")
                continue

            logger.info(f"Inserting {len(ers_xml)} messages.")

            ers_xml.to_sql(
                name=ers_messages_table_name,
                con=connection,
                schema=schema,
                index=False,
                method=psql_insert_copy,
                if_exists="append",
                dtype={
                    "operation_number": String(17),
                    "operation_country": String(3),
                    "operation_datetime_utc": DateTime,
                    "operation_type": String(3),
                    "ers_id": String(17),
                    "referenced_ers_id": String(17),
                    "ers_datetime_utc": DateTime,
                    "cfr": String(12),
                    "ircs": String(7),
                    "external_identification": String(14),
                    "vessel_name": String(100),
                    "flag_state": String(3),
                    "imo": String(20),
                    "xml_message": Text(),
                    "integration_datetime_utc": DateTime,
                },
            )

            if len(ers_json) == 0:
                continue

            ers_json["value"] = ers_json.value.map(dict2json)
            ers_json.to_sql(
                name=ers_table_name,
                con=connection,
                schema=schema,
                index=False,
                method=psql_insert_copy,
                if_exists="append",
                dtype={
                    "operation_number": String(17),
                    "operation_country": String(3),
                    "operation_datetime_utc": DateTime,
                    "operation_type": String(3),
                    "ers_id": String(17),
                    "referenced_ers_id": String(17),
                    "ers_datetime_utc": DateTime,
                    "cfr": String(12),
                    "ircs": String(7),
                    "external_identification": String(14),
                    "vessel_name": String(100),
                    "flag_state": String(3),
                    "imo": String(20),
                    "log_type": String(3),
                    "value": JSONB,
                    "integration_datetime_utc": DateTime,
                },
            )


with Flow("Extract parse load ERS messages") as f:
    data_source = Parameter("data_source", default="dam")
    if_exists = Parameter("if_exists", default="append")
    raw_xml = extract_raw_xml(data_source=data_source)
    parsed_data = parse_xml(raw_xml)
    cleaned_data = clean(parsed_data)
    load_ers(cleaned_data, if_exists=if_exists)


if __name__ == "__main__":
    f.run(if_exists="replace")
