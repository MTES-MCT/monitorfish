from datetime import datetime

from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationAddressee,
    BeaconMalfunctionNotificationRecipientFunction,
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionToNotify,
)


def test_beacon_malfunction_to_notify():
    m = BeaconMalfunctionToNotify(
        beacon_malfunction_id=1,
        vessel_cfr_or_immat_or_ircs="A",
        beacon_number="AA",
        vessel_name="Vessel_A",
        malfunction_start_date_utc=datetime(2022, 2, 3, 12, 52, 36),
        last_position_latitude=45.123,
        last_position_longitude=-6.852,
        notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION,
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


def test_beacon_malfunction_to_notify_test_mode():
    m = BeaconMalfunctionToNotify(
        beacon_malfunction_id=1,
        vessel_cfr_or_immat_or_ircs="A",
        beacon_number="AA",
        vessel_name="Vessel_A",
        malfunction_start_date_utc=datetime(2022, 2, 3, 12, 52, 36),
        last_position_latitude=45.123,
        last_position_longitude=-6.852,
        notification_type=BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION,
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
        test_mode=True,
    )

    assert m.get_email_addressees() == [
        BeaconMalfunctionNotificationAddressee(
            function=BeaconMalfunctionNotificationRecipientFunction.FMC,
            name="CNSP",
            address_or_number="cnsp.sip@email.fr",
        ),
    ]
