import io
from copy import deepcopy
from datetime import datetime, timedelta
from email.message import EmailMessage
from pathlib import Path
from unittest.mock import patch

import pandas as pd
import pypdf
import pytest
from dateutil.relativedelta import relativedelta
from jinja2 import Template
from prefect import task
from pytest import fixture

from config import EMAIL_IMAGES_LOCATION, TEST_DATA_LOCATION
from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionMessageToSend,
    BeaconMalfunctionNotification,
    BeaconMalfunctionNotificationRecipientFunction,
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionToNotify,
    CommunicationMeans,
)
from src.pipeline.flows.notify_beacon_malfunctions import (
    create_email,
    create_fax,
    create_sms,
    extract_malfunctions_to_notify,
    flow,
    get_sms_templates,
    get_templates,
    load_notifications,
    render,
    render_sms,
    send_beacon_malfunction_message,
    to_malfunctions_to_notify_list,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running, mock_datetime_utcnow

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)

malfunctions_to_notify_shared_data = {
    "beacon_malfunction_id": [1, 2, 3, 4, 5],
    "vessel_cfr_or_immat_or_ircs": [
        "ABC000542519",
        "SB125334",
        "ZZTOPACDC",
        "AB123456",
        "ABC000306959",
    ],
    "beacon_number": ["123456", "A56CZ2", "BEA951357", "BEACON_NOT_EMITTING", "987654"],
    "vessel_name": [
        "DEVINER FIGURE CONSCIENCE",
        "JOUR INTÉRESSER VOILÀ",
        "I DO 4H REPORT",
        "I NEVER EMITTED BUT SHOULD HAVE",
        "ÉTABLIR IMPRESSION LORSQUE",
    ],
    "last_position_latitude": [45.236, 42.843, -8.5690, -6.862, -6.162],
    "last_position_longitude": [-3.569, -8.568, -23.1569, 51.1686, 50.185],
    "notification_type": [
        "END_OF_MALFUNCTION",
        "MALFUNCTION_AT_SEA_REMINDER",
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION",
        "MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC",
        "MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC",
    ],
    "vessel_emails": [
        ["figure@conscience.fr", "figure2@conscience.fr"],
        [],
        [],
        [],
        [],
    ],
    "vessel_mobile_phone": [None, "0111111111", None, None, None],
    "vessel_fax": ["0100000000", None, None, None, None],
    "operator_name": [
        "Le pêcheur de crevettes",
        "Le pêcheur",
        "Le pêcheur qui se fait ses 4h reports",
        "Le pêcheur qui se cache",
        "Le pêcheur de poissons",
    ],
    "operator_email": [
        "address@email.bzh",
        "pecheur@poissecaille.fr",
        "reglo@bateau.fr",
        "discrete@cache-cache.fish",
        "write_to_me@gmail.com",
    ],
    "operator_mobile_phone": ["0600000000", None, None, None, None],
    "operator_fax": ["0200000000", None, None, None, None],
    "satellite_operator": ["SAT", "SRV", "SRV", "SRV", "SAT"],
    "satellite_operator_emails": [
        ["email1@sat.op", "email2@sat.op"],
        ["contact@srv.gps"],
        ["contact@srv.gps"],
        ["contact@srv.gps"],
        ["email1@sat.op", "email2@sat.op"],
    ],
    "foreign_fmc_name": [None, None, None, "Alabama", "Boulgiboulgastan"],
    "foreign_fmc_emails": [None, None, None, ["fmc@aaa.com", "fmc2@aaa.com"], []],
}


def test_extract_malfunctions_to_notify(reset_test_data):
    now = datetime.utcnow()

    malfunctions_to_notify = extract_malfunctions_to_notify.run()

    expected_malfunctions_to_notify = pd.DataFrame(
        {
            **malfunctions_to_notify_shared_data,
            "previous_notification_datetime_utc": [
                now - relativedelta(months=1, days=2, hours=17, minutes=57),
                now - relativedelta(hours=3, minutes=57),
                None,
                None,
                None,
            ],
            "malfunction_start_date_utc": [
                now - relativedelta(months=1, days=3),
                now - relativedelta(hours=10),
                now - relativedelta(hours=12, minutes=10),
                now - relativedelta(hours=6, minutes=10),
                now - relativedelta(hours=8, minutes=10),
            ],
        }
    )

    datetime_columns = [
        "malfunction_start_date_utc",
        "previous_notification_datetime_utc",
    ]

    pd.testing.assert_frame_equal(
        malfunctions_to_notify.drop(columns=datetime_columns),
        expected_malfunctions_to_notify.drop(columns=datetime_columns),
    )

    assert (
        (
            malfunctions_to_notify.malfunction_start_date_utc
            - expected_malfunctions_to_notify.malfunction_start_date_utc
        ).map(lambda dt: dt.total_seconds())
        < 10
    ).all()

    previous_notification_datetime_utc_deltas = (
        malfunctions_to_notify.previous_notification_datetime_utc
        - expected_malfunctions_to_notify.previous_notification_datetime_utc
    ).map(lambda dt: dt.total_seconds())

    assert (previous_notification_datetime_utc_deltas[:2] < 10).all()
    assert pd.isna(previous_notification_datetime_utc_deltas[2])


def test_to_malfunctions_to_notify_list():
    malfunctions_to_notify = pd.DataFrame(
        {
            **malfunctions_to_notify_shared_data,
            "previous_notification_datetime_utc": [
                datetime(2022, 1, 1, 12, 53, 23),
                datetime(2022, 1, 2, 12, 53, 23),
                None,
                None,
                None,
            ],
            "malfunction_start_date_utc": [
                datetime(2022, 1, 3, 12, 53, 23),
                datetime(2022, 1, 4, 12, 53, 23),
                datetime(2022, 1, 5, 12, 53, 23),
                datetime(2022, 1, 6, 12, 53, 23),
                datetime(2022, 1, 7, 12, 53, 23),
            ],
        }
    )

    malfunctions_to_notify_list = to_malfunctions_to_notify_list.run(
        malfunctions_to_notify, test_mode=False
    )

    expected_malfunctions_to_notify_list = [
        BeaconMalfunctionToNotify(
            beacon_malfunction_id=1,
            vessel_cfr_or_immat_or_ircs="ABC000542519",
            beacon_number="123456",
            vessel_name="DEVINER FIGURE CONSCIENCE",
            malfunction_start_date_utc=datetime(2022, 1, 3, 12, 53, 23),
            last_position_latitude=45.236,
            last_position_longitude=-3.569,
            notification_type="END_OF_MALFUNCTION",
            vessel_emails=["figure@conscience.fr", "figure2@conscience.fr"],
            vessel_mobile_phone=None,
            vessel_fax="0100000000",
            operator_name="Le pêcheur de crevettes",
            operator_email="address@email.bzh",
            operator_mobile_phone="0600000000",
            operator_fax="0200000000",
            satellite_operator="SAT",
            satellite_operator_emails=["email1@sat.op", "email2@sat.op"],
            foreign_fmc_name=None,
            foreign_fmc_emails=None,
            previous_notification_datetime_utc=datetime(2022, 1, 1, 12, 53, 23),
            test_mode=False,
        ),
        BeaconMalfunctionToNotify(
            beacon_malfunction_id=2,
            vessel_cfr_or_immat_or_ircs="SB125334",
            beacon_number="A56CZ2",
            vessel_name="JOUR INTÉRESSER VOILÀ",
            malfunction_start_date_utc=datetime(2022, 1, 4, 12, 53, 23),
            last_position_latitude=42.843,
            last_position_longitude=-8.568,
            notification_type="MALFUNCTION_AT_SEA_REMINDER",
            vessel_emails=[],
            vessel_mobile_phone="0111111111",
            vessel_fax=None,
            operator_name="Le pêcheur",
            operator_email="pecheur@poissecaille.fr",
            operator_mobile_phone=None,
            operator_fax=None,
            satellite_operator="SRV",
            satellite_operator_emails=["contact@srv.gps"],
            foreign_fmc_name=None,
            foreign_fmc_emails=None,
            previous_notification_datetime_utc=datetime(2022, 1, 2, 12, 53, 23),
            test_mode=False,
        ),
        BeaconMalfunctionToNotify(
            beacon_malfunction_id=3,
            vessel_cfr_or_immat_or_ircs="ZZTOPACDC",
            beacon_number="BEA951357",
            vessel_name="I DO 4H REPORT",
            malfunction_start_date_utc=datetime(2022, 1, 5, 12, 53, 23),
            last_position_latitude=-8.569,
            last_position_longitude=-23.1569,
            notification_type="MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION",
            vessel_emails=[],
            vessel_mobile_phone=None,
            vessel_fax=None,
            operator_name="Le pêcheur qui se fait ses 4h reports",
            operator_email="reglo@bateau.fr",
            operator_mobile_phone=None,
            operator_fax=None,
            satellite_operator="SRV",
            satellite_operator_emails=["contact@srv.gps"],
            foreign_fmc_name=None,
            foreign_fmc_emails=None,
            previous_notification_datetime_utc=pd.NaT,
            test_mode=False,
        ),
        BeaconMalfunctionToNotify(
            beacon_malfunction_id=4,
            vessel_cfr_or_immat_or_ircs="AB123456",
            beacon_number="BEACON_NOT_EMITTING",
            vessel_name="I NEVER EMITTED BUT SHOULD HAVE",
            malfunction_start_date_utc=datetime(2022, 1, 6, 12, 53, 23),
            last_position_latitude=-6.862,
            last_position_longitude=51.1686,
            notification_type="MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC",
            vessel_emails=[],
            vessel_mobile_phone=None,
            vessel_fax=None,
            operator_name="Le pêcheur qui se cache",
            operator_email="discrete@cache-cache.fish",
            operator_mobile_phone=None,
            operator_fax=None,
            satellite_operator="SRV",
            satellite_operator_emails=["contact@srv.gps"],
            foreign_fmc_name="Alabama",
            foreign_fmc_emails=["fmc@aaa.com", "fmc2@aaa.com"],
            previous_notification_datetime_utc=pd.NaT,
            test_mode=False,
        ),
        BeaconMalfunctionToNotify(
            beacon_malfunction_id=5,
            vessel_cfr_or_immat_or_ircs="ABC000306959",
            beacon_number="987654",
            vessel_name="ÉTABLIR IMPRESSION LORSQUE",
            malfunction_start_date_utc=datetime(2022, 1, 7, 12, 53, 23),
            last_position_latitude=-6.162,
            last_position_longitude=50.185,
            notification_type="MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC",
            vessel_emails=[],
            vessel_mobile_phone=None,
            vessel_fax=None,
            operator_name="Le pêcheur de poissons",
            operator_email="write_to_me@gmail.com",
            operator_mobile_phone=None,
            operator_fax=None,
            satellite_operator="SAT",
            satellite_operator_emails=["email1@sat.op", "email2@sat.op"],
            foreign_fmc_name="Boulgiboulgastan",
            foreign_fmc_emails=[],
            previous_notification_datetime_utc=pd.NaT,
            test_mode=False,
        ),
    ]

    assert malfunctions_to_notify_list == expected_malfunctions_to_notify_list


def test_get_templates():
    templates = get_templates.run()
    assert isinstance(templates, dict)
    for notification_type in BeaconMalfunctionNotificationType:
        assert notification_type in templates
        assert isinstance(templates[notification_type], Template)


def test_get_sms_templates():
    templates = get_sms_templates.run()
    assert isinstance(templates, dict)
    for notification_type in BeaconMalfunctionNotificationType:
        try:
            assert notification_type in templates
            assert isinstance(templates[notification_type], Template)
        except AssertionError:
            assert notification_type is (
                BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC
            )


@fixture
def templates() -> dict:
    return get_templates.run()


@fixture
def sms_templates() -> dict:
    return get_sms_templates.run()


@fixture
def cnsp_logo() -> bytes:
    with open(EMAIL_IMAGES_LOCATION / "logo_cnsp.jpg", "rb") as f:
        logo = f.read()
    return logo


@fixture
def malfunction_to_notify_data() -> dict:
    return dict(
        beacon_malfunction_id=1,
        vessel_cfr_or_immat_or_ircs="ABC000542519",
        beacon_number="123456",
        vessel_name="DEVINER FIGURE CONSCIENCE",
        malfunction_start_date_utc=datetime(2022, 1, 3, 12, 53, 23),
        last_position_latitude=45.236,
        last_position_longitude=-3.569,
        vessel_emails=["figure@conscience.fr", "figure2@conscience.fr"],
        vessel_mobile_phone="0699999999",
        vessel_fax="0100000000",
        operator_name="Le pêcheur de crevettes",
        operator_email="address@email.bzh",
        operator_mobile_phone="0600000000",
        operator_fax="0200000000",
        satellite_operator="SAT",
        satellite_operator_emails=["email1@sat.op", "email2@sat.op"],
        foreign_fmc_name="Saturne",
        foreign_fmc_emails=["fmc@email.country", "fmc2@email.country"],
        previous_notification_datetime_utc=datetime(2022, 1, 1, 12, 53, 23),
    )


@fixture
def malfunction_to_notify_data_with_nulls() -> dict:
    return dict(
        beacon_malfunction_id=1,
        vessel_cfr_or_immat_or_ircs=None,
        beacon_number=None,
        vessel_name=None,
        malfunction_start_date_utc=datetime(2022, 1, 3, 12, 53, 23),
        last_position_latitude=float("nan"),
        last_position_longitude=float("nan"),
        vessel_emails=[],
        vessel_mobile_phone=None,
        vessel_fax=None,
        operator_name=None,
        operator_email=None,
        operator_mobile_phone=None,
        operator_fax=None,
        satellite_operator=None,
        satellite_operator_emails=[],
        foreign_fmc_emails=[],
        foreign_fmc_name=None,
        previous_notification_datetime_utc=None,
    )


@fixture
def email_message() -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = "The subject of the email"
    msg["From"] = "The from field"
    msg[
        "To"
    ] = "someone@email.com, someone.else@email.fr, fail1@email.com, fail2@email.com"
    msg["Cc"] = "cced@email.com"
    msg["Bcc"] = "Bcced@email.com"
    msg.set_content("<html>Hello there this is a test email</html>", subtype="html")

    return msg


@fixture
def expected_notifications(request) -> list:
    return [
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.EMAIL,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            recipient_name=None,
            recipient_address_or_number="figure@conscience.fr",
            success=True,
            error_message=None,
        ),
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.EMAIL,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            recipient_name=None,
            recipient_address_or_number="figure2@conscience.fr",
            success=True,
            error_message=None,
        ),
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.EMAIL,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            recipient_name="Le pêcheur de crevettes",
            recipient_address_or_number="address@email.bzh",
            success=True,
            error_message=None,
        ),
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.EMAIL,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.SATELLITE_OPERATOR,
            recipient_name="SAT",
            recipient_address_or_number="email1@sat.op",
            success=False,
            error_message="User unknown",
        ),
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.EMAIL,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.SATELLITE_OPERATOR,
            recipient_name="SAT",
            recipient_address_or_number="email2@sat.op",
            success=False,
            error_message=None,
        ),
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.SMS,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            recipient_name=None,
            recipient_address_or_number="0699999999",
            success=False,
            error_message="Unknown error.",
        ),
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.SMS,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            recipient_name="Le pêcheur de crevettes",
            recipient_address_or_number="0600000000",
            success=False,
            error_message="Unknown error.",
        ),
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.FAX,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            recipient_name=None,
            recipient_address_or_number="0100000000",
            success=False,
            error_message="Unknown error.",
        ),
        BeaconMalfunctionNotification(
            beacon_malfunction_id=1,
            date_time_utc=request.param,
            notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER,
            communication_means=CommunicationMeans.FAX,
            recipient_function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            recipient_name="Le pêcheur de crevettes",
            recipient_address_or_number="0200000000",
            success=False,
            error_message="Unknown error.",
        ),
    ]


@pytest.mark.parametrize(
    "notification_type,output_format",
    [
        ("MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION", "html"),
        ("MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION", "pdf"),
        ("MALFUNCTION_AT_SEA_REMINDER", "html"),
        ("MALFUNCTION_AT_SEA_REMINDER", "pdf"),
        ("MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION", "html"),
        ("MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION", "pdf"),
        ("MALFUNCTION_AT_PORT_REMINDER", "html"),
        ("MALFUNCTION_AT_PORT_REMINDER", "pdf"),
        ("END_OF_MALFUNCTION", "html"),
        ("END_OF_MALFUNCTION", "pdf"),
        ("MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC", "html"),
        ("MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC", "pdf"),
    ],
)
@patch(
    "src.pipeline.flows.notify_beacon_malfunctions.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 1, 1, 1)),
)
def test_render(
    malfunction_to_notify_data, templates, notification_type, output_format
):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        notification_type=notification_type,
        test_mode=False,
    )
    pdf_or_html = render.run(m=m, templates=templates, output_format=output_format)

    test_filepath = TEST_DATA_LOCATION / f"emails/{notification_type}.{output_format}"
    mode_suffix = "b" if output_format == "pdf" else ""

    ######################### Uncomment to replace test files #########################
    # with open(test_filepath, "w" + mode_suffix) as f:
    #     f.write(pdf_or_html)
    ###################################################################################

    with open(test_filepath, "r" + mode_suffix) as f:
        if output_format == "html":
            expected_res = f.read()
        else:
            expected_res = pypdf.PdfReader(io.BytesIO(f.read()))

    if output_format == "html":
        assert pdf_or_html == expected_res
    else:
        pdf = pypdf.PdfReader(io.BytesIO(pdf_or_html))
        # The `.extract_text` method yields weird results that do not correspond to the
        # actual textual content of the pdf, but we use it here as a kind of hash
        # function for the pdf's content to test that the result is as expected.
        assert expected_res.pages[0].extract_text() == pdf.pages[0].extract_text()


@pytest.mark.parametrize(
    "notification_type",
    [
        "MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION",
        "MALFUNCTION_AT_SEA_REMINDER",
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION",
        "MALFUNCTION_AT_PORT_REMINDER",
        "END_OF_MALFUNCTION",
    ],
)
@patch(
    "src.pipeline.flows.notify_beacon_malfunctions.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 1, 1, 1)),
)
def test_render_sms(malfunction_to_notify_data, sms_templates, notification_type):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        notification_type=notification_type,
        test_mode=False,
    )
    sms_text = render_sms.run(m=m, templates=sms_templates)

    test_filepath = TEST_DATA_LOCATION / f"sms/{notification_type}.txt"

    ######################### Uncomment to replace test files #########################
    # with open(test_filepath, "w") as f:
    #     f.write(sms_text)
    ###################################################################################

    with open(test_filepath, "r") as f:
        expected_res = f.read()

    assert sms_text == expected_res


@patch(
    "src.pipeline.flows.notify_beacon_malfunctions.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 1, 1, 1)),
)
def test_render_with_null_values(malfunction_to_notify_data_with_nulls, templates):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data_with_nulls,
        notification_type="MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION",
        test_mode=False,
    )
    html = render.run(m=m, templates=templates, output_format="html")

    test_filepath = (
        TEST_DATA_LOCATION
        / "emails/MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION_WITH_NULLS.html"
    )

    ######################### Uncomment to replace test file ##########################
    # with open(test_filepath, "w") as f:
    #     f.write(html)
    ###################################################################################

    with open(test_filepath, "r") as f:
        expected_res = f.read()

    assert html == expected_res


@pytest.mark.parametrize(
    "notification_type",
    [
        "MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION",
        "MALFUNCTION_AT_SEA_REMINDER",
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION",
        "MALFUNCTION_AT_PORT_REMINDER",
        "END_OF_MALFUNCTION",
        "MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC",
    ],
)
def test_create_email(malfunction_to_notify_data, cnsp_logo, notification_type):
    html = "<html>Test html string</html>\n"
    pdf = b"Test pdf bytes"
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        notification_type=notification_type,
        test_mode=False,
    )

    subject = m.get_notification_subject()
    email_to_send = create_email.run(html=html, pdf=pdf, m=m)

    malfunction_to_notify = email_to_send.beacon_malfunction_to_notify
    communication_means = email_to_send.communication_means
    email = email_to_send.message

    assert communication_means is CommunicationMeans.EMAIL
    assert malfunction_to_notify is m

    expected_to = (
        "fmc@email.country, fmc2@email.country"
        if (notification_type == "MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC")
        else (
            "figure@conscience.fr, figure2@conscience.fr, "
            "address@email.bzh, email1@sat.op, email2@sat.op"
        )
    )

    assert email["Subject"] == subject
    assert email["From"] == "monitorfish@test.email"
    assert email["To"] == expected_to
    assert email["Cc"] == "cnsp.sip@email.fr"
    assert email["Reply-To"] == "cnsp.sip@email.fr"
    assert email.get_content_type() == "multipart/mixed"

    attachments = list(email.iter_attachments())
    assert len(attachments) == 1

    attachment = attachments[0]
    assert attachment.get_content_disposition() == "attachment"
    assert attachment.get_content_type() == "application/octet-stream"
    assert attachment.get_filename() == "Notification.pdf"
    assert attachment.get_content() == pdf

    body = email.get_body()
    assert body.get_content_type() == "multipart/related"
    parts = list(body.iter_parts())
    assert len(parts) == 2
    part1, part2 = parts

    assert part1.get_content_type() == "text/html"
    assert part1.get_charsets() == ["utf-8"]
    assert part1.get_content() == html

    assert part2.is_attachment()
    assert part2.get_content_type() == "image/jpeg"
    assert part2["Content-ID"] == "<logo_cnsp.jpg>"
    assert part2.get_filename() == "logo_cnsp.jpg"
    assert part2.get_content() == cnsp_logo


@pytest.mark.parametrize(
    "notification_type",
    [
        "MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION",
        "MALFUNCTION_AT_SEA_REMINDER",
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION",
        "MALFUNCTION_AT_PORT_REMINDER",
        "END_OF_MALFUNCTION",
    ],
)
def test_create_sms(malfunction_to_notify_data, notification_type):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        notification_type=notification_type,
        test_mode=False,
    )
    text = "Hi, your vessel does not emit VMS."
    sms_to_send = create_sms.run(text=text, m=m)

    malfunction_to_notify = sms_to_send.beacon_malfunction_to_notify
    communication_means = sms_to_send.communication_means
    sms = sms_to_send.message

    assert communication_means is CommunicationMeans.SMS
    assert malfunction_to_notify is m

    assert sms["Subject"] is None
    assert sms["From"] == "monitorfish@test.email"
    assert sms["To"] == "0699999999@test.sms, 0600000000@test.sms"
    assert sms["Cc"] is None
    assert sms.get_content_type() == "text/plain"

    attachments = list(sms.iter_attachments())
    assert len(attachments) == 0

    assert sms.get_content() == text + "\n"


@pytest.mark.parametrize(
    "notification_type",
    [
        "MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION",
        "MALFUNCTION_AT_SEA_REMINDER",
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION",
        "MALFUNCTION_AT_PORT_REMINDER",
        "END_OF_MALFUNCTION",
    ],
)
def test_create_fax(malfunction_to_notify_data, cnsp_logo, notification_type):
    pdf = b"Test pdf bytes"
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        notification_type=notification_type,
        test_mode=False,
    )

    fax_to_send = create_fax.run(pdf=pdf, m=m)

    malfunction_to_notify = fax_to_send.beacon_malfunction_to_notify
    communication_means = fax_to_send.communication_means
    fax = fax_to_send.message

    assert communication_means is CommunicationMeans.FAX
    assert malfunction_to_notify is m

    assert fax["Subject"] == "FAX"
    assert fax["From"] == "monitorfish@test.email"
    assert fax["To"] == "0100000000@test.fax, 0200000000@test.fax"
    assert fax["Cc"] is None
    assert fax.get_content_type() == "multipart/mixed"

    attachments = list(fax.iter_attachments())
    assert len(attachments) == 1

    attachment = attachments[0]
    assert attachment.get_content_disposition() == "attachment"
    assert attachment.get_content_type() == "application/octet-stream"
    assert attachment.get_filename() == "FAX.pdf"
    assert attachment.get_content() == pdf


@pytest.mark.parametrize(
    "expected_notifications,communication_means,is_integration",
    [
        (datetime(2021, 1, 1, 16, 10, 0), CommunicationMeans.EMAIL, False),
        (datetime(2021, 1, 1, 16, 10, 0), CommunicationMeans.SMS, False),
        (datetime(2021, 1, 1, 16, 10, 0), CommunicationMeans.FAX, False),
        (datetime(2021, 1, 1, 16, 10, 0), CommunicationMeans.EMAIL, True),
        (datetime(2021, 1, 1, 16, 10, 0), CommunicationMeans.SMS, True),
        (datetime(2021, 1, 1, 16, 10, 0), CommunicationMeans.FAX, True),
    ],
    indirect=["expected_notifications"],
)
@patch(
    "src.pipeline.flows.notify_beacon_malfunctions.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 16, 10, 0)),
)
@patch("src.pipeline.flows.notify_beacon_malfunctions.send_email")
def test_send_beacon_malfunction_message(
    mock_send_email,
    malfunction_to_notify_data,
    email_message,
    expected_notifications,
    communication_means,
    is_integration,
):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        notification_type="MALFUNCTION_AT_SEA_REMINDER",
        test_mode=False,
    )
    msg = email_message

    # send_fax and send_sms are not mocked, they are expected to fail as a result of
    # using incorrect server url and port in test data - hence the `success=False` in
    # expected_notifications.
    mock_send_email.return_value = {
        "email1@sat.op": (550, "User unknown"),
        "email2@sat.op": (None, None),
    }

    msg_to_send = BeaconMalfunctionMessageToSend(
        message=msg,
        beacon_malfunction_to_notify=m,
        communication_means=communication_means,
    )

    notifications = send_beacon_malfunction_message.run(
        msg_to_send, is_integration=is_integration
    )

    expected_notifications_of_communication_means = list(
        filter(
            lambda n: n.communication_means is communication_means,
            expected_notifications,
        )
    )

    def mark_as_success(notification: BeaconMalfunctionNotification):
        notification = deepcopy(notification)
        notification.success = True
        notification.error_message = None
        return notification

    if is_integration:
        expected_notifications_of_communication_means = list(
            map(mark_as_success, expected_notifications_of_communication_means)
        )

    assert notifications == expected_notifications_of_communication_means


@pytest.mark.parametrize(
    "expected_notifications",
    [datetime(2021, 1, 1, 16, 10, 0)],
    indirect=["expected_notifications"],
)
def test_load_notifications(reset_test_data, expected_notifications):
    initial_notifications = read_query(
        "SELECT * FROM beacon_malfunction_notifications ORDER BY id",
        db="monitorfish_remote",
    )
    load_notifications.run(expected_notifications)
    final_notifications = read_query(
        "SELECT * FROM beacon_malfunction_notifications ORDER BY id",
        db="monitorfish_remote",
    )
    assert len(initial_notifications) == 2
    assert len(final_notifications) == 11
    assert final_notifications.loc[5].to_dict() == {
        "id": 6,
        "beacon_malfunction_id": 1,
        "date_time_utc": datetime(2021, 1, 1, 16, 10, 0),
        "notification_type": "MALFUNCTION_AT_SEA_REMINDER",
        "communication_means": "EMAIL",
        "recipient_function": "SATELLITE_OPERATOR",
        "recipient_name": "SAT",
        "recipient_address_or_number": "email1@sat.op",
        "success": False,
        "error_message": "User unknown",
    }


def test_load_notifications_empty_input(reset_test_data):
    initial_notifications = read_query(
        "SELECT * FROM beacon_malfunction_notifications ORDER BY id",
        db="monitorfish_remote",
    )
    load_notifications.run([])
    final_notifications = read_query(
        "SELECT * FROM beacon_malfunction_notifications ORDER BY id",
        db="monitorfish_remote",
    )
    pd.testing.assert_frame_equal(initial_notifications, final_notifications)


def test_flow(reset_test_data):
    # Setup
    initial_notifications = read_query(
        "SELECT * FROM beacon_malfunction_notifications ORDER BY id",
        db="monitorfish_remote",
    )
    initial_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions ORDER BY id", db="monitorfish_remote"
    )

    @task(checkpoint=False)
    @patch("src.pipeline.flows.notify_beacon_malfunctions.send_fax")
    @patch("src.pipeline.flows.notify_beacon_malfunctions.send_sms")
    @patch("src.pipeline.flows.notify_beacon_malfunctions.send_email")
    def mock_send_beacon_malfunction_message(
        mock_send_email,
        mock_send_sms,
        mock_send_fax,
        msg_to_send: BeaconMalfunctionMessageToSend,
        is_integration: bool,
    ):
        if msg_to_send.beacon_malfunction_to_notify.beacon_malfunction_id == 2:
            raise ValueError(
                (
                    "This email could not be sent - the flow should filter it and process "
                    "the other two malfunctions' notifications"
                )
            )

        mock_send_email.return_value = {
            "email1@sat.op": (550, "User unknown"),
            "email2@sat.op": (None, None),
        }
        mock_send_sms.return_value = {}
        mock_send_fax.return_value = {}

        return send_beacon_malfunction_message.run(msg_to_send, is_integration)

    flow.replace(
        flow.get_tasks("send_beacon_malfunction_message")[0],
        mock_send_beacon_malfunction_message,
    )

    # unittest.mock.patching a task results in weird bugs if using a LocalDaskExecutor
    flow.executor = None

    # Test flow run
    flow.schedule = None
    state = flow.run(test_mode=False, is_integration=False)

    final_notifications = read_query(
        "SELECT * FROM beacon_malfunction_notifications ORDER BY id",
        db="monitorfish_remote",
    )
    final_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions ORDER BY id", db="monitorfish_remote"
    )

    assert state.is_successful()

    # Check extract_malfunctions_to_notify results
    assert (
        len(state.result[flow.get_tasks("extract_malfunctions_to_notify")[0]].result)
        == 5
    )

    # Check to_malfunctions_to_notify_list results
    assert (
        len(state.result[flow.get_tasks("to_malfunctions_to_notify_list")[0]].result)
        == 5
    )
    assert isinstance(
        state.result[flow.get_tasks("to_malfunctions_to_notify_list")[0]].result[0],
        BeaconMalfunctionToNotify,
    )
    assert (
        state.result[flow.get_tasks("to_malfunctions_to_notify_list")[0]]
        .result[0]
        .test_mode
        == False
    )

    # Check create_email results
    created_emails = state.result[flow.get_tasks("create_email")[0]].result
    assert len(created_emails) == 5
    assert isinstance(created_emails[0], BeaconMalfunctionMessageToSend)
    assert isinstance(created_emails[1], BeaconMalfunctionMessageToSend)
    assert isinstance(created_emails[2], BeaconMalfunctionMessageToSend)
    assert isinstance(created_emails[3], BeaconMalfunctionMessageToSend)
    assert created_emails[4] is None
    assert created_emails[0].communication_means is CommunicationMeans.EMAIL

    # Check create_sms results
    created_smss = state.result[flow.get_tasks("create_sms")[0]].result
    assert len(created_smss) == 3
    assert isinstance(created_smss[0], BeaconMalfunctionMessageToSend)
    assert created_smss[0].communication_means is CommunicationMeans.SMS
    assert isinstance(created_smss[1], BeaconMalfunctionMessageToSend)
    assert created_smss[2] is None

    # Check create_fax results
    created_faxs = state.result[flow.get_tasks("create_fax")[0]].result
    assert len(created_faxs) == 5
    assert isinstance(created_faxs[0], BeaconMalfunctionMessageToSend)
    assert created_faxs[0].communication_means is CommunicationMeans.FAX
    assert created_faxs[1] is None
    assert created_faxs[2] is None
    assert created_faxs[3] is None
    assert created_faxs[4] is None

    # Check mock_send_beacon_malfunction_message results
    assert (
        len(
            state.result[
                flow.get_tasks("mock_send_beacon_malfunction_message")[0]
            ].result
        )
        == 7
    )
    assert isinstance(
        state.result[flow.get_tasks("mock_send_beacon_malfunction_message")[0]].result[
            1
        ],
        ValueError,
    )

    # Check filtered notifications : out of the 3 malfunctions to notify, the one with
    # beacon_malfunction_id == 2 raised an error during the
    # mock_send_email_notification task and should be removed by the prefect
    # filter_results task.

    # Check the data loaded into the database
    assert len(initial_notifications) == 2
    assert len(final_notifications) == 14
    inserted_notifications = final_notifications[
        ~final_notifications.id.isin(initial_notifications.id)
    ].reset_index(drop=True)
    expected_inserted_notifications = pd.read_csv(
        Path(__file__).parent / "test_notify_beacon_malfunctions_expected_data.csv",
        parse_dates=["date_time_utc"],
    )

    expected_inserted_notifications["date_time_utc"] = datetime.utcnow()
    pd.testing.assert_frame_equal(
        inserted_notifications.drop(columns=["date_time_utc"]).convert_dtypes(),
        expected_inserted_notifications.drop(
            columns=["date_time_utc"]
        ).convert_dtypes(),
    )

    assert (
        (
            inserted_notifications["date_time_utc"]
            - expected_inserted_notifications["date_time_utc"]
        )
        < timedelta(minutes=5)
    ).all()

    # Check that malfunctions' `notification_requested` field is reset to nulls.
    assert len(initial_malfunctions) == 5
    assert initial_malfunctions.notification_requested.notnull().all()
    assert final_malfunctions.notification_requested.isna().all()
    assert final_malfunctions.requested_notification_foreign_fmc_code.isna().all()

    # Now all notifications have been sent, test flow again to check it runs
    # successfully when there are no notifications to send
    flow.schedule = None
    state = flow.run(test_mode=False, is_integration=False)
    assert state.is_successful()
    assert (
        len(state.result[flow.get_tasks("extract_malfunctions_to_notify")[0]].result)
        == 0
    )
