from datetime import datetime
from email.message import EmailMessage
from unittest.mock import patch

from pytest import fixture

from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionMessageToSend,
    BeaconMalfunctionNotificationAddressee,
    BeaconMalfunctionNotificationRecipientFunction,
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionToNotify,
    CommunicationMeans,
)


@fixture
def malfunction_to_notify_data() -> dict:
    return dict(
        beacon_malfunction_id=1,
        vessel_cfr_or_immat_or_ircs="A",
        beacon_number="AA",
        vessel_name="Vessel_A",
        malfunction_start_date_utc=datetime(2022, 2, 3, 12, 52, 36),
        last_position_latitude=45.123,
        last_position_longitude=-6.852,
        notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION,
        foreign_fmc_emails=[],
        foreign_fmc_name="Foreign FMC",
        vessel_emails=["vessel_a@email.com", "vessel_a2@email.com"],
        vessel_mobile_phone="0600000000",
        vessel_fax="0700011111",
        operator_name="Operator_vessel_A",
        operator_email="operator@vessel.a",
        operator_mobile_phone="0688888888",
        operator_fax="0788888888",
        satellite_operator="SAT_vessel_A",
        satellite_operator_emails=["sat@a.com", "sat1@a.com"],
        previous_notification_datetime_utc=datetime(2020, 1, 2, 15, 14, 0),
    )


@fixture
def malfunction_to_notify_data_no_contact_info() -> dict:
    return dict(
        beacon_malfunction_id=1,
        vessel_cfr_or_immat_or_ircs="A",
        beacon_number="AA",
        vessel_name="Vessel_A",
        malfunction_start_date_utc=datetime(2022, 2, 3, 12, 52, 36),
        last_position_latitude=45.123,
        last_position_longitude=-6.852,
        notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION,
        foreign_fmc_emails=[],
        foreign_fmc_name="Foreign FMC",
        vessel_emails=[],
        vessel_mobile_phone=None,
        vessel_fax=None,
        operator_name="Operator_vessel_A",
        operator_email=None,
        operator_mobile_phone=None,
        operator_fax=None,
        satellite_operator="SAT_vessel_A",
        satellite_operator_emails=[],
        previous_notification_datetime_utc=datetime(2020, 1, 2, 15, 14, 0),
    )


def test_beacon_malfunction_to_notify(malfunction_to_notify_data):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        test_mode=False,
    )

    assert m.get_email_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            name=None,
            address_or_number="vessel_a@email.com",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            name=None,
            address_or_number="vessel_a2@email.com",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            name="Operator_vessel_A",
            address_or_number="operator@vessel.a",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.SATELLITE_OPERATOR,
            name="SAT_vessel_A",
            address_or_number="sat@a.com",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.SATELLITE_OPERATOR,
            name="SAT_vessel_A",
            address_or_number="sat1@a.com",
        ),
    ]

    assert m.get_sms_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            name=None,
            address_or_number="0600000000",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            name="Operator_vessel_A",
            address_or_number="0688888888",
        ),
    ]

    assert m.get_fax_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            name=None,
            address_or_number="0700011111",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            name="Operator_vessel_A",
            address_or_number="0788888888",
        ),
    ]


def test_beacon_malfunction_to_notify_no_contact_info(
    malfunction_to_notify_data_no_contact_info,
):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data_no_contact_info,
        test_mode=False,
    )

    assert m.get_email_addressees() == []
    assert m.get_sms_addressees() == []
    assert m.get_fax_addressees() == []


def test_beacon_malfunction_to_notify_test_mode(malfunction_to_notify_data):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        test_mode=True,
    )

    assert m.get_email_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.FMC,
            name="CNSP",
            address_or_number="cnsp.sip@email.fr",
        ),
    ]

    assert m.get_sms_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.FMC,
            name="CNSP",
            address_or_number="0123456789",
        )
    ]

    assert m.get_fax_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.FMC,
            name="CNSP",
            address_or_number="9876543210",
        )
    ]


@patch("src.pipeline.entities.beacon_malfunctions.CNSP_SIP_DEPARTMENT_FAX", None)
@patch("src.pipeline.entities.beacon_malfunctions.CNSP_SIP_DEPARTMENT_EMAIL", None)
@patch(
    "src.pipeline.entities.beacon_malfunctions.CNSP_SIP_DEPARTMENT_MOBILE_PHONE", None
)
def test_beacon_malfunction_to_notify_test_mode_without_cnsp_contact_info(
    malfunction_to_notify_data,
):
    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        test_mode=True,
    )

    assert m.get_email_addressees() == []
    assert m.get_sms_addressees() == []
    assert m.get_fax_addressees() == []


def test_beacon_malfunction_message_to_send(malfunction_to_notify_data):

    m = BeaconMalfunctionToNotify(
        **malfunction_to_notify_data,
        test_mode=False,
    )

    msg_to_send = BeaconMalfunctionMessageToSend(
        message=EmailMessage(),
        beacon_malfunction_to_notify=m,
        communication_means=CommunicationMeans.EMAIL,
    )

    assert msg_to_send.get_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            name=None,
            address_or_number="vessel_a@email.com",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            name=None,
            address_or_number="vessel_a2@email.com",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            name="Operator_vessel_A",
            address_or_number="operator@vessel.a",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.SATELLITE_OPERATOR,
            name="SAT_vessel_A",
            address_or_number="sat@a.com",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.SATELLITE_OPERATOR,
            name="SAT_vessel_A",
            address_or_number="sat1@a.com",
        ),
    ]

    msg_to_send.communication_means = CommunicationMeans.SMS

    assert msg_to_send.get_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            name=None,
            address_or_number="0600000000",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            name="Operator_vessel_A",
            address_or_number="0688888888",
        ),
    ]

    msg_to_send.communication_means = CommunicationMeans.FAX
    assert msg_to_send.get_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
            name=None,
            address_or_number="0700011111",
        ),
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
            name="Operator_vessel_A",
            address_or_number="0788888888",
        ),
    ]
