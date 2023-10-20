import datetime
import os
from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, case, task
from scrapy.crawler import CrawlerProcess
from sqlalchemy import text

from config import LIBRARY_LOCATION
from src.db_config import create_engine
from src.pipeline.scraping.legipeche.legipeche.spiders.legipeche_spider import (
    LegipecheSpider,
)
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.utils import psql_insert_copy

SCRAPED_FILE_LOCATION = LIBRARY_LOCATION / "pipeline/data/"
SCRAPED_FILENAME = "legipeche.csv"


@task(checkpoint=False)
def delete_csv():
    """Deletes `legipeche.csv` if it exists."""
    logger = prefect.context.get("logger")
    if SCRAPED_FILENAME in os.listdir(SCRAPED_FILE_LOCATION):
        logger.info(f"{SCRAPED_FILENAME} found, deleting.")
        os.remove(SCRAPED_FILE_LOCATION / SCRAPED_FILENAME)
    else:
        logger.info(f"{SCRAPED_FILENAME} not found, skipping.")


@task(checkpoint=False)
def scrape_legipeche_to_csv():
    """Scrapes all links to regulations in legipeche, stores the results to csv."""

    for proxy_env in ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]:
        os.environ.pop(proxy_env, None)

    extraction_datetime_utc = datetime.datetime.utcnow()

    process = CrawlerProcess(
        settings={
            "LOG_LEVEL": "INFO",
            "FEEDS": {SCRAPED_FILE_LOCATION / SCRAPED_FILENAME: {"format": "csv"}},
        }
    )

    process.crawl(LegipecheSpider)
    process.start()

    return extraction_datetime_utc


@task(checkpoint=False)
def read_legipeche_csv(extraction_datetime_utc: datetime.datetime) -> pd.DataFrame:
    """Reads the csv file with all legipeche urls (output of
    scrape_legipeche_to_csv task) and add the input `datetime.datetime` as value in the
    column `extraction_datetime_utc` and 'latest' as value in the column
    `extraction_occurence`.

    Returns:
        pd.DataFrame: `DataFrame` of regulations in Legipeche
    """

    legipeche = pd.read_csv(SCRAPED_FILE_LOCATION / SCRAPED_FILENAME)

    legipeche["extraction_datetime_utc"] = extraction_datetime_utc
    legipeche["extraction_occurence"] = "latest"
    return legipeche


@task(checkpoint=False)
def load_legipeche(legipeche: pd.DataFrame):
    """
    Deletes `previous` extraction occurence in legipeche table, then
    changes `latest` extraction occurence to `previous` in legipeche table, then
    loads input DataFrame as `latest` occurence in `legipeche` table.

    Args:
        legipeche (pd.DataFrame): DataFrame with all links to regulations in legipeche.
    """

    e = create_engine("monitorfish_remote")

    with e.begin() as connection:
        logger = prefect.context.get("logger")
        logger.info("Deleting 'previous' extraction.")
        connection.execute(
            text("DELETE FROM legipeche WHERE extraction_occurence = 'previous'")
        )

        logger.info("Tagging 'latest' extraction as 'previous'.")
        connection.execute(
            text("UPDATE legipeche set extraction_occurence = 'previous'")
        )

        logger.info("Loading freshly extracted data as 'latest'")
        legipeche.to_sql(
            name="legipeche",
            con=connection,
            schema="public",
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )


with Flow("Scrape legipeche") as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        deleted_csv = delete_csv()
        extraction_datetime_utc = scrape_legipeche_to_csv(upstream_tasks=[deleted_csv])
        legipeche = read_legipeche_csv(extraction_datetime_utc)
        load_legipeche(legipeche)

flow.file_name = Path(__file__).name
