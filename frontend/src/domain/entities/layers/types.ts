import type { LayerType } from './constants'
import type { GearRegulation } from '@features/Regulation/types'

/** @deprecated Redux namespacing should not be stored in data. */
// TODO Replace that with a cleaner mechanism.
export enum LayerSliceNamespace {
  backoffice = 'backoffice',
  homepage = 'homepage'
}

export enum MonitorFishLayer {
  AEM = 'AEM',
  BASE_LAYER = 'BASE_LAYER',
  CCAMLR = 'CCAMLR',
  CUSTOM = 'CUSTOM',
  DRAW = 'DRAW',
  EEZ = 'EEZ',
  FAO = 'FAO',
  FILTERED_VESSELS = 'FILTERED_VESSELS',
  ICCAT = 'ICCAT',
  INTEREST_POINT = 'INTEREST_POINT',
  IOTC = 'IOTC',
  MEASUREMENT = 'MEASUREMENT',
  MISSIONS_LABEL = 'MISSIONS_LABEL',
  MISSION_ACTION_SELECTED = 'MISSION_ACTION_SELECTED',
  MISSION_HOVER = 'MISSION_HOVER',
  MISSION_PIN_POINT = 'MISSION_PIN_POINT',
  MISSION_SELECTED = 'MISSION_SELECTED',
  NAFO = 'NAFO',
  NEAFC = 'NEAFC',
  REGULATORY = 'REGULATORY',
  REGULATORY_PREVIEW = 'REGULATORY_PREVIEW',
  SELECTED_VESSEL = 'SELECTED_VESSEL',
  SIOFA = 'SIOFA',
  SIX_MILES = 'SIX_MILES',
  STATION = 'STATION',
  THREE_MILES = 'THREE_MILES',
  TWELVE_MILES = 'TWELVE_MILES',
  VESSELS = 'VESSELS_POINTS',
  VESSELS_LABEL = 'VESSELS_LABEL',
  VESSEL_ALERT = 'VESSEL_ALERT',
  VESSEL_ALERT_AND_BEACON_MALFUNCTION = 'VESSEL_ALERT_AND_BEACON_MALFUNCTION',
  VESSEL_BEACON_MALFUNCTION = 'VESSEL_BEACON_MALFUNCTION',
  VESSEL_ESTIMATED_POSITION = 'VESSEL_ESTIMATED_POSITION',
  VESSEL_INFRACTION_SUSPICION = 'VESSEL_INFRACTION_SUSPICION',
  VESSEL_TRACK = 'VESSEL_TRACK',
  brexit = 'brexit',
  cgpm_areas = 'cgpm_areas',
  cgpm_statistical_rectangles_areas = 'cgpm_statistical_rectangles_areas',
  cormoran = 'cormoran',
  eaux_occidentales_australes = 'eaux_occidentales_australes',
  eaux_occidentales_septentrionales = 'eaux_occidentales_septentrionales',
  eaux_union_dans_oi_et_atl_ouest = 'eaux_union_dans_oi_et_atl_ouest',
  effort_zones_areas = 'effort_zones_areas',
  mer_baltique = 'mer_baltique',
  mer_celtique = 'mer_celtique',
  mer_du_nord = 'mer_du_nord',
  mer_mediterranee = 'mer_mediterranee',
  mer_noire = 'mer_noire',
  navigation_category_five = 'navigation_category_five',
  navigation_category_four = 'navigation_category_four',
  navigation_category_three = 'navigation_category_three',
  navigation_category_two = 'navigation_category_two',
  rectangles_stat = 'rectangles_stat',
  saltwater_limit = 'saltwater_limit',
  situations = 'situations',
  transversal_sea_limit = 'transversal_sea_limit'
}

export type CodeAndName = {
  code: string
  name: string
}

export type ShowableLayer = {
  code: MonitorFishLayer | string
  group?: CodeAndName | undefined
  hasFetchableZones?: boolean
  hasSearchableZones?: boolean
  isClickable?: boolean
  isHoverable?: boolean
  isIntersectable?: boolean
  name?: string
  type: LayerType
  zIndex?: number
  zoneNamePropertyKey?: string
}

// TODO Check and split this type.
// TODO Strict-type all the constants/params using it. It's way too partial (TS migration) which complicates the type-checking/guarding.
export type ShowedLayer = {
  gears?: GearRegulation
  id?: number | string | undefined
  layerName?: string
  topic?: string | undefined
  type?: string | undefined
  zone?: string | undefined
}
