from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import List


class BeaconMalfunctionStage(Enum):
    INITIAL_ENCOUNTER = "INITIAL_ENCOUNTER"
    FOUR_HOUR_REPORT = "FOUR_HOUR_REPORT"
    RELAUNCH_REQUEST = "RELAUNCH_REQUEST"
    TARGETING_VESSEL = "TARGETING_VESSEL"
    CROSS_CHECK = "CROSS_CHECK"
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
    TEMPORARY_INTERRUPTION_OF_SUPERVISION = "TEMPORARY_INTERRUPTION_OF_SUPERVISION"
    PERMANENT_INTERRUPTION_OF_SUPERVISION = "PERMANENT_INTERRUPTION_OF_SUPERVISION"


class BeaconMalfunctionNotificationType(Enum):
    MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION = "MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION"
    MALFUNCTION_AT_SEA_REMINDER = "MALFUNCTION_AT_SEA_REMINDER"
    MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION = (
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION"
    )
    MALFUNCTION_AT_PORT_REMINDER = "MALFUNCTION_AT_PORT_REMINDER"
    END_OF_MALFUNCTION = "END_OF_MALFUNCTION"

    def to_message_subject(self):
        type_object_mapping = {
            "MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION": "Interruption en mer des émissions VMS de votre navire",
            "MALFUNCTION_AT_SEA_REMINDER": "RAPPEL : Interruption en mer des émissions VMS de votre navire",
            "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION": "Interruption à quai des émissions VMS de votre navire",
            "MALFUNCTION_AT_PORT_REMINDER": "RAPPEL : Interruption à quai des émissions VMS de votre navire",
            "END_OF_MALFUNCTION": "Reprise des émissions VMS de votre navire",
        }
        return type_object_mapping[self.name]


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

    def __post_init__(self):
        self.notification_type = BeaconMalfunctionNotificationType(
            self.notification_type
        )

    def get_email_addressees(self):
        vessel_emails = self.vessel_emails if self.vessel_emails else []
        satellite_operator_emails = (
            self.satellite_operator_emails if self.satellite_operator_emails else []
        )
        operator_emails = [self.operator_email] if self.operator_email else []
        addressees = vessel_emails + operator_emails + satellite_operator_emails
        return addressees
