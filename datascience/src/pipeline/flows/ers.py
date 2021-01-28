from typing import Iterator, Union

import pandas as pd
import prefect
from prefect import Flow, Parameter, task
from sqlalchemy import (Boolean, Date, DateTime, Float, Integer, MetaData,
                        String, Table, JSON)
from src.db_config import create_engine
from src.pipeline.parsers.ers import batch_parse
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
        chunksize=chunksize)

    return raw_xml


@task
def parse_xml(raw_xml: Iterator[pd.DataFrame]) -> Iterator[pd.DataFrame]:
    logger = prefect.context.get("logger")
    for i, raw_xml_chunk in enumerate(raw_xml):
        logger.info(f"Parsing chunk {i}")
        parsed, parsed_with_xml = batch_parse(raw_xml_chunk.xml_message.values)
        yield parsed, parsed_with_xml


@task
def load_parsed_xml(parsed_xml: Iterator[pd.DataFrame], data_source: str = "dam"):
    """Load parsed JPE data into monitorfish_remote_i database.

    parsed_xml: iterator that yields chunks of parsed data to load into DB.
    data_source : "dam" or "dpma"
    """
    table_name = "ers"
    engine = create_engine("monitorfish_remote_i")
    logger = prefect.context.get("logger")

    with engine.begin() as connection:
        meta = MetaData()
        meta.bind = connection
        table = Table(table_name, meta, schema="processed")
        if table.exists():
            logger.info(f"Deleting from existing table {table_name}.")
            table.delete()
        else:
            logger.info(f"Creating table {table_name}.")

        for i, (parsed, parsed_with_xml) in enumerate(parsed_xml):
            logger.info(f"Inserting chunk {i}")
            parsed.to_sql(
                name=table_name,
                con=connection,
                schema="processed",
                index=False,
                method=psql_insert_copy,
                if_exists="append",
                dtype={
                    "operation_number": String(17),
                    "operation_country": String(3),
                    "operation_datetime_utc": DateTime,
                    "operation_type": String(3),
                    "ers_id": String(17),
                    "ers_datetime_utc": DateTime,
                    "cfr": String(12),
                    "ircs": String(7),
                    "external_identification": String(14),
                    "vessel_name": String(100),
                    "flag_state": String(3),
                    "imo": String(100)
                },
            )


with Flow("Extract parse load ERS messages") as f:
    data_source = Parameter("data_source", default="dam")
    raw_xml = extract_raw_xml(data_source=data_source)
    parsed_xml = parse_xml(raw_xml)
    load_parsed_xml(parsed_xml, data_source=data_source)
