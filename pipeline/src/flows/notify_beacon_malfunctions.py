from datetime import datetime
from typing import Callable, List, Union

import css_inline
import pandas as pd
import sqlalchemy
import weasyprint
from jinja2 import Environment, FileSystemLoader, select_autoescape
from prefect import allow_failure, flow, get_run_logger, task, unmapped
from sqlalchemy import Table, update

from config import (
    CNSP_LOGO_PATH,
    CNSP_SIP_DEPARTMENT_EMAIL,
    EMAIL_FONTS_LOCATION,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
    SMS_TEMPLATES_LOCATION,
)
from src.entities.beacon_malfunctions import (
    BeaconMalfunctionMessageToSend,
    BeaconMalfunctionNotification,
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionToNotify,
)
from src.entities.communication_means import CommunicationMeans
from src.generic_tasks import extract, load
from src.helpers.emails import (
    create_fax_email,
    create_html_email,
    create_sms_email,
    resize_pdf_to_A4,
    send_email_or_sms_or_fax_message,
)
from src.helpers.spatial import Position, position_to_position_representation
from src.shared_tasks.control_flow import filter_results, flatten
from src.shared_tasks.infrastructure import execute_statement, get_table


@task
def extract_malfunctions_to_notify():
    return extract("monitorfish_remote", "monitorfish/malfunctions_to_notify.sql")


@task
def to_malfunctions_to_notify_list(
    malfunctions_to_notify: pd.DataFrame, test_mode: bool
) -> List[BeaconMalfunctionToNotify]:
    records = malfunctions_to_notify.to_dict(orient="records")
    return [
        BeaconMalfunctionToNotify(**record, test_mode=test_mode) for record in records
    ]


@task
def get_templates() -> dict:
    templates_locations = [
        EMAIL_TEMPLATES_LOCATION / "beacon_malfunctions",
        EMAIL_STYLESHEETS_LOCATION,
    ]

    env = Environment(
        loader=FileSystemLoader(templates_locations), autoescape=select_autoescape()
    )

    templates = {
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION: (
            env.get_template("malfunction_at_sea_initial_notification.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON: (
            env.get_template(
                "malfunction_at_sea_initial_notification_unsupervised_beacon.jinja"
            )
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION: (
            env.get_template("malfunction_at_port_initial_notification.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON: (
            env.get_template(
                "malfunction_at_port_initial_notification_unsupervised_beacon.jinja"
            )
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER: (
            env.get_template("malfunction_at_sea_reminder.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_REMINDER: (
            env.get_template("malfunction_at_port_reminder.jinja")
        ),
        BeaconMalfunctionNotificationType.END_OF_MALFUNCTION: (
            env.get_template("end_of_malfunction.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC: (
            env.get_template("malfunction_notification_to_foreign_fmc.jinja")
        ),
    }

    return templates


@task
def get_sms_templates() -> dict:
    env = Environment(
        loader=FileSystemLoader(SMS_TEMPLATES_LOCATION), autoescape=select_autoescape()
    )

    templates = {
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION: (
            env.get_template("malfunction_at_sea_initial_notification.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON: (
            env.get_template(
                "malfunction_initial_notification_unsupervised_beacon.jinja"
            )
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION: (
            env.get_template("malfunction_at_port_initial_notification.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON: (
            env.get_template(
                "malfunction_initial_notification_unsupervised_beacon.jinja"
            )
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER: (
            env.get_template("malfunction_at_sea_reminder.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_REMINDER: (
            env.get_template("malfunction_at_port_reminder.jinja")
        ),
        BeaconMalfunctionNotificationType.END_OF_MALFUNCTION: (
            env.get_template("end_of_malfunction.jinja")
        ),
    }

    return templates


@task
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
        logo_src = f"cid:{CNSP_LOGO_PATH.name}"

    else:
        fonts_directory = EMAIL_FONTS_LOCATION.as_uri()
        logo_src = CNSP_LOGO_PATH.as_uri()

    html = template.render(
        fonts_directory=fonts_directory,
        logo_src=logo_src,
        notification_date=datetime.utcnow().strftime("%d/%m/%Y"),
        previous_notification_datetime_utc=previous_notification_datetime_utc,
        object=m.get_notification_subject(),
        vessel_name=m.vessel_name,
        cfr=m.vessel_cfr_or_immat_or_ircs,
        beacon_number=m.beacon_number,
        beacon_operator=m.satellite_operator,
        last_position_datetime_utc=m.get_formatted_malfunction_start_datetime_utc(),
        last_position_latitude=latitude,
        last_position_longitude=longitude,
        foreign_fmc_name=m.foreign_fmc_name,
    )

    if output_format == "pdf":
        pdf = weasyprint.HTML(string=html).write_pdf(optimize_size=("fonts", "images"))
        pdf = resize_pdf_to_A4(pdf)
        return pdf

    else:
        html = css_inline.inline(html)
        return html


@task
def render_sms(m: BeaconMalfunctionToNotify, templates: dict) -> str:
    if (
        m.notification_type
        is BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC
    ):
        return None

    template = templates[m.notification_type]

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

    text = template.render(
        last_position_datetime_utc=m.malfunction_start_date_utc.strftime(
            "%d/%m/%Y à %Hh%M UTC"
        ),
        last_position_latitude=latitude,
        last_position_longitude=longitude,
        vessel_name=m.vessel_name,
    )

    return text


@task
def create_email(
    html: str, pdf: bytes, m: BeaconMalfunctionToNotify
) -> BeaconMalfunctionMessageToSend:
    to = [
        email_addressee.address_or_number
        for email_addressee in m.get_email_addressees()
    ]

    cc = CNSP_SIP_DEPARTMENT_EMAIL if not m.test_mode else None

    if to:
        message = create_html_email(
            to=to,
            cc=cc,
            subject=m.get_notification_subject(),
            html=html,
            images=[CNSP_LOGO_PATH],
            attachments=[("Notification.pdf", pdf)],
            reply_to=CNSP_SIP_DEPARTMENT_EMAIL,
        )

        return BeaconMalfunctionMessageToSend(
            message=message,
            beacon_malfunction_to_notify=m,
            communication_means=CommunicationMeans.EMAIL,
        )
    else:
        return None


@task
def create_sms(
    text: str | None, m: BeaconMalfunctionToNotify
) -> BeaconMalfunctionMessageToSend:
    to = [sms_addressee.address_or_number for sms_addressee in m.get_sms_addressees()]

    if to and text:
        return BeaconMalfunctionMessageToSend(
            message=create_sms_email(to=to, text=text),
            beacon_malfunction_to_notify=m,
            communication_means=CommunicationMeans.SMS,
        )
    else:
        return None


@task
def create_fax(
    pdf: bytes, m: BeaconMalfunctionToNotify
) -> BeaconMalfunctionMessageToSend:
    to = [fax_addressee.address_or_number for fax_addressee in m.get_fax_addressees()]

    if to:
        return BeaconMalfunctionMessageToSend(
            message=create_fax_email(to=to, pdf=pdf),
            beacon_malfunction_to_notify=m,
            communication_means=CommunicationMeans.FAX,
        )
    else:
        return None


@task
def send_beacon_malfunction_message(
    msg_to_send: BeaconMalfunctionMessageToSend, is_integration: bool
) -> List[BeaconMalfunctionNotification]:
    """
    Sends input email using the contents of `From` header as sender and `To`, `Cc`
    and `Bcc` headers as recipients.

    Args:
        msg (EmailMessage): email message to send
        is_integration (bool): if ``False``, the message is not actually sent

    Returns:
        dict: Dict of errors returned by the server for each recipient that was
        refused, with the following form {"three@three.org" : ( 550 ,"User unknown" )}
    """

    addressees = msg_to_send.get_addressees()
    m = msg_to_send.beacon_malfunction_to_notify
    msg = msg_to_send.message
    communication_means = msg_to_send.communication_means
    logger = get_run_logger()

    send_errors = send_email_or_sms_or_fax_message(
        msg, communication_means, is_integration, logger
    )
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
                communication_means=communication_means,
                recipient_function=addressee.function,
                recipient_name=addressee.name,
                recipient_address_or_number=addressee.address_or_number,
                success=success,
                error_message=error_message,
            )
        )
    return notifications


@task
def load_notifications(notifications: List[BeaconMalfunctionNotification]):
    if notifications:
        load(
            pd.DataFrame(notifications),
            table_name="beacon_malfunction_notifications",
            schema="public",
            logger=get_run_logger(),
            how="append",
            db_name="monitorfish_remote",
            enum_columns=[
                "notification_type",
                "communication_means",
                "recipient_function",
            ],
        )


@task
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
        .values(
            notification_requested=None, requested_notification_foreign_fmc_code=None
        )
    )

    return statement


@flow(name="Notify malfunctions")
def notify_beacon_malfunctions_flow(
    test_mode: bool,
    is_integration: bool,
    send_beacon_malfunction_message_fn: Callable = send_beacon_malfunction_message,
):
    beacon_malfunctions_table = get_table(table_name="beacon_malfunctions")
    templates = get_templates()
    sms_templates = get_sms_templates()

    malfunctions_to_notify = extract_malfunctions_to_notify()
    malfunctions_to_notify = to_malfunctions_to_notify_list(
        malfunctions_to_notify, test_mode
    )

    sms_text = render_sms.map(malfunctions_to_notify, templates=unmapped(sms_templates))

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
    email = filter_results(allow_failure(email))

    sms = create_sms.map(text=sms_text, m=malfunctions_to_notify)
    sms = filter_results(allow_failure(sms))

    fax = create_fax.map(pdf=pdf, m=malfunctions_to_notify)
    fax = filter_results(allow_failure(fax))

    messages_to_send = flatten([email, sms, fax])

    notifications = send_beacon_malfunction_message_fn.map(
        messages_to_send, is_integration=unmapped(is_integration)
    )
    notifications = filter_results(allow_failure(notifications))
    load_notifications(flatten(notifications))

    reset_requested_notifications_statement = (
        make_reset_requested_notifications_statement(
            beacon_malfunctions_table=beacon_malfunctions_table,
            notified_malfunctions=malfunctions_to_notify,
        )
    )

    execute_statement(reset_requested_notifications_statement)
