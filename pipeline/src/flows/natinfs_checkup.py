import io
import logging
from email.message import EmailMessage
from typing import List, Tuple

import jinja2
import pandas as pd
import requests
from prefect import flow, get_run_logger, task

from config import (
    CNSP_FRANCE_EMAIL_ADDRESS,
    DATAGOUV_API_ENDPOINT,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
    NATINFS_CHECKUP_EMAIL_ADDRESSES,
    NATINFS_DATASET_ID,
    PROXIES,
)
from src.generic_tasks import extract
from src.helpers.emails import create_html_email, send_email
from src.sentry import report_flow_failure_to_sentry
from src.shared_tasks.dates import get_utcnow


@task
def extract_official_natinfs(
    dataset_id: str, proxies: dict
) -> Tuple[pd.DataFrame, str]:
    """
    Extracts the NATINFs in force from the latest quarterly list published on
    data.gouv.fr.

    Returns:
        Tuple[pd.DataFrame, str]: NATINFs with columns `natinf_code` and
          `official_infraction`, and the title of the data.gouv.fr resource they were
          read from
    """
    r = requests.get(
        f"{DATAGOUV_API_ENDPOINT}/datasets/{dataset_id}/", proxies=proxies, timeout=30
    )
    r.raise_for_status()
    latest_resource = max(
        r.json()["resources"], key=lambda resource: resource["last_modified"]
    )

    r = requests.get(latest_resource["url"], proxies=proxies, timeout=60)
    r.raise_for_status()

    official_natinfs = pd.read_csv(
        io.BytesIO(r.content),
        sep=";",
        encoding="cp1252",
        usecols=["Numéro NATINF", "Qualification de l'infraction"],
    ).rename(
        columns={
            "Numéro NATINF": "natinf_code",
            "Qualification de l'infraction": "official_infraction",
        }
    )

    # An empty or truncated file would flag every NATINF as expired
    if len(official_natinfs) < 1000:
        raise ValueError(
            f"Only {len(official_natinfs)} NATINFs found in {latest_resource['url']}"
        )

    return official_natinfs, latest_resource["title"]


@task
def extract_infraction_threat_characterization() -> pd.DataFrame:
    return extract(
        "monitorfish_remote",
        query_filepath="monitorfish/infraction_threat_characterization.sql",
    )


@task
def get_expired_natinfs(
    infraction_threat_characterization: pd.DataFrame,
    official_natinfs: pd.DataFrame,
) -> pd.DataFrame:
    """
    Returns the threat characterizations of NATINFs which are not in force anymore.
    """
    expired_natinfs = infraction_threat_characterization[
        ~infraction_threat_characterization.natinf_code.isin(
            official_natinfs.natinf_code
        )
    ]

    return (
        expired_natinfs.rename(
            columns={
                "natinf_code": "NATINF",
                "infraction": "Libellé",
                "threat": "Menace",
                "threat_characterization": "Caractérisation de la menace",
                "isr_code": "Code ISR",
            }
        )
        .reset_index(drop=True)
        .copy(deep=True)
    )


@task
def get_main_template() -> jinja2.environment.Template:
    with open(EMAIL_TEMPLATES_LOCATION / "natinfs_checkup/main.jinja", "r") as f:
        return jinja2.Template(f.read())


@task
def get_body_template() -> jinja2.environment.Template:
    with open(EMAIL_TEMPLATES_LOCATION / "natinfs_checkup/body.jinja", "r") as f:
        return jinja2.Template(f.read())


@task
def get_style() -> str:
    with open(EMAIL_STYLESHEETS_LOCATION / "splendid.css") as f:
        style = f.read()
    return style


@task
def render_body(
    body_template: jinja2.environment.Template,
    expired_natinfs: pd.DataFrame,
    official_natinfs_source: str,
    utcnow,
) -> str:
    return body_template.render(
        expired_natinfs=expired_natinfs.to_html(
            index=False, justify="center", na_rep="-"
        ),
        n_expired_natinfs=expired_natinfs["NATINF"].nunique(),
        official_natinfs_source=official_natinfs_source,
        verification_date=utcnow.date().strftime("%d/%m/%Y"),
    )


@task
def render_main(
    main_template: jinja2.environment.Template, style: str, body: str
) -> str:
    return main_template.render(style=style, body=body)


@task
def get_recipients() -> List[str]:
    try:
        assert CNSP_FRANCE_EMAIL_ADDRESS is not None
    except AssertionError:
        logging.error("CNSP_FRANCE_EMAIL_ADDRESS environment variable is not set.")
        raise

    return [CNSP_FRANCE_EMAIL_ADDRESS, *NATINFS_CHECKUP_EMAIL_ADDRESSES]


@task
def create_message(html: str, recipients: List[str]) -> EmailMessage:
    return create_html_email(
        to=recipients,
        subject="[Monitorfish] NATINF qui ne sont plus en vigueur",
        html=html,
    )


@task
def send_message(msg: EmailMessage):
    send_email(msg)


@flow(
    name="Monitorfish - NATINFs checkup",
    on_failure=[report_flow_failure_to_sentry],
    on_crashed=[report_flow_failure_to_sentry],
)
def natinfs_checkup_flow(
    natinfs_dataset_id: str = NATINFS_DATASET_ID, proxies: dict = PROXIES
):
    logger = get_run_logger()

    official_natinfs, official_natinfs_source = extract_official_natinfs(
        natinfs_dataset_id, proxies
    )
    infraction_threat_characterization = extract_infraction_threat_characterization()
    utcnow = get_utcnow()

    expired_natinfs = get_expired_natinfs(
        infraction_threat_characterization, official_natinfs
    )

    if len(expired_natinfs) == 0:
        logger.info(
            f"All NATINFs of the threat hierarchy are in {official_natinfs_source}."
        )
        return None

    body = render_body(
        body_template=get_body_template(),
        expired_natinfs=expired_natinfs,
        official_natinfs_source=official_natinfs_source,
        utcnow=utcnow,
    )
    html = render_main(main_template=get_main_template(), style=get_style(), body=body)

    msg = create_message(html, get_recipients())
    send_message(msg)
    return msg
