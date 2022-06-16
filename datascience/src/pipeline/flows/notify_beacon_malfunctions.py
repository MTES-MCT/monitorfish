from datetime import datetime
from email.message import EmailMessage
from typing import List, Union

import pandas as pd
import weasyprint
from jinja2 import Environment, FileSystemLoader, select_autoescape
from prefect import Flow, Parameter, task, unmapped

from config import (
    CNSP_SIP_DEPARTMENT_ADDRESS,
    EMAIL_FONTS_LOCATION,
    EMAIL_IMAGES_LOCATION,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
)
from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionToNotify,
)
from src.pipeline.generic_tasks import extract
from src.pipeline.helpers.emails import create_html_email, resize_pdf_to_A4, send_email
from src.pipeline.helpers.spatial import Position, position_to_position_representation

cnsp_logo_path = EMAIL_IMAGES_LOCATION / "logo_cnsp.jpg"


@task(checkpoint=False)
def extract_malfunctions_to_notify():
    return extract("monitorfish_remote", "monitorfish/malfunctions_to_notify.sql")


@task(checkpoint=False)
def to_malfunctions_to_notify_list(
    malfunctions_to_notify: pd.DataFrame,
) -> List[BeaconMalfunctionToNotify]:
    records = malfunctions_to_notify.to_dict(orient="records")
    return [BeaconMalfunctionToNotify(**record) for record in records]


@task(checkpoint=False)
def get_templates() -> dict:

    templates_locations = [
        EMAIL_TEMPLATES_LOCATION / "beacon_malfunctions",
        EMAIL_STYLESHEETS_LOCATION,
    ]

    env = Environment(
        loader=FileSystemLoader(templates_locations), autoescape=select_autoescape()
    )

    templates = {
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION: env.get_template(
            "malfunction_at_sea_initial_notification.html"
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION: env.get_template(
            "malfunction_at_port_initial_notification.html"
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER: env.get_template(
            "malfunction_at_sea_reminder.html"
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_REMINDER: env.get_template(
            "malfunction_at_port_reminder.html"
        ),
        BeaconMalfunctionNotificationType.END_OF_MALFUNCTION: env.get_template(
            "end_of_malfunction.html"
        ),
    }

    return templates


@task(checkpoint=False)
def render(
    m: BeaconMalfunctionToNotify, templates: dict, output_format: str = "html"
) -> Union[str, bytes]:

    try:
        assert output_format in ("html", "pdf")
    except AssertionError:
        raise ValueError(
            f"`output_format` must be 'pdf' or 'html', got {output_format} instead."
        )

    template = templates[m.notification_type]

    previous_notification_datetime_utc = (
        m.previous_notification_datetime_utc.strftime("%d/%m/%Y à %Hh%M UTC")
        if pd.notnull(m.previous_notification_datetime_utc)
        # pd.NaT evaluates to True so `pd.notnull` is required
        else None
    )

    if m.last_position_latitude and m.last_position_longitude:
        last_position = Position(
            latitude=m.last_position_latitude,
            longitude=m.last_position_longitude,
        )

        last_position_representation = position_to_position_representation(
            last_position, representation_type="DMS"
        )

        latitude = last_position_representation.latitude
        longitude = last_position_representation.longitude

    else:
        latitude = None
        longitude = None

    if output_format == "html":
        # Fonts shall not be included in email body
        fonts_directory = None
        logo_src = f"cid:{cnsp_logo_path.name}"

    else:
        fonts_directory = EMAIL_FONTS_LOCATION.as_uri()
        logo_src = cnsp_logo_path.as_uri()

    html = template.render(
        fonts_directory=fonts_directory,
        logo_src=logo_src,
        notification_date=datetime.utcnow().strftime("%d/%m/%Y"),
        previous_notification_datetime_utc=previous_notification_datetime_utc,
        object=m.notification_type.to_message_object(),
        vessel_name=m.vessel_name,
        cfr=m.vessel_cfr_or_immat_or_ircs,
        beacon_number=m.beacon_number,
        beacon_operator=m.satellite_operator,
        last_position_datetime_utc=m.malfunction_start_date_utc.strftime(
            "%d/%m/%Y à %Hh%M UTC"
        ),
        last_position_latitude=latitude,
        last_position_longitude=longitude,
    )

    if output_format == "pdf":
        pdf = weasyprint.HTML(string=html).write_pdf(optimize_size=("fonts", "images"))
        pdf = resize_pdf_to_A4(pdf)
        return pdf

    else:
        return html


@task(checkpoint=False)
def create_email(
    html: str, pdf: bytes, m: BeaconMalfunctionToNotify, test_mode: bool
) -> EmailMessage:

    if m.vessel_emails:
        vessel_emails = m.vessel_emails
    else:
        vessel_emails = []

    if m.satellite_operator_emails:
        satellite_operator_emails = m.satellite_operator_emails
    else:
        satellite_operator_emails = []

    if m.operator_email:
        operator_emails = [m.operator_email]
    else:
        operator_emails = []

    recipients = vessel_emails + operator_emails + satellite_operator_emails

    to = recipients if not test_mode else CNSP_SIP_DEPARTMENT_ADDRESS
    cc = CNSP_SIP_DEPARTMENT_ADDRESS if not test_mode else None

    msg = create_html_email(
        to=to,
        cc=cc,
        subject=m.notification_type.to_message_object(),
        html=html,
        images=[cnsp_logo_path],
        attachments={"Notification.pdf": pdf},
    )

    return msg


@task(checkpoint=False)
def send_message(msg: str, m: BeaconMalfunctionToNotify) -> dict:
    """
    Sends input email message. See `src.pipeline.helpers.emails.send_email` for more
    information.
    """
    send_errors = send_email(msg)
    return send_errors


with Flow("Notify malfunctions") as flow:

    test_mode = Parameter("test_mode")
    malfunctions_to_notify = extract_malfunctions_to_notify()
    malfunctions_to_notify = to_malfunctions_to_notify_list(malfunctions_to_notify)
    templates = get_templates()

    html = render.map(
        malfunctions_to_notify,
        templates=unmapped(templates),
        output_format=unmapped("html"),
    )

    pdf = render.map(
        malfunctions_to_notify,
        templates=unmapped(templates),
        output_format=unmapped("pdf"),
    )

    email = create_email.map(
        html=html, pdf=pdf, m=malfunctions_to_notify, test_mode=unmapped(test_mode)
    )
