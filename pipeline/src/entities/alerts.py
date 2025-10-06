from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import List

import pandas as pd
from pydantic import BaseModel, ConfigDict
from pydantic.dataclasses import dataclass as pydataclass
from sqlalchemy import Table


class AlertType(Enum):
    MISSING_DEP_ALERT = "MISSING_DEP_ALERT"
    MISSING_FAR_ALERT = "MISSING_FAR_ALERT"
    MISSING_FAR_48_HOURS_ALERT = "MISSING_FAR_48_HOURS_ALERT"
    SUSPICION_OF_UNDER_DECLARATION_ALERT = "SUSPICION_OF_UNDER_DECLARATION_ALERT"
    POSITION_ALERT = "POSITION_ALERT"


@pydataclass(config=ConfigDict(extra="forbid"))
class GearSpecification:
    gear: str
    minMesh: float | None = None
    maxMesh: float | None = None


@pydataclass(config=ConfigDict(extra="forbid"))
class SpeciesSpecification:
    species: str
    minWeight: float | None = None


class AdministrativeAreaType(Enum):
    FAO_AREA = "FAO_AREA"
    EEZ_AREA = "EEZ_AREA"
    NEAFC_AREA = "NEAFC_AREA"
    DISTANCE_TO_SHORE = "DISTANCE_TO_SHORE"


@dataclass
class AreasTableMetadata:
    table_name: str
    geometry_column: str
    filter_column: str


class AdminAreasSpecification(BaseModel):
    areaType: AdministrativeAreaType
    areas: List


@dataclass
class AdminAreasSpecWithTable:
    area_type: AdministrativeAreaType
    areas: List
    metadata: AreasTableMetadata
    table: Table


class RegulatoryAreaSpecification(BaseModel):
    lawType: str | None = None
    topic: str | None = None
    zone: str | None = None


class PositionAlertSpecification(BaseModel):
    id: int
    name: str
    description: str
    natinf_code: int
    is_activated: bool
    is_in_error: bool
    error_reason: str | None
    validity_start_datetime_utc: datetime | None
    validity_end_datetime_utc: datetime | None
    repeat_each_year: bool
    track_analysis_depth: float
    only_fishing_positions: bool
    gears: List[GearSpecification] | None
    species: List[SpeciesSpecification] | None
    species_catch_areas: List[str] | None
    administrative_areas: List[AdminAreasSpecification] | None
    regulatory_areas: List[RegulatoryAreaSpecification] | None
    min_depth: float | None
    flag_states_iso2: List[str] | None
    vessel_ids: List[int] | None
    district_codes: List[str] | None
    producer_organizations: List[str] | None

    def model_post_init(self, __context):
        if pd.isnull(self.min_depth):
            self.min_depth = None
