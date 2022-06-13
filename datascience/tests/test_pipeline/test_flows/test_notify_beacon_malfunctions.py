import io
from datetime import datetime
from unittest.mock import patch

import pandas as pd
import PyPDF2
import pytest
from dateutil.relativedelta import relativedelta
from jinja2 import Template
from pytest import fixture

from config import TEST_DATA_LOCATION
from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionToNotify,
)
from src.pipeline.flows.notify_beacon_malfunctions import (
    create_email,
    extract_malfunctions_to_notify,
    flow,
    get_templates,
    render,
    to_malfunctions_to_notify_list,
)
from tests.mocks import mock_datetime_utcnow

malfunctions_to_notify_shared_data = {
    "beacon_malfunction_id": [1, 2, 3],
    "vessel_cfr_or_immat_or_ircs": ["ABC000542519", "SB125334", "ZZTOPACDC"],
    "beacon_number": ["123456", "A56CZ2", "BEA951357"],
    "vessel_name": [
        "DEVINER FIGURE CONSCIENCE",
        "JOUR INTÉRESSER VOILÀ",
        "I DO 4H REPORT",
    ],
    "last_position_latitude": [45.236, 42.843, -8.5690],
    "last_position_longitude": [-3.569, -8.568, -23.1569],
    "notification_type": [
        "END_OF_MALFUNCTION",
        "MALFUNCTION_AT_SEA_REMINDER",
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION",
    ],
    "vessel_emails": [["figure@conscience.fr", "figure2@conscience.fr"], [], []],
    "vessel_mobile_phone": [None, "0111111111", None],
    "vessel_fax": ["0100000000", None, None],
    "operator_name": [
        "Le pêcheur de crevettes",
        "Le pêcheur",
        "Le pêcheur qui se fait ses 4h reports",
    ],
    "operator_email": [
        "address@email.bzh",
        "pecheur@poissecaille.fr",
        "reglo@bateau.fr",
    ],
    "operator_mobile_phone": ["0600000000", None, None],
    "operator_fax": ["0200000000", None, None],
    "satellite_operator": ["SAT", "SRV", "SRV"],
    "satellite_operator_emails": [
        ["email1@sat.op", "email2@sat.op"],
        ["contact@srv.gps"],
        ["contact@srv.gps"],
    ],
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
            ],
            "malfunction_start_date_utc": [
                now - relativedelta(months=1, days=3),
                now - relativedelta(hours=10),
                now - relativedelta(hours=12, minutes=10),
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
            ],
            "malfunction_start_date_utc": [
                datetime(2022, 1, 3, 12, 53, 23),
                datetime(2022, 1, 4, 12, 53, 23),
                datetime(2022, 1, 5, 12, 53, 23),
            ],
        }
    )

    malfunctions_to_notify_list = to_malfunctions_to_notify_list.run(
        malfunctions_to_notify
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
            previous_notification_datetime_utc=datetime(2022, 1, 1, 12, 53, 23),
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
            previous_notification_datetime_utc=datetime(2022, 1, 2, 12, 53, 23),
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
            previous_notification_datetime_utc=pd.NaT,
        ),
    ]

    assert malfunctions_to_notify_list == expected_malfunctions_to_notify_list


def test_get_templates():
    templates = get_templates.run()
    assert isinstance(templates, dict)
    for notification_type in BeaconMalfunctionNotificationType:
        assert notification_type in templates
        assert isinstance(templates[notification_type], Template)


@fixture
def templates() -> dict:
    return get_templates.run()


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
        previous_notification_datetime_utc=datetime(2022, 1, 1, 12, 53, 23),
    )


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
    ],
)
@patch(
    "src.pipeline.flows.notify_beacon_malfunctions.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 1, 1, 1)),
)
def test_render(
    malfunction_to_notify_data, templates, notification_type, output_format
):

    test_filepath = TEST_DATA_LOCATION / f"emails/{notification_type}.{output_format}"
    mode_suffix = "b" if output_format == "pdf" else ""

    with open(test_filepath, "r" + mode_suffix) as f:
        if output_format == "html":
            expected_res = f.read()
        else:
            expected_res = PyPDF2.PdfReader(io.BytesIO(f.read()))

    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data, notification_type=notification_type
    )
    pdf_or_html = render.run(m=m, templates=templates, output_format=output_format)

    if output_format == "html":
        assert pdf_or_html == expected_res
    else:
        pdf = PyPDF2.PdfReader(io.BytesIO(pdf_or_html))
        # The `.extract_text` method yields weird results that do not correspond to the
        # actual textual content of the pdf, but we use it here as a kind of hash
        # function for the pdf's content to test that the result is as expected.
        assert expected_res.pages[0].extract_text() == pdf.pages[0].extract_text()

    ######################### Uncomment to replace test files #########################
    # with open(test_filepath, "w" + mode_suffix) as f:
    #     f.write(pdf_or_html)
    ###################################################################################


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
def test_create_email(malfunction_to_notify_data, notification_type):
    html = "<html>Test html string</html>"
    pdf = b"Test pdf bytes"
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data, notification_type=notification_type
    )
    email = create_email.run(html=html, pdf=pdf, m=m)

    assert email.get_content_type() == "multipart/mixed"

    attachments = list(email.iter_attachments())
    assert len(attachments) == 2
    attachment1, attachment2 = attachments

    assert attachment1.get_content_type() == "image/jpeg"
    breakpoint()


def test_flow(reset_test_data):
    state = flow.run()
    assert state.is_successful()
