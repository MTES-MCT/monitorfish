import datetime
import logging
import os
import re
from email.message import EmailMessage
from pathlib import Path
from typing import Iterable, List, Tuple

import jinja2
import pandas as pd
import prefect
import pytz
import requests
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from config import (
    BACKOFFICE_REGULATION_URL,
    CNSP_FRANCE_EMAIL_ADDRESS,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
    PROXIES,
)
from src.pipeline.generic_tasks import extract
from src.pipeline.helpers.emails import create_html_email, send_email
from src.pipeline.processing import get_matched_groups, try_get_factory
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.dates import get_utcnow

####################################### Helpers #######################################


def make_html_hyperlinks(
    urls: Iterable, link_texts: Iterable, logger: logging.Logger = None
) -> List[str]:
    """
    Returns a list of html strings of links like <a href=url>link_text</a> for the
    input `urls` and `link_texts`.

    Args:
        urls (Iterable): Iterable of urls
        link_texts (Iterable): Iterable of link texts

    Returns:
        List[str]: `list` of html links
    """

    if not len(urls) == len(link_texts):
        if not logger:
            logger = logging.Logger("logger")
        logger.warning(
            (
                "urls and text_links do not match in length. The output list will "
                "be truncated to the shortest of the two sequences"
            )
        )

    null_url = "#"

    hyperlinks = [
        f'<a href="{url or null_url}">{link_text}</a>'
        for url, link_text in zip(urls, link_texts)
    ]

    return hyperlinks


################################### Tasks and flows ###################################


@task(checkpoint=False)
def extract_monitorfish_regulations() -> pd.DataFrame:
    """
    Extracts regulation references from the monitorfish `regulations` table.

    The ouptut DataFrame contains one line per regulatory reference, which means there
    can be multiple lines for one regulated zone, if the zone has several regulatory
    references.

    Output columns are `law_type`, `topic`, `zone`, `url` and `reference`.

    Regulatory zones without any regulatory reference are present in the output as a
    line with `None` as `url` and `reference` values.

    Returns:
        pd.DataFrame: DataFrame of regulatory references
    """

    monitorfish_regulations = extract(
        "monitorfish_remote",
        query_filepath="monitorfish/regulations_references.sql",
    )

    monitorfish_regulations = monitorfish_regulations.explode(
        "regulatory_references", ignore_index=True
    )

    monitorfish_regulations["url"] = monitorfish_regulations.regulatory_references.map(
        try_get_factory("url", error_value=None)
    )

    monitorfish_regulations[
        "reference"
    ] = monitorfish_regulations.regulatory_references.map(
        try_get_factory("reference", error_value=None)
    )

    # range of possible values with python datetime timestamps
    timestamp_max = 253402210800  # 9999, December 31st
    timestamp_min = -62135510961  # 0001, January 2nd

    monitorfish_regulations[
        "end_date"
    ] = monitorfish_regulations.regulatory_references.map(
        try_get_factory("endDate", error_value=None)
    ).map(
        lambda x: (
            datetime.datetime(9999, 12, 31)
            if x == "infinite" or x / 1000 > timestamp_max
            else datetime.datetime(1, 1, 2)
            if x / 1000 < timestamp_min
            else datetime.datetime.utcfromtimestamp(x / 1000)
        ),
        na_action="ignore",
    )

    monitorfish_regulations = monitorfish_regulations.drop(
        columns=["regulatory_references"]
    )

    return monitorfish_regulations


@task(checkpoint=False)
def extract_legipeche_regulations() -> pd.DataFrame:
    """
    Extracts legipeche regulations from the monitorfish `legipeche` table (which is
    scraped from legipeche by the `Scrape Legipeche` flow).

    The ouput has one line per document - there can be multiple documents for the same
    Legipeche page.

    Output columns are `extraction_datetime_utc`, `extraction_occurence`, `page_title`,
    `page_url`, `document_title`, and `document_url`.

    Returns:
        pd.DataFrame: DataFrame of Legipeche regulations.
    """
    return extract(
        "monitorfish_remote",
        query_filepath="monitorfish/legipeche.sql",
    )


@task(checkpoint=False)
def add_article_id(regulations: pd.DataFrame, url_column: str) -> pd.DataFrame:
    """
    Adds an `article_id` column to the `regulations` DataFrame, extracting the
    article_id from the `url_column` according the the Legipeche URL schema.

    Rows for which the URL does not match the Legipeche URL schema will have an
    article_id of `None`.

    Args:
        regulations (pd.DataFrame): DataFrame of regulations
        url_column (str): Name of the column containing URLs of regulation pages

    Returns:
        pd.DataFrame: copy of input `regulations` with an added `article_id` column
    """
    legipeche_regex = re.compile(
        (
            r"^http://legipeche\.metier\."
            r"e2\.rie\.gouv\.fr/"
            r"(?:[a-zA-Z0-9-]*)"
            r"-a(?P<article_id>\d+)"
            r"\.html"
            r".*$"
        )
    )

    regulations = pd.concat(
        [
            regulations,
            regulations[url_column].apply(get_matched_groups, regex=legipeche_regex),
        ],
        axis=1,
    )

    return regulations


@task(checkpoint=False)
def get_extraction_datetimes(legipeche_regulations: pd.DataFrame) -> Tuple[str, str]:
    """
    Returns the extraction datetimes of `previous` and `latest` legipeche extraction
    occurences from the `legipeche_regulations` DataFrame.

    The input must have `extraction_occurence` and `extraction_datetime_utc` columns.

    Args:
        legipeche_regulations (pd.DataFrame): DataFrame of legipeche extractions.

    Returns:
        Tuple[str, str]: extraction datetimes of `previous` and `latest` legipeche
          extractions
    """

    previous_extraction_datetime_utc = legipeche_regulations.loc[
        legipeche_regulations.extraction_occurence == "previous",
        "extraction_datetime_utc",
    ].iloc[0]

    latest_extraction_datetime_utc = legipeche_regulations.loc[
        legipeche_regulations.extraction_occurence == "latest",
        "extraction_datetime_utc",
    ].iloc[0]

    def naive_datetime_utc_to_paris_datetime_string(
        naive_dt_utc: datetime.datetime,
    ) -> str:
        """
        Takes a naive `datetime`, supposed to represent a UTC datetime object, converts
        it to Europe/Paris aware `datetime` and returns it as a formatted string like
        "%d/%m/%Y %H:%M".

        Args:
            naive_dt_utc (datetime.datetime): naive `datetime`

        Returns:
            str: `str` formatted Europe/paris represenation of the input datetime
        """
        dt_utc = pytz.UTC.localize(naive_dt_utc)

        res = dt_utc.astimezone(pytz.timezone("Europe/Paris")).strftime(
            "%d/%m/%Y %H:%M"
        )
        return res

    return (
        naive_datetime_utc_to_paris_datetime_string(previous_extraction_datetime_utc),
        naive_datetime_utc_to_paris_datetime_string(latest_extraction_datetime_utc),
    )


@task(checkpoint=False)
def get_modified_regulations(
    legipeche_regulations: pd.DataFrame, monitorfish_regulations: pd.DataFrame
) -> pd.DataFrame:
    """
    Filters the input `legipeche_regulations` and returns legipeche regulations
    (documents) that :

      - have been either added to or removed from an existing Legipeche page between
        the `previous` and `latest` Legipeche scraping occurences
      - belong to a Legipeche page referenced by at least one `monitorfish_regulation`

    Args:
        legipeche_regulations (pd.DataFrame):
        monitorfish_regulations (pd.DataFrame):

    Returns:
        pd.DataFrame: filtered DataFrame of Legipeche regulations
    """

    legipeche_latest_article_ids = set(
        legipeche_regulations.loc[
            legipeche_regulations.extraction_occurence == "latest", "article_id"
        ]
    )
    legipeche_previous_article_ids = set(
        legipeche_regulations.loc[
            legipeche_regulations.extraction_occurence == "previous", "article_id"
        ]
    )
    legipeche_stable_article_ids = legipeche_latest_article_ids.intersection(
        legipeche_previous_article_ids
    )

    legipeche_latest_document_urls = set(
        legipeche_regulations.loc[
            legipeche_regulations.extraction_occurence == "latest", "document_url"
        ]
    )
    legipeche_previous_document_urls = set(
        legipeche_regulations.loc[
            legipeche_regulations.extraction_occurence == "previous", "document_url"
        ]
    )
    legipeche_modified_documents = legipeche_latest_document_urls.symmetric_difference(
        legipeche_previous_document_urls
    )

    monitorfish_regulations_article_ids = set(
        monitorfish_regulations.article_id.dropna()
    )

    modified_legipeche_regulations = legipeche_regulations[
        (legipeche_regulations.document_url.isin(legipeche_modified_documents))
        & (legipeche_regulations.article_id.isin(legipeche_stable_article_ids))
        & (legipeche_regulations.article_id.isin(monitorfish_regulations_article_ids))
    ].reset_index(drop=True)

    return modified_legipeche_regulations


@task(checkpoint=False)
def transform_modified_regulations(
    modified_regulations: pd.DataFrame, monitorfish_regulations: pd.DataFrame
) -> pd.DataFrame:
    """
    Formats `modified_regulations` into a DataFrame suitable for printing in an email.

    Args:
        modified_regulations (pd.DataFrame): DataFrame with columns :

          - `extraction_occurence`, having values 'previous' and 'latest
          - `page_url`
          - `document_title`
          - `document_url`

        monitorfish_regulations (pd.DataFrame): DataFrame with columns :

          - `url` (url of the regulatory reference in Monitorfish)
          - `reference` (name of the regulatory reference in Monitorfish)
          - `law_type`
          - `topic`
          - `zone`

    Returns:
        pd.DataFrame: formatted DataFrame of regulation modifications
    """

    logger = prefect.context.get("logger")

    modified_regulations = pd.merge(
        monitorfish_regulations, modified_regulations, on="article_id"
    )

    modified_regulations[
        "Modification"
    ] = modified_regulations.extraction_occurence.map(
        lambda s: "Ajout de document" if s == "latest" else "Suppression de document"
    )

    modified_regulations["Référence réglementaire"] = make_html_hyperlinks(
        modified_regulations.url, modified_regulations.reference, logger=logger
    )

    modified_regulations["Document"] = make_html_hyperlinks(
        modified_regulations.document_url,
        modified_regulations.document_title,
        logger=logger,
    )

    modified_regulations = (
        modified_regulations[
            [
                "law_type",
                "topic",
                "zone",
                "Référence réglementaire",
                "Modification",
                "Document",
            ]
        ]
        .sort_values(
            [
                "law_type",
                "topic",
                "zone",
                "Référence réglementaire",
                "Modification",
                "Document",
            ]
        )
        .rename(
            columns={
                "law_type": "Type de réglementation",
                "topic": "Thématique",
                "zone": "Zone",
            }
        )
    ).reset_index(drop=True)

    return modified_regulations


@task(checkpoint=False)
def get_missing_references(monitorfish_regulations: pd.DataFrame) -> pd.DataFrame:
    """
    Returns `monitorfish_regulations` with null values as `reference`.

    Args:
        monitorfish_regulations (pd.DataFrame): monitorfish_regulations. Must have
        columns :

          - `reference`
          - `law_type`
          - `topic`
          - `zone`

    Returns:
        pd.DataFrame: Filtered and formatted version of input.
    """
    return (
        monitorfish_regulations.loc[
            monitorfish_regulations.reference.isna(),
            ["law_type", "topic", "zone"],
        ]
        .copy(deep=True)
        .sort_values(["law_type", "topic", "zone"])
        .rename(
            columns={
                "law_type": "Type de réglementation",
                "topic": "Thématique",
                "zone": "Zone",
            }
        )
        .reset_index(drop=True)
    )


@task(checkpoint=False)
def get_unknown_links(
    monitorfish_regulations: pd.DataFrame,
    legipeche_regulations: pd.DataFrame,
) -> set:
    """
    Returns the urls of `monitorfish_regulations` that contain an `article_id`
    that is not present in `legipeche_regulations`.

    Args:
        monitorfish_regulations (pd.DataFrame):
        legipeche_regulations (pd.DataFrame):

    Returns:
        set: subset of `monitorfish_regulations.url`
    """

    logger = prefect.context.get("logger")

    legipeche_article_ids = set(
        legipeche_regulations.loc[
            legipeche_regulations.extraction_occurence == "latest", "article_id"
        ].dropna()
    )

    unknown_links = set(
        monitorfish_regulations.loc[
            (monitorfish_regulations.url.notnull())
            & (~monitorfish_regulations.article_id.isin(legipeche_article_ids)),
            "url",
        ]
    )

    logger.info(
        (
            f"Out of {monitorfish_regulations.url.dropna().nunique()} distincts urls "
            f"in monitorfish_regulation, {len(unknown_links)} were not found in the"
            " legipeche table."
        )
    )

    return unknown_links


@task(checkpoint=False)
def get_dead_links(
    monitorfish_regulations: pd.DataFrame, unknown_links: set, proxies: dict
) -> pd.DataFrame:
    """
    Perfoms get requests to check whether `unknown_links` are dead links, then returns
    `monitorfish_regulations` that reference a dead link as regulatory reference.

    Args:
        monitorfish_regulations (pd.DataFrame):
        unknown_links (set): `set` of urls not knonwn (i.e. urls not found when
          scraping Legipeche)
        proxies (dict): proxies to use when requests time out without proxies

    Returns:
        pd.DataFrame: filtered `monitorfish_regulations` with only those that reference
          a dead link
    """

    logger = prefect.context.get("logger")

    for proxy_env in ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]:
        os.environ.pop(proxy_env, None)

    logger.info(
        (
            f"Performing requests on {len(unknown_links)} unknown urls to check "
            "whether they are dead links..."
        )
    )

    dead_links_urls = []
    for unknown_link in unknown_links:
        try:
            logger.info(f"Testing {unknown_link}")
            r = requests.get(unknown_link, timeout=10)
            r.raise_for_status()
        except requests.Timeout:
            try:
                logger.info(f"{unknown_link} timed out. Retrying with proxies...")
                r = requests.get(unknown_link, timeout=10, proxies=proxies)
                r.raise_for_status()
            except requests.HTTPError:
                logger.info(f"{unknown_link} is a dead link.")
                dead_links_urls.append(unknown_link)

        except (
            requests.HTTPError,
            requests.ConnectionError,
            requests.exceptions.MissingSchema,
            requests.exceptions.InvalidSchema,
            requests.exceptions.InvalidURL,
        ) as e:
            logger.info(f"{unknown_link} is a dead link (error {type(e)}: {e}).")
            dead_links_urls.append(unknown_link)

    # null references are missing_references, not dead_links
    dead_links = monitorfish_regulations[
        (monitorfish_regulations.url.isin(dead_links_urls))
        & (monitorfish_regulations.reference.notnull())
    ].reset_index(drop=True)

    return dead_links


@task(checkpoint=False)
def format_dead_links(dead_links: pd.DataFrame) -> pd.DataFrame:
    """
    Format input for printing.
    """

    logger = prefect.context.get("logger")

    dead_links = dead_links.rename(
        columns={
            "law_type": "Type de réglementation",
            "topic": "Thématique",
            "zone": "Zone",
        }
    ).copy(deep=True)

    dead_links["Référence réglementaire"] = make_html_hyperlinks(
        dead_links.url, dead_links.reference, logger=logger
    )
    dead_links = dead_links[
        ["Type de réglementation", "Thématique", "Zone", "Référence réglementaire"]
    ]
    dead_links = dead_links.sort_values(
        ["Type de réglementation", "Thématique", "Zone", "Référence réglementaire"]
    )
    return dead_links


@task(checkpoint=False)
def get_outdated_references(
    monitorfish_regulations: pd.DataFrame, now: datetime.datetime
) -> pd.DataFrame:
    """
    Returns `monitorfish_regulations` that have an `end_date` which is before `now`.

    Args:
        monitorfish_regulations (pd.DataFrame): DataFrame of Monitorfish regulations.
          Must have at least a `end_date` column.
        now (datetime.datetime): now

    Returns:
        pd.DataFrame: Subset of `monitorfish_regulations`
    """
    return monitorfish_regulations[monitorfish_regulations.end_date < now].reset_index(
        drop=True
    )


@task(checkpoint=False)
def format_outdated_references(outdated_references: pd.DataFrame) -> pd.DataFrame:
    """
    Format input for printing.
    """

    logger = prefect.context.get("logger")

    outdated_references = (
        outdated_references.sort_values(["law_type", "topic", "zone"])
        .assign(ref=lambda x: make_html_hyperlinks(x.url, x.reference, logger=logger))
        .rename(
            columns={
                "law_type": "Type de réglementation",
                "topic": "Thématique",
                "zone": "Zone",
                "end_date": "Date de fin de validité",
                "ref": "Référence réglementaire",
            }
        )[
            [
                "Type de réglementation",
                "Thématique",
                "Zone",
                "Référence réglementaire",
                "Date de fin de validité",
            ]
        ]
        .reset_index(drop=True)
        .copy(deep=True)
    )

    return outdated_references


@task(checkpoint=False)
def get_main_template() -> jinja2.environment.Template:
    with open(EMAIL_TEMPLATES_LOCATION / "regulations_checkup/main.jinja", "r") as f:
        return jinja2.Template(f.read())


@task(checkpoint=False)
def get_body_template() -> jinja2.environment.Template:
    with open(EMAIL_TEMPLATES_LOCATION / "regulations_checkup/body.jinja", "r") as f:
        return jinja2.Template(f.read())


@task(checkpoint=False)
def get_style() -> str:
    with open(EMAIL_STYLESHEETS_LOCATION / "splendid.css") as f:
        style = f.read()
    return style


@task(checkpoint=False)
def render_body(
    body_template: jinja2.environment.Template,
    previous_extraction_datetime_utc: datetime.datetime,
    latest_extraction_datetime_utc: datetime.datetime,
    missing_references: pd.DataFrame,
    modified_regulations: pd.DataFrame,
    dead_links: pd.DataFrame,
    outdated_references: pd.DataFrame,
    backoffice_regulation_url: str,
    utcnow: datetime.datetime,
) -> str:
    """
    Renders email body as html string.
    """

    email_content = {
        "previous_extraction_datetime_utc": previous_extraction_datetime_utc,
        "latest_extraction_datetime_utc": latest_extraction_datetime_utc,
        "verification_date": utcnow.date().strftime("%d/%m/%Y"),
        "backoffice_regulation_url": backoffice_regulation_url,
    }

    if len(missing_references) > 0:
        email_content["missing_references"] = missing_references.to_html(
            index=False, justify="center", escape=False
        )
        email_content["n_missing_references"] = len(missing_references)

    if len(dead_links) > 0:
        email_content["dead_links"] = dead_links.to_html(
            index=False, justify="center", escape=False
        )
        email_content["n_dead_links"] = len(dead_links)

    if len(modified_regulations) > 0:
        email_content["modified_regulations"] = modified_regulations.to_html(
            index=False, justify="center", escape=False
        )
        email_content["n_modified_regulations"] = len(modified_regulations)

    if len(outdated_references) > 0:
        email_content["outdated_references"] = outdated_references.to_html(
            index=False, justify="center", escape=False
        )
        email_content["n_outdated_references"] = len(outdated_references)

    return body_template.render(email_content)


@task(checkpoint=False)
def render_main(
    main_template: jinja2.environment.Template, style: str, body: str
) -> str:
    return main_template.render(style=style, body=body)


@task(checkpoint=False)
def get_recipients() -> List[str]:
    try:
        assert CNSP_FRANCE_EMAIL_ADDRESS is not None
    except AssertionError:
        logging.error("CNSP_FRANCE_EMAIL_ADDRESS environment variable is not set.")
        raise

    return [CNSP_FRANCE_EMAIL_ADDRESS]


@task(checkpoint=False)
def create_message(html: str, recipients: List[str]) -> EmailMessage:
    msg = create_html_email(
        to=recipients,
        subject="[Monitorfish] Suivi des modifications Legipêche dans Monitorfish",
        html=html,
    )

    return msg


@task(checkpoint=False)
def send_message(msg: EmailMessage):
    send_email(msg)


with Flow("Regulations checkup", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        # Parameters
        proxies = Parameter("proxies", default=PROXIES)
        backoffice_regulation_url = Parameter(
            "backoffice_regulation_url", default=BACKOFFICE_REGULATION_URL
        )

        # Extract data
        monitorfish_regulations = extract_monitorfish_regulations()
        legipeche_regulations = extract_legipeche_regulations()
        utcnow = get_utcnow()

        # Extract output templates
        main_template = get_main_template()
        body_template = get_body_template()
        style = get_style()

        # Transform data
        monitorfish_regulations = add_article_id(
            monitorfish_regulations, url_column="url"
        )
        legipeche_regulations = add_article_id(
            legipeche_regulations, url_column="page_url"
        )

        missing_references = get_missing_references(monitorfish_regulations)

        modified_regulations = get_modified_regulations(
            legipeche_regulations, monitorfish_regulations
        )
        modified_regulations = transform_modified_regulations(
            modified_regulations, monitorfish_regulations
        )

        (
            previous_extraction_datetime_utc,
            latest_extraction_datetime_utc,
        ) = get_extraction_datetimes(legipeche_regulations)

        unknown_links = get_unknown_links(
            monitorfish_regulations=monitorfish_regulations,
            legipeche_regulations=legipeche_regulations,
        )
        dead_links = get_dead_links(monitorfish_regulations, unknown_links, proxies)
        dead_links = format_dead_links(dead_links)

        outdated_references = get_outdated_references(monitorfish_regulations, utcnow)
        outdated_references = format_outdated_references(outdated_references)

        # Render email
        body = render_body(
            body_template=body_template,
            previous_extraction_datetime_utc=previous_extraction_datetime_utc,
            latest_extraction_datetime_utc=latest_extraction_datetime_utc,
            missing_references=missing_references,
            modified_regulations=modified_regulations,
            dead_links=dead_links,
            outdated_references=outdated_references,
            backoffice_regulation_url=backoffice_regulation_url,
            utcnow=utcnow,
        )

        html = render_main(
            main_template=main_template,
            style=style,
            body=body,
        )

        # Send

        recipients = get_recipients()
        msg = create_message(html, recipients)
        send_message(msg)

flow.file_name = Path(__file__).name
