from dataclasses import InitVar, dataclass, field
from datetime import datetime
from enum import Enum
from typing import List

import pandas as pd

from src.pipeline.entities.fleet_segments import FishingGear, FleetSegment


@dataclass(kw_only=True)
class PnoCatch:
    species_code: InitVar[str]
    species_name: InitVar[str]
    species_name_code: str = field(init=False)
    weight: float
    number_of_fish: int
    fao_area: str
    statistical_rectangle: str

    def __post_init__(self, species_code, species_name):
        self.species_name_code = f"{species_name or '-'} ({species_code})"


@dataclass(kw_only=True)
class PnoToRender:
    id: int
    operation_number: str
    operation_datetime_utc: datetime
    operation_type: str
    report_id: str
    report_datetime_utc: datetime
    cfr: str
    ircs: str
    external_identification: str
    vessel_name: str
    flag_state: str
    purpose: str
    catch_onboard: List[dict]
    port_locode: str
    port_name: str
    predicted_arrival_datetime_utc: datetime
    predicted_landing_datetime_utc: datetime
    trip_gears: List[dict]
    trip_segments: List[dict]
    pno_types: List[dict]
    vessel_length: float
    mmsi: str
    risk_factor: float
    last_control_datetime_utc: datetime

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


@dataclass(kw_only=True)
class PreRenderedPno:
    id: int
    operation_number: str
    operation_datetime_utc: datetime
    operation_type: str
    report_id: str
    report_datetime_utc: datetime
    cfr: str
    ircs: str
    external_identification: str
    vessel_name: str
    flag_state: str
    purpose: str
    catch_onboard: pd.DataFrame
    port_locode: str
    port_name: str
    predicted_arrival_datetime_utc: datetime
    predicted_landing_datetime_utc: datetime
    trip_gears: List[FishingGear]
    trip_segments: List[FleetSegment]
    pno_types: List[str]
    vessel_length: float
    mmsi: str
    risk_factor: float
    last_control_datetime_utc: datetime

    @staticmethod
    def assertEqual(left: object, right: object):
        if not isinstance(left, PreRenderedPno):
            raise AssertionError("`left` is not a `PreRenderedPno`")

        if not isinstance(right, PreRenderedPno):
            raise AssertionError("`right` is not a `PreRenderedPno`")

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
                raise AssertionError(
                    (
                        f"`self` and `other` are not equal. Their `{attr}` "
                        "attributes are different : "
                        f"{getattr(left, attr)} != {getattr(right, attr)}"
                    )
                )

        #     self.id == other.id
        #     self.operation_number == other.operation_number
        #     self.operation_datetime_utc == other.operation_datetime_utc
        #     self.operation_type == other.operation_type
        #     self.report_id == other.report_id
        #     self.report_datetime_utc == other.report_datetime_utc
        #     self.cfr == other.cfr
        #     self.ircs == other.ircs
        #     self.external_identification == other.external_identification
        #     self.vessel_name == other.vessel_name
        #     self.flag_state == other.flag_state
        #     self.purpose == other.purpose
        #     self.port_locode == other.port_locode
        #     self.port_name == other.port_name
        #     (
        #         self.predicted_arrival_datetime_utc
        #         == other.predicted_arrival_datetime_utc
        #     )
        #     (
        #         self.predicted_landing_datetime_utc
        #         == other.predicted_landing_datetime_utc
        #     )
        #     self.trip_gears == other.trip_gears
        #     self.trip_segments == other.trip_segments
        #     self.pno_types == other.pno_types
        #     self.vessel_length == other.vessel_length
        #     self.mmsi == other.mmsi
        #     self.risk_factor == other.risk_factor
        #     self.last_control_datetime_utc == other.last_control_datetime_utc
        # ]


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
            "ACS": "Accès auxFresizeservices",
        }
        return labels[self.name]
