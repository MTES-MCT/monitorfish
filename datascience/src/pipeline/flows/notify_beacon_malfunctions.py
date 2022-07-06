from datetime import datetime
from email.message import EmailMessage
from pathlib import Path
from smtplib import (
    SMTPDataError,
    SMTPHeloError,
    SMTPNotSupportedError,
    SMTPRecipientsRefused,
    SMTPSenderRefused,
)
from time import sleep
from typing import List, Union

import css_inline
import pandas as pd
import prefect
import sqlalchemy
import weasyprint
from jinja2 import Environment, FileSystemLoader, select_autoescape
from prefect import Flow, Parameter, flatten, task, unmapped
from sqlalchemy import Table, update

from config import (
    CNSP_SIP_DEPARTMENT_ADDRESS,
    EMAIL_FONTS_LOCATION,
    EMAIL_IMAGES_LOCATION,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
)
from src.db_config import create_engine
from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionNotification,
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionToNotify,
    CommunicationMeans,
)
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.emails import create_html_email, resize_pdf_to_A4, send_email
from src.pipeline.helpers.spatial import Position, position_to_position_representation
from src.pipeline.shared_tasks.infrastructure import get_table

cnsp_logo_path = EMAIL_IMAGES_LOCATION / "logo_cnsp.jpg"


@task(checkpoint=False)
def extract_malfunctions_to_notify():
    return extract("monitorfish_remote", "monitorfish/malfunctions_to_notify.sql")


@task(checkpoint=False)
def to_malfunctions_to_notify_list(
    malfunctions_to_notify: pd.DataFrame, test_mode: bool
) -> List[BeaconMalfunctionToNotify]:
    records = malfunctions_to_notify.to_dict(orient="records")
    return [
        BeaconMalfunctionToNotify(**record, test_mode=test_mode) for record in records
    ]


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

    # `nan` evaluates to True so `pd.notnull` is required
    if pd.notnull(m.last_position_latitude) and pd.notnull(m.last_position_longitude):
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
        object=m.notification_type.to_message_subject(),
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
        html = css_inline.inline(html, remove_style_tags=True)
        return html


@task(checkpoint=False)
def create_email(html: str, pdf: bytes, m: BeaconMalfunctionToNotify) -> EmailMessage:

    to = [
        email_addressee.address_or_number
        for email_addressee in m.get_email_addressees()
    ]

    cc = CNSP_SIP_DEPARTMENT_ADDRESS if not m.test_mode else None

    msg = create_html_email(
        to=to,
        cc=cc,
        subject=m.notification_type.to_message_subject(),
        html=html,
        images=[cnsp_logo_path],
        attachments={"Notification.pdf": pdf},
    )

    return msg


@task(checkpoint=False)
def send_email_notification(
    msg: EmailMessage, m: BeaconMalfunctionToNotify
) -> List[BeaconMalfunctionNotification]:
    """
    Sends input email using the contents of `From` header as sender and `To`, `Cc`
    and `Bcc` headers as recipients.

    Args:
        msg (EmailMessage): email message to send

    Returns:
        dict: Dict of errors returned by the server for each recipient that was
          refused, with the following form :

          { "three@three.org" : ( 550 ,"User unknown" ) }
    """

    addressees = m.get_email_addressees()
    logger = prefect.context.get("logger")

    try:
        try:
            logger.info(f"Sending {m.notification_type} by email.")
            send_errors = send_email(msg)
        except (SMTPHeloError, SMTPDataError):
            # Retry
            logger.info("Email not sent, retrying...")
            sleep(10)
            send_errors = send_email(msg)
    except SMTPHeloError:
        send_errors = {
            addr: (None, "The server didn't reply properly to the helo greeting.")
            for addr in addressees
        }
    except SMTPRecipientsRefused:
        # All recipients were refused
        send_errors = {
            addr: (None, "The server rejected ALL recipients (no mail was sent)")
            for addr in addressees
        }
    except SMTPSenderRefused:
        send_errors = {
            addr: (None, "The server didn't accept the from_addr.")
            for addr in addressees
        }
    except SMTPDataError:
        send_errors = {
            addr: (
                None,
                (
                    "The server replied with an unexpected error code "
                    "(other than a refusal of a recipient)."
                ),
            )
            for addr in addressees
        }
    except SMTPNotSupportedError:
        send_errors = {
            addr: (
                None,
                (
                    "The mail_options parameter includes 'SMTPUTF8' but the SMTPUTF8 "
                    "extension is not supported by the server."
                ),
            )
            for addr in addressees
        }
    except ValueError:
        send_errors = {
            addr: (None, "there is more than one set of 'Resent-' headers.")
            for addr in addressees
        }
    except:
        send_errors = {addr: (None, "Unknown error.") for addr in addressees}

    now = datetime.utcnow()

    notifications = []

    for addressee in addressees:

        if addressee.address_or_number in send_errors:
            success = False
            error_message = send_errors[addressee.address_or_number][1]
        else:
            success = True
            error_message = None

        notifications.append(
            BeaconMalfunctionNotification(
                beacon_malfunction_id=m.beacon_malfunction_id,
                date_time_utc=now,
                notification_type=m.notification_type,
                communication_means=CommunicationMeans.EMAIL,
                recipient_function=addressee.function,
                recipient_name=addressee.name,
                recipient_address_or_number=addressee.address_or_number,
                success=success,
                error_message=error_message,
            )
        )

    return notifications


@task(checkpoint=False)
def load_notifications(notifications: List[BeaconMalfunctionNotification]):
    load(
        pd.DataFrame(notifications),
        table_name="beacon_malfunction_notifications",
        schema="public",
        logger=prefect.context.get("logger"),
        how="append",
        db_name="monitorfish_remote",
        enum_columns=[
            "notification_type",
            "communication_means",
            "recipient_function",
        ],
    )


@task(checkpoint=False)
def make_reset_requested_notifications_statement(
    beacon_malfunctions_table: Table,
    notified_malfunctions: List[BeaconMalfunctionToNotify],
) -> sqlalchemy.sql.dml.Update:

    beacon_malfunction_ids_to_reset = [
        n.beacon_malfunction_id for n in notified_malfunctions
    ]

    statement = (
        update(beacon_malfunctions_table)
        .where(beacon_malfunctions_table.c.id.in_(beacon_malfunction_ids_to_reset))
        .values(notification_requested=None)
    )

    return statement


@task(checkpoint=False)
def execute_statement(reset_requested_notifications_statement):
    e = create_engine("monitorfish_remote")
    with e.begin() as conn:
        conn.execute(reset_requested_notifications_statement)


with Flow("Notify malfunctions") as flow:

    test_mode = Parameter("test_mode")

    beacon_malfunctions_table = get_table(table_name="beacon_malfunctions")
    templates = get_templates()

    malfunctions_to_notify = extract_malfunctions_to_notify()
    malfunctions_to_notify = to_malfunctions_to_notify_list(
        malfunctions_to_notify, test_mode
    )

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

    email = create_email.map(html=html, pdf=pdf, m=malfunctions_to_notify)

    notifications = send_email_notification.map(email, malfunctions_to_notify)

    load_notifications(flatten(notifications))

    reset_requested_notifications_statement = (
        make_reset_requested_notifications_statement(
            beacon_malfunctions_table=beacon_malfunctions_table,
            notified_malfunctions=malfunctions_to_notify,
            upstream_tasks=[notifications],
        )
    )

    execute_statement(reset_requested_notifications_statement)

flow.file_name = Path(__file__).name
