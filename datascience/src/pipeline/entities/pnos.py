from dataclasses import InitVar, dataclass, field
from datetime import datetime
from enum import Enum
from typing import List

import pandas as pd

from src.pipeline.entities.fleet_segments import FishingGear, FleetSegment
from src.pipeline.entities.missions import Infraction


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
    last_control_logbook_infractions: List[dict]
    last_control_gear_infractions: List[dict]
    last_control_species_infractions: List[dict]
    last_control_other_infractions: List[dict]

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
    last_control_logbook_infractions: List[Infraction]
    last_control_gear_infractions: List[Infraction]
    last_control_species_infractions: List[Infraction]
    last_control_other_infractions: List[Infraction]

    @staticmethod
    def assertEqual(left: object, right: object):
        if not isinstance(left, PreRenderedPno):
            raise AssertionError("`left` is not a `PreRenderedPno`")

        if not isinstance(right, PreRenderedPno):
            raise AssertionError("`right` is not a `PreRenderedPno`")

        if left.catch_onboard is None and right.catch_onboard is None:
            pass
        else:
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
                if pd.isna(getattr(left, attr)) and pd.isna(getattr(right, attr)):
                    pass
                else:
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
