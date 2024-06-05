from dataclasses import InitVar, dataclass, field
from datetime import datetime
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
    pno_types: List[str]
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
