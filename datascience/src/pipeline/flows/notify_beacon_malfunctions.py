from datetime import datetime
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
from prefect import Flow, Parameter, case, flatten, task, unmapped
from prefect.executors import LocalDaskExecutor
from sqlalchemy import Table, update

from config import (
    CNSP_SIP_DEPARTMENT_EMAIL,
    EMAIL_FONTS_LOCATION,
    EMAIL_IMAGES_LOCATION,
    EMAIL_STYLESHEETS_LOCATION,
    EMAIL_TEMPLATES_LOCATION,
    SMS_TEMPLATES_LOCATION,
)
from src.db_config import create_engine
from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionMessageToSend,
    BeaconMalfunctionNotification,
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionToNotify,
    CommunicationMeans,
)
from src.pipeline.generic_tasks import extract, load
from src.pipeline.helpers.emails import (
    create_fax_email,
    create_html_email,
    create_sms_email,
    resize_pdf_to_A4,
    send_email,
    send_fax,
    send_sms,
)
from src.pipeline.helpers.spatial import Position, position_to_position_representation
from src.pipeline.shared_tasks.control_flow import (
    check_flow_not_running,
    filter_results,
)
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
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION: (
            env.get_template("malfunction_at_sea_initial_notification.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION: (
            env.get_template("malfunction_at_port_initial_notification.jinja")
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


@task(checkpoint=False)
def get_sms_templates() -> dict:

    env = Environment(
        loader=FileSystemLoader(SMS_TEMPLATES_LOCATION), autoescape=select_autoescape()
    )

    templates = {
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION: (
            env.get_template("malfunction_at_sea_initial_notification.jinja")
        ),
        BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION: (
            env.get_template("malfunction_at_port_initial_notification.jinja")
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
        html = css_inline.inline(html, remove_style_tags=True)
        return html


@task(checkpoint=False)
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
    )

    return text


@task(checkpoint=False)
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
            images=[cnsp_logo_path],
            attachments={"Notification.pdf": pdf},
            reply_to=CNSP_SIP_DEPARTMENT_EMAIL,
        )

        return BeaconMalfunctionMessageToSend(
            message=message,
            beacon_malfunction_to_notify=m,
            communication_means=CommunicationMeans.EMAIL,
        )
    else:
        return None


@task(checkpoint=False)
def create_sms(
    text: str, m: BeaconMalfunctionToNotify
) -> BeaconMalfunctionMessageToSend:

    to = [sms_addressee.address_or_number for sms_addressee in m.get_sms_addressees()]

    if to:
        return BeaconMalfunctionMessageToSend(
            message=create_sms_email(to=to, text=text),
            beacon_malfunction_to_notify=m,
            communication_means=CommunicationMeans.SMS,
        )
    else:
        return None


@task(checkpoint=False)
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


@task(checkpoint=False)
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
    logger = prefect.context.get("logger")

    send_functions = {
        CommunicationMeans.EMAIL: send_email,
        CommunicationMeans.SMS: send_sms,
        CommunicationMeans.FAX: send_fax,
    }

    send = send_functions[communication_means]

    try:
        try:
            if is_integration:
                logger.info(
                    (
                        f"(Mock) Sending {m.notification_type} by "
                        f"{communication_means.value.lower()}."
                    )
                )
                send_errors = {}
            else:
                logger.info(
                    (
                        f"Sending {m.notification_type} by "
                        f"{communication_means.value.lower()}."
                    )
                )
                send_errors = send(msg)
        except (SMTPHeloError, SMTPDataError):
            # Retry
            logger.warning("Message not sent, retrying...")
            sleep(10)
            send_errors = send(msg)
    except SMTPHeloError:
        send_errors = {
            addr.address_or_number: (
                None,
                "The server didn't reply properly to the helo greeting.",
            )
            for addr in addressees
        }
        logger.error(str(send_errors))
    except SMTPRecipientsRefused:
        # All recipients were refused
        send_errors = {
            addr.address_or_number: (
                None,
                "The server rejected ALL recipients (no mail was sent)",
            )
            for addr in addressees
        }
        logger.error(str(send_errors))
    except SMTPSenderRefused:
        send_errors = {
            addr.address_or_number: (None, "The server didn't accept the from_addr.")
            for addr in addressees
        }
        logger.error(str(send_errors))
    except SMTPDataError:
        send_errors = {
            addr.address_or_number: (
                None,
                (
                    "The server replied with an unexpected error code "
                    "(other than a refusal of a recipient)."
                ),
            )
            for addr in addressees
        }
        logger.error(str(send_errors))
    except SMTPNotSupportedError:
        send_errors = {
            addr.address_or_number: (
                None,
                (
                    "The mail_options parameter includes 'SMTPUTF8' but the SMTPUTF8 "
                    "extension is not supported by the server."
                ),
            )
            for addr in addressees
        }
        logger.error(str(send_errors))
    except ValueError:
        send_errors = {
            addr.address_or_number: (
                None,
                "there is more than one set of 'Resent-' headers.",
            )
            for addr in addressees
        }
        logger.error(str(send_errors))
    except Exception:
        send_errors = {
            addr.address_or_number: (None, "Unknown error.") for addr in addressees
        }
        logger.error(str(send_errors))

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


@task(checkpoint=False)
def load_notifications(notifications: List[BeaconMalfunctionNotification]):
    if notifications:
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
        .values(
            notification_requested=None, requested_notification_foreign_fmc_code=None
        )
    )

    return statement


@task(checkpoint=False)
def execute_statement(reset_requested_notifications_statement):
    e = create_engine("monitorfish_remote")
    with e.begin() as conn:
        conn.execute(reset_requested_notifications_statement)


with Flow("Notify malfunctions", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        test_mode = Parameter("test_mode")
        is_integration = Parameter("is_integration")

        beacon_malfunctions_table = get_table(table_name="beacon_malfunctions")
        templates = get_templates()
        sms_templates = get_sms_templates()

        malfunctions_to_notify = extract_malfunctions_to_notify()
        malfunctions_to_notify = to_malfunctions_to_notify_list(
            malfunctions_to_notify, test_mode
        )

        sms_text = render_sms.map(
            malfunctions_to_notify, templates=unmapped(sms_templates)
        )
        sms_text = filter_results(sms_text)

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
        email = filter_results(email)

        sms = create_sms.map(text=sms_text, m=malfunctions_to_notify)
        sms = filter_results(sms)

        fax = create_fax.map(pdf=pdf, m=malfunctions_to_notify)
        fax = filter_results(fax)

        messages_to_send = flatten([flatten(email), flatten(sms), flatten(fax)])

        notifications = send_beacon_malfunction_message.map(
            messages_to_send, is_integration=unmapped(is_integration)
        )
        notifications = filter_results(notifications)
        load_notifications(flatten(notifications))

        reset_requested_notifications_statement = (
            make_reset_requested_notifications_statement(
                beacon_malfunctions_table=beacon_malfunctions_table,
                notified_malfunctions=malfunctions_to_notify,
            )
        )

        execute_statement(reset_requested_notifications_statement)

flow.file_name = Path(__file__).name
