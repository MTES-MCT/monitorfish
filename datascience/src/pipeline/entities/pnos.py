from dataclasses import dataclass, field
from datetime import datetime
from email.message import EmailMessage
from enum import Enum
from typing import List, Optional

import pandas as pd

from src.pipeline.entities.communication_means import CommunicationMeans
from src.pipeline.entities.control_units import ControlUnit
from src.pipeline.entities.fleet_segments import FishingGear, FleetSegment
from src.pipeline.entities.missions import Infraction


@dataclass(kw_only=True)
class PnoCatch:
    species_code: str
    species_name: str
    species_name_code: str = field(init=False)
    weight: float
    number_of_fish: int
    fao_area: str
    statistical_rectangle: str

    def __post_init__(self):
        self.species_name_code = f"{self.species_name or '-'} ({self.species_code})"


class PnoSource(Enum):
    MANUAL = "MANUAL"
    LOGBOOK = "LOGBOOK"


@dataclass(kw_only=True)
class PnoToRender:
    id: int
    operation_datetime_utc: datetime
    report_id: str
    report_datetime_utc: datetime
    vessel_id: str
    cfr: str
    ircs: str
    external_identification: str
    vessel_name: str
    flag_state: str
    purpose: str
    catch_onboard: List[dict]
    port_locode: str
    port_name: str
    facade: str
    predicted_arrival_datetime_utc: datetime
    predicted_landing_datetime_utc: datetime
    trip_gears: List[dict]
    trip_segments: List[dict]
    pno_types: List[dict]
    note: str
    vessel_length: float
    mmsi: str
    risk_factor: float
    last_control_datetime_utc: datetime
    last_control_logbook_infractions: List[dict]
    last_control_gear_infractions: List[dict]
    last_control_species_infractions: List[dict]
    last_control_other_infractions: List[dict]
    is_verified: bool
    is_being_sent: bool
    source: PnoSource

    def __post_init__(self):
        datetime_attrs = [
            "operation_datetime_utc",
            "report_datetime_utc",
            "predicted_arrival_datetime_utc",
            "predicted_landing_datetime_utc",
            "last_control_datetime_utc",
        ]

        for att in datetime_attrs:
            if isinstance(getattr(self, att), pd.Timedelta):
                setattr(self, att, getattr(self, att).to_pydatetime())

        # float and datetime nulls are represented as np.nan and pd.NaT in pandas, which we normalize to None
        nullables_to_correct = [
            "operation_datetime_utc",
            "report_datetime_utc",
            "predicted_arrival_datetime_utc",
            "predicted_landing_datetime_utc",
            "vessel_length",
            "risk_factor",
            "last_control_datetime_utc",
        ]

        for att in nullables_to_correct:
            if pd.isna(getattr(self, att)):
                setattr(self, att, None)

        if not isinstance(self.source, PnoSource):
            assert isinstance(self.source, str)
            self.source = PnoSource(self.source)


@dataclass(kw_only=True)
class PreRenderedPno:
    id: int
    operation_datetime_utc: datetime
    report_id: str
    report_datetime_utc: datetime
    vessel_id: str
    cfr: str
    ircs: str
    external_identification: str
    vessel_name: str
    flag_state: str
    purpose: str
    catch_onboard: pd.DataFrame
    bft_summary: str
    port_locode: str
    port_name: str
    facade: str
    predicted_arrival_datetime_utc: datetime
    predicted_landing_datetime_utc: datetime
    trip_gears: List[FishingGear]
    trip_segments: List[FleetSegment]
    pno_types: List[str]
    note: str
    vessel_length: float
    mmsi: str
    risk_factor: float
    last_control_datetime_utc: datetime
    last_control_logbook_infractions: List[Infraction]
    last_control_gear_infractions: List[Infraction]
    last_control_species_infractions: List[Infraction]
    last_control_other_infractions: List[Infraction]
    is_verified: bool
    is_being_sent: bool
    source: PnoSource

    @staticmethod
    def assert_equal(left: object, right: object):
        if not isinstance(left, PreRenderedPno):
            raise AssertionError("`left` is not a `PreRenderedPno`")

        if not isinstance(right, PreRenderedPno):
            raise AssertionError("`right` is not a `PreRenderedPno`")

        if not (left.catch_onboard is None and right.catch_onboard is None):
            try:
                pd.testing.assert_frame_equal(left.catch_onboard, right.catch_onboard)
            except AssertionError as e:
                raise AssertionError(
                    (
                        "`left` and `right` are not equal. Their `catch_onboard` "
                        f"attributes are different : {str(e)}"
                    )
                )

        attributes_to_check = [k for k in left.__dict__.keys() if k != "catch_onboard"]

        for attr in attributes_to_check:
            if getattr(left, attr) != getattr(right, attr):
                if not (pd.isna(getattr(left, attr)) and pd.isna(getattr(right, attr))):
                    raise AssertionError(
                        (
                            f"`self` and `other` are not equal. Their `{attr}` "
                            "attributes are different : "
                            f"{getattr(left, attr)} != {getattr(right, attr)}"
                        )
                    )


class ReturnToPortPurpose(Enum):
    SHE = "SHE"
    OTH = "OTH"
    LAN = "LAN"
    REF = "REF"
    REP = "REP"
    RES = "RES"
    ECY = "ECY"
    TRA = "TRA"
    SCR = "SCR"
    GRD = "GRD"
    ACS = "ACS"

    def label(self):
        labels = {
            "SHE": "Mise à l’abri",
            "OTH": "Autre",
            "LAN": "Débarquement",
            "REF": "Ravitaillement",
            "REP": "Réparation",
            "RES": "Repos",
            "ECY": "Urgence",
            "TRA": "Transbordement",
            "SCR": "Retour pour Recherche Scientifique",
            "GRD": "Immobilisation et convocation par les autorités",
            "ACS": "Accès aux services",
        }
        return labels[self.name]


@dataclass
class PnoAddressee:
    name: str
    organization: str
    communication_means: CommunicationMeans
    email_address_or_number: str


@dataclass
class RenderedPno:
    report_id: str
    vessel_id: int
    cfr: str
    vessel_name: str
    is_verified: bool
    is_being_sent: bool
    trip_segments: list
    pno_types: List[str]
    port_locode: str
    facade: str
    source: PnoSource
    html_for_pdf: str | None = None
    pdf_document: bytes | None = None
    generation_datetime_utc: datetime | None = None
    html_email_body: str | None = None
    sms_content: str | None = None
    control_units: List[ControlUnit] | None = None
    additional_addressees: List[PnoAddressee] = None

    def get_addressees(
        self, communication_means: CommunicationMeans
    ) -> List[PnoAddressee]:
        addressees = []

        if self.control_units:
            if communication_means == CommunicationMeans.EMAIL:
                addressees += [
                    PnoAddressee(
                        name=control_unit.control_unit_name,
                        organization=control_unit.administration,
                        communication_means=CommunicationMeans.EMAIL,
                        email_address_or_number=email,
                    )
                    for control_unit in self.control_units
                    for email in control_unit.emails
                ]
            elif communication_means == CommunicationMeans.SMS:
                addressees += [
                    PnoAddressee(
                        name=control_unit.control_unit_name,
                        organization=control_unit.administration,
                        communication_means=CommunicationMeans.SMS,
                        email_address_or_number=phone_number,
                    )
                    for control_unit in self.control_units
                    for phone_number in control_unit.phone_numbers
                ]
            else:
                raise ValueError(
                    f"Unexpected communication_means {communication_means}"
                )

        if self.additional_addressees:
            addressees += [
                PnoAddressee(
                    name=add.name,
                    organization=add.organization,
                    communication_means=communication_means,
                    email_address_or_number=add.email_address_or_number,
                )
                for add in self.additional_addressees
                if add.communication_means is communication_means
            ]

        return addressees


@dataclass
class PnoToSend:
    pno: RenderedPno
    message: EmailMessage
    communication_means: CommunicationMeans


@dataclass
class PriorNotificationSentMessage:
    prior_notification_report_id: str
    prior_notification_source: PnoSource
    date_time_utc: datetime
    communication_means: CommunicationMeans
    recipient_address_or_number: str
    success: bool
    recipient_name: str
    recipient_organization: str
    error_message: Optional[str] = None
