from datetime import datetime
from enum import Enum
from typing import List

import pandas as pd
from pydantic import BaseModel
from sqlalchemy import Table


class AlertType(Enum):
    THREE_MILES_TRAWLING_ALERT = "THREE_MILES_TRAWLING_ALERT"
    FRENCH_EEZ_FISHING_ALERT = "FRENCH_EEZ_FISHING_ALERT"
    TWELVE_MILES_FISHING_ALERT = "TWELVE_MILES_FISHING_ALERT"
    BOTTOM_GEAR_VME_FISHING_ALERT = "BOTTOM_GEAR_VME_FISHING_ALERT"
    BOTTOM_TRAWL_800_METERS_FISHING_ALERT = "BOTTOM_TRAWL_800_METERS_FISHING_ALERT"
    MISSING_DEP_ALERT = "MISSING_DEP_ALERT"
    MISSING_FAR_ALERT = "MISSING_FAR_ALERT"
    MISSING_FAR_48_HOURS_ALERT = "MISSING_FAR_48_HOURS_ALERT"
    SUSPICION_OF_UNDER_DECLARATION_ALERT = "SUSPICION_OF_UNDER_DECLARATION_ALERT"
    RTC_FISHING_ALERT = "RTC_FISHING_ALERT"
    NEAFC_FISHING_ALERT = "NEAFC_FISHING_ALERT"
    BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT = "BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT"


class GearSpecification(BaseModel):
    gear: str
    min_mesh: float | None = None
    max_mesh: float | None = None


class SpeciesSpecification(BaseModel):
    species: str
    min_weight: float | None = None


{
    # AlertType.THREE_MILES_TRAWLING_ALERT: {
    #     "table": "n_miles_to_shore_areas_subdivided",
    #     "filter_column": "miles_to_shore",
    #     "geometry_column": "geometry",
    # },
    # AlertType.TWELVE_MILES_FISHING_ALERT: {
    #     "table": "n_miles_to_shore_areas_subdivided",
    #     "filter_column": "miles_to_shore",
    #     "geometry_column": "geometry",
    # },
    # AlertType.FRENCH_EEZ_FISHING_ALERT: {
    #     "table": "eez_areas",
    #     "filter_column": "iso_sov1",
    #     "geometry_column": "wkb_geometry",
    # },
    # AlertType.RTC_FISHING_ALERT: {
    #     "table": "regulations",
    #     "filter_column": "law_type",
    #     "geometry_column": "geometry",
    # },
    # AlertType.NEAFC_FISHING_ALERT: {
    #     "table": "neafc_regulatory_area",
    #     "filter_column": None,
    #     "geometry_column": "wkb_geometry",
    # },
    # AlertType.BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT: {
    #     "table": "regulations",
    #     "filter_column": "topic",
    #     "geometry_column": "geometry",
    # },
    # AlertType.BOTTOM_GEAR_VME_FISHING_ALERT: {
    #     "table": "regulations",
    #     "filter_column": "topic",
    #     "geometry_column": "geometry",
    # },
    # AlertType.BOTTOM_TRAWL_800_METERS_FISHING_ALERT: {
    #     "table": "regulations",
    #     "filter_column": "zone",
    #     "geometry_column": "geometry",
    # },
}


class AdministrativeAreaType(Enum):
    FAO_AREA = "FAO_AREA"
    EEZ_AREA = "EEZ_AREA"
    NEAFC_AREA = "NEAFC_AREA"
    DISTANCE_TO_SHORE = "DISTANCE_TO_SHORE"


class AreasTableMetadata(BaseModel):
    table_name: str
    geometry_column: str
    filter_column: str


class AreasTable(BaseModel):
    metadata: AreasTableMetadata
    table: Table


class AdministrativeAreasSpecification(BaseModel):
    area_type: AdministrativeAreaType
    areas: List[str]


class AdministrativeAreasSpecificationWithTable(BaseModel):
    area_type: AdministrativeAreaType
    areas: List[str]
    zones_table: AreasTable


class RegulatoryAreaSpecification(BaseModel):
    law_type: str | None
    topic: str | None
    zone: str | None


class PositionAlertSpecification(BaseModel):
    id: int
    name: str
    description: str
    natinf_code: int
    is_activated: bool
    is_in_error: bool
    error_reason: str | None
    repeat_each_year: bool
    validity_start_datetime_utc: datetime | None
    validity_end_datetime_utc: datetime | None
    only_fishing_positions: bool
    gears: List[GearSpecification] | None
    include_vessels_with_unknown_gear: bool
    species: List[SpeciesSpecification] | None
    administrative_areas: List[AdministrativeAreasSpecification] | None
    regulatory_areas: List[RegulatoryAreaSpecification] | None
    min_depth: float | None
    flag_states_iso2: List[str] | None
    vessel_ids: List[int] | None
    district_codes: List[str] | None
    producer_organizations: List[str] | None

    def model_post_init(self, __context):
        if pd.isnull(self.min_depth):
            self.min_depth = None
