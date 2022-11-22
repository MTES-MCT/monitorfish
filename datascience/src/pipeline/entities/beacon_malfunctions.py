from dataclasses import dataclass
from datetime import datetime
from email.message import EmailMessage
from enum import Enum
from typing import List

from config import (
    CNSP_SIP_DEPARTMENT_EMAIL,
    CNSP_SIP_DEPARTMENT_FAX,
    CNSP_SIP_DEPARTMENT_MOBILE_PHONE,
)


class BeaconStatus(Enum):
    ACTIVATED = "ACTIVATED"
    DEACTIVATED = "DEACTIVATED"
    IN_TEST = "IN_TEST"
    NON_APPROVED = "NON_APPROVED"
    UNSUPERVISED = "UNSUPERVISED"

    @staticmethod
    def from_poseidon_status(poseidon_status: str):
        mapping = {
            "Activée": BeaconStatus.ACTIVATED,
            "Désactivée": BeaconStatus.DEACTIVATED,
            "En test": BeaconStatus.IN_TEST,
            "Non agréée": BeaconStatus.NON_APPROVED,
            "Non surveillée": BeaconStatus.UNSUPERVISED,
        }
        return mapping[poseidon_status]


class BeaconMalfunctionStage(Enum):
    INITIAL_ENCOUNTER = "INITIAL_ENCOUNTER"
    FOUR_HOUR_REPORT = "FOUR_HOUR_REPORT"
    AT_QUAY = "AT_QUAY"
    TARGETING_VESSEL = "TARGETING_VESSEL"
    FOLLOWING = "FOLLOWING"
    END_OF_MALFUNCTION = "END_OF_MALFUNCTION"
    ARCHIVED = "ARCHIVED"


class BeaconMalfunctionVesselStatus(Enum):
    AT_SEA = "AT_SEA"
    AT_PORT = "AT_PORT"
    NEVER_EMITTED = "NEVER_EMITTED"
    NO_NEWS = "NO_NEWS"
    ACTIVITY_DETECTED = "ACTIVITY_DETECTED"


class EndOfMalfunctionReason(Enum):
    RESUMED_TRANSMISSION = "RESUMED_TRANSMISSION"
    BEACON_DEACTIVATED_OR_UNEQUIPPED = "BEACON_DEACTIVATED_OR_UNEQUIPPED"


class BeaconMalfunctionNotificationType(Enum):
    MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION = "MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION"
    MALFUNCTION_AT_SEA_REMINDER = "MALFUNCTION_AT_SEA_REMINDER"
    MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION = (
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION"
    )
    MALFUNCTION_AT_PORT_REMINDER = "MALFUNCTION_AT_PORT_REMINDER"
    END_OF_MALFUNCTION = "END_OF_MALFUNCTION"

    def to_notification_subject_template(self):
        type_subject_mapping = {
            "MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION": "{vessel_name} ({immat}) : interruption en mer des émissions VMS",
            "MALFUNCTION_AT_SEA_REMINDER": "{vessel_name} ({immat}) : RAPPEL : interruption en mer des émissions VMS",
            "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION": "{vessel_name} ({immat}) : interruption à quai des émissions VMS",
            "MALFUNCTION_AT_PORT_REMINDER": "{vessel_name} ({immat}) : RAPPEL : interruption à quai des émissions VMS",
            "END_OF_MALFUNCTION": "{vessel_name} ({immat}) : reprise des émissions VMS",
        }
        return type_subject_mapping[self.name]


class BeaconMalfunctionNotificationRecipientFunction(Enum):
    VESSEL_CAPTAIN = "VESSEL_CAPTAIN"
    VESSEL_OPERATOR = "VESSEL_OPERATOR"
    SATELLITE_OPERATOR = "SATELLITE_OPERATOR"
    FMC = "FMC"


class CommunicationMeans(Enum):
    EMAIL = "EMAIL"
    SMS = "SMS"
    FAX = "FAX"


@dataclass
class BeaconMalfunctionNotificationAddressee:
    function: BeaconMalfunctionNotificationRecipientFunction
    name: str
    address_or_number: str


@dataclass
class BeaconMalfunctionToNotify:
    beacon_malfunction_id: int
    vessel_cfr_or_immat_or_ircs: str
    beacon_number: str
    vessel_name: str
    malfunction_start_date_utc: datetime
    last_position_latitude: float
    last_position_longitude: float
    notification_type: BeaconMalfunctionNotificationType
    vessel_emails: List[str]
    vessel_mobile_phone: str
    vessel_fax: str
    operator_name: str
    operator_email: str
    operator_mobile_phone: str
    operator_fax: str
    satellite_operator: str
    satellite_operator_emails: List[str]
    previous_notification_datetime_utc: datetime
    test_mode: bool

    def __post_init__(self):
        self.notification_type = BeaconMalfunctionNotificationType(
            self.notification_type
        )

    def get_sms_addressees(self) -> List[BeaconMalfunctionNotificationAddressee]:

        if not self.test_mode:

            addressees = []

            if self.vessel_mobile_phone:
                addressees.append(
                    BeaconMalfunctionNotificationAddressee(
                        function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
                        name=None,
                        address_or_number=self.vessel_mobile_phone,
                    )
                )

            if self.operator_mobile_phone:
                addressees.append(
                    BeaconMalfunctionNotificationAddressee(
                        function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
                        name=self.operator_name,
                        address_or_number=self.operator_mobile_phone,
                    )
                )

        else:
            addressees = (
                [
                    BeaconMalfunctionNotificationAddressee(
                        function=BeaconMalfunctionNotificationRecipientFunction.FMC,
                        name="CNSP",
                        address_or_number=CNSP_SIP_DEPARTMENT_MOBILE_PHONE,
                    )
                ]
                if CNSP_SIP_DEPARTMENT_MOBILE_PHONE
                else []
            )
        return addressees

    def get_fax_addressees(self) -> List[BeaconMalfunctionNotificationAddressee]:

        if not self.test_mode:

            addressees = []

            if self.vessel_fax:
                addressees.append(
                    BeaconMalfunctionNotificationAddressee(
                        function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
                        name=None,
                        address_or_number=self.vessel_fax,
                    )
                )

            if self.operator_fax:
                addressees.append(
                    BeaconMalfunctionNotificationAddressee(
                        function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
                        name=self.operator_name,
                        address_or_number=self.operator_fax,
                    )
                )

        else:
            addressees = (
                [
                    BeaconMalfunctionNotificationAddressee(
                        function=BeaconMalfunctionNotificationRecipientFunction.FMC,
                        name="CNSP",
                        address_or_number=CNSP_SIP_DEPARTMENT_FAX,
                    )
                ]
                if CNSP_SIP_DEPARTMENT_FAX
                else []
            )
        return addressees

    def get_email_addressees(self) -> List[BeaconMalfunctionNotificationAddressee]:

        if not self.test_mode:

            vessel_emails = self.vessel_emails if self.vessel_emails else []
            satellite_operator_emails = (
                self.satellite_operator_emails if self.satellite_operator_emails else []
            )
            operator_emails = [self.operator_email] if self.operator_email else []

            vessel_addressees = [
                BeaconMalfunctionNotificationAddressee(
                    function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_CAPTAIN,
                    name=None,
                    address_or_number=vessel_email,
                )
                for vessel_email in vessel_emails
            ]

            satellite_operator_addressees = [
                BeaconMalfunctionNotificationAddressee(
                    function=BeaconMalfunctionNotificationRecipientFunction.SATELLITE_OPERATOR,
                    name=self.satellite_operator,
                    address_or_number=satellite_operator_email,
                )
                for satellite_operator_email in satellite_operator_emails
            ]

            operator_addressees = [
                BeaconMalfunctionNotificationAddressee(
                    function=BeaconMalfunctionNotificationRecipientFunction.VESSEL_OPERATOR,
                    name=self.operator_name,
                    address_or_number=operator_email,
                )
                for operator_email in operator_emails
            ]

            addressees = (
                vessel_addressees + operator_addressees + satellite_operator_addressees
            )

        else:
            addressees = (
                [
                    BeaconMalfunctionNotificationAddressee(
                        function=BeaconMalfunctionNotificationRecipientFunction.FMC,
                        name="CNSP",
                        address_or_number=CNSP_SIP_DEPARTMENT_EMAIL,
                    )
                ]
                if CNSP_SIP_DEPARTMENT_EMAIL
                else []
            )
        return addressees

    def get_notification_subject(self):
        template = self.notification_type.to_notification_subject_template()
        return template.format(
            vessel_name=self.vessel_name, immat=self.vessel_cfr_or_immat_or_ircs
        )


@dataclass
class BeaconMalfunctionMessageToSend:
    message: EmailMessage
    beacon_malfunction_to_notify: BeaconMalfunctionToNotify
    communication_means: CommunicationMeans

    def get_addressees(self) -> List[BeaconMalfunctionNotificationAddressee]:

        if self.communication_means is CommunicationMeans.EMAIL:
            return self.beacon_malfunction_to_notify.get_email_addressees()
        elif self.communication_means is CommunicationMeans.SMS:
            return self.beacon_malfunction_to_notify.get_sms_addressees()
        elif self.communication_means is CommunicationMeans.FAX:
            return self.beacon_malfunction_to_notify.get_fax_addressees()
        else:
            raise ValueError(
                f"Unexpected communication_means {self.communication_means}"
            )


@dataclass
class BeaconMalfunctionNotification:
    beacon_malfunction_id: int
    date_time_utc: datetime
    notification_type: BeaconMalfunctionNotificationType
    communication_means: CommunicationMeans
    recipient_function: BeaconMalfunctionNotificationRecipientFunction
    recipient_name: str
    recipient_address_or_number: str
    success: bool
    error_message: str
