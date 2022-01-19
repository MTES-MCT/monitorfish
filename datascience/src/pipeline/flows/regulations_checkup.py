import datetime
import logging
import os
from email.message import EmailMessage
from typing import List, Tuple

import jinja2
import pandas as pd
import prefect
import pytz
import requests
from prefect import Flow, task

from config import (
    BACKOFFICE_URL,
    CNSP_FRANCE_EMAIL_ADDRESS,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
)
from src.pipeline.emails.emails import create_html_email, send_email
from src.pipeline.generic_tasks import extract
from src.pipeline.processing import try_get_factory

####################################### Helpers #######################################


def make_html_hyperlinks(urls, link_texts) -> List[str]:

    if not len(urls) == len(link_texts):
        logging.warn(
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
def extract_monitorfish_regulations():
    monitorfish_regulations = extract(
        "monitorfish_remote",
        query_filepath="monitorfish/regulations_references.sql",
    )

    monitorfish_regulations = monitorfish_regulations.explode(
        "references_reglementaires", ignore_index=True
    )

    monitorfish_regulations[
        "url"
    ] = monitorfish_regulations.references_reglementaires.map(
        try_get_factory("url", error_value=None)
    )

    monitorfish_regulations[
        "reference"
    ] = monitorfish_regulations.references_reglementaires.map(
        try_get_factory("reference", error_value=None)
    )

    monitorfish_regulations = monitorfish_regulations.drop(
        columns=["references_reglementaires"]
    )

    return monitorfish_regulations


@task(checkpoint=False)
def extract_legipeche_regulations():
    return extract(
        "monitorfish_remote",
        query_filepath="monitorfish/legipeche.sql",
    )


@task(checkpoint=False)
def get_extraction_datetimes(legipeche_regulations: pd.DataFrame) -> Tuple[str, str]:

    previous_extraction_datetime_utc = legipeche_regulations.loc[
        legipeche_regulations.extraction_occurence == "previous",
        "extraction_datetime_utc",
    ].iloc[0]

    latest_extraction_datetime_utc = legipeche_regulations.loc[
        legipeche_regulations.extraction_occurence == "latest",
        "extraction_datetime_utc",
    ].iloc[0]

    def naive_datetime_utc_to_paris_datetime_string(naive_dt_utc: datetime.datetime):
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

    legipeche_latest_page_urls = set(
        legipeche_regulations.loc[
            legipeche_regulations.extraction_occurence == "latest", "page_url"
        ]
    )
    legipeche_previous_page_urls = set(
        legipeche_regulations.loc[
            legipeche_regulations.extraction_occurence == "previous", "page_url"
        ]
    )
    legipeche_stable_page_urls = legipeche_latest_page_urls.intersection(
        legipeche_previous_page_urls
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

    monitorfish_regulations_urls = set(monitorfish_regulations.url)

    modified_legipeche_regulations = legipeche_regulations[
        (legipeche_regulations.document_url.isin(legipeche_modified_documents))
        & (legipeche_regulations.page_url.isin(legipeche_stable_page_urls))
        & (legipeche_regulations.page_url.isin(monitorfish_regulations_urls))
    ]

    return modified_legipeche_regulations


@task(checkpoint=False)
def transform_modified_regulations(
    modified_regulations: pd.DataFrame, monitorfish_regulations: pd.DataFrame
) -> pd.DataFrame:

    #     # Add modified data for testing
    #     page_url = modified_regulations.page_url.sample(1).values[0]
    #     page_title = modified_regulations.loc[modified_regulations.page_url == page_url, "page_title"].iloc[0]
    #     monitorfish_regulations = pd.concat([
    #         monitorfish_regulations,
    #         pd.DataFrame(
    #             columns=list(monitorfish_regulations),
    #             data=[[
    #                 "Reg locale",
    #                 "Test modification document",
    #                 "Zone de test",
    #                 page_url,
    #                 page_title
    #             ]]
    #         )
    #     ])

    modified_regulations = pd.merge(
        monitorfish_regulations,
        modified_regulations,
        left_on="url",
        right_on="page_url",
    )

    modified_regulations[
        "Modification"
    ] = modified_regulations.extraction_occurence.map(
        lambda s: "Ajout de document" if s == "latest" else "Suppression de document"
    )

    modified_regulations["Référence réglementaire"] = make_html_hyperlinks(
        modified_regulations.url, modified_regulations.reference
    )

    modified_regulations["Document"] = make_html_hyperlinks(
        modified_regulations.document_url, modified_regulations.document_title
    )

    modified_regulations = (
        modified_regulations[
            [
                "law_type",
                "layer_name",
                "zones",
                "Référence réglementaire",
                "Modification",
                "Document",
            ]
        ]
        .sort_values(
            [
                "law_type",
                "layer_name",
                "zones",
                "Référence réglementaire",
                "Modification",
                "Document",
            ]
        )
        .rename(
            columns={
                "law_type": "Type de réglementation",
                "layer_name": "Thématique",
                "zones": "Zone",
            }
        )
    )

    return modified_regulations


@task(checkpoint=False)
def get_missing_references(monitorfish_regulations: pd.DataFrame) -> pd.DataFrame:
    return (
        monitorfish_regulations.loc[
            monitorfish_regulations.reference.isna(),
            ["law_type", "layer_name", "zones"],
        ]
        .copy(deep=True)
        .sort_values(["law_type", "layer_name", "zones"])
        .rename(
            columns={
                "law_type": "Type de réglementation",
                "layer_name": "Thématique",
                "zones": "Zone",
            }
        )
    )


@task(checkpoint=False)
def get_unknown_links(
    monitorfish_regulations: pd.DataFrame,
    legipeche_regulations: pd.DataFrame,
) -> pd.DataFrame:

    logger = prefect.context.get("logger")

    monitorfish_urls = set(monitorfish_regulations.url)
    legipeche_urls = set(legipeche_regulations.page_url)

    unknown_links = monitorfish_urls - legipeche_urls

    logger.info(
        (
            f"Out of {len(monitorfish_urls)} distincts urls in "
            f"monitorfish_regulation, {len(unknown_links)} were not found in the "
            "legipeche table."
        )
    )

    return unknown_links


@task(checkpoint=False)
def get_dead_links(
    monitorfish_regulations: pd.DataFrame,
    unknown_links: set,
) -> pd.DataFrame:

    logger = prefect.context.get("logger")

    for proxy_env in ["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"]:
        if proxy_env in os.environ:
            os.environ.pop(proxy_env)

    logger.info(
        (
            f"Performing requests on {len(unknown_links)} unknown urls to check "
            "whether they are dead links..."
        )
    )

    dead_links_urls = []
    for unknown_link in unknown_links:
        try:
            unknown_link_alias = unknown_link.replace(
                "intranets.developpement-durable.ader.gouv.fr",
                "i2",
            )
            r = requests.get(unknown_link_alias)
            r.raise_for_status()
        except:
            logger.info(f"{unknown_link} is a dead link.")
            dead_links_urls.append(unknown_link)

    # null references are missing_references, not dead_links
    dead_links = monitorfish_regulations[
        (monitorfish_regulations.url.isin(dead_links_urls))
        & (monitorfish_regulations.reference.notnull())
    ]

    return dead_links


@task(checkpoint=False)
def format_dead_links(dead_links: pd.DataFrame) -> pd.DataFrame:

    dead_links = dead_links.rename(
        columns={
            "law_type": "Type de réglementation",
            "layer_name": "Thématique",
            "zones": "Zone",
        }
    ).copy(deep=True)

    dead_links["Référence réglementaire"] = make_html_hyperlinks(
        dead_links.url, dead_links.reference
    )
    dead_links = dead_links[
        ["Type de réglementation", "Thématique", "Zone", "Référence réglementaire"]
    ]
    dead_links = dead_links.sort_values(
        ["Type de réglementation", "Thématique", "Zone", "Référence réglementaire"]
    )
    return dead_links


@task(checkpoint=False)
def get_main_template() -> jinja2.environment.Template:

    with open(EMAIL_TEMPLATES_LOCATION / "regulations_checkup/main.html", "r") as f:
        return jinja2.Template(f.read())


@task(checkpoint=False)
def get_body_template() -> jinja2.environment.Template:

    with open(EMAIL_TEMPLATES_LOCATION / "regulations_checkup/body.html", "r") as f:
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
    backoffice_url: str,
):

    email_content = {
        "previous_extraction_datetime_utc": previous_extraction_datetime_utc,
        "latest_extraction_datetime_utc": latest_extraction_datetime_utc,
        "verification_date": datetime.date.today().strftime("%d/%m/%Y"),
        "backoffice_url": backoffice_url,
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
def send_message(msg: str):
    send_email(msg)


with Flow("Regulations checkup") as flow:

    # Extract data
    monitorfish_regulations = extract_monitorfish_regulations()
    legipeche_regulations = extract_legipeche_regulations()

    # Extract output templates
    main_template = get_main_template()
    body_template = get_body_template()
    style = get_style()

    # Transform data
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

    dead_links = get_dead_links(
        monitorfish_regulations,
        unknown_links,
    )

    dead_links = format_dead_links(dead_links)

    # Render email
    body = render_body(
        body_template=body_template,
        previous_extraction_datetime_utc=previous_extraction_datetime_utc,
        latest_extraction_datetime_utc=latest_extraction_datetime_utc,
        missing_references=missing_references,
        modified_regulations=modified_regulations,
        dead_links=dead_links,
        backoffice_url=BACKOFFICE_URL,
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
