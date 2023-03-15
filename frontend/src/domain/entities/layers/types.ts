import type { LayerType } from './constants'

export enum MonitorFishLayer {
  AEM = 'AEM',
  BASE_LAYER = 'BASE_LAYER',
  CCAMLR = 'CCAMLR',
  DRAW = 'DRAW',
  EEZ = 'EEZ',
  FAO = 'FAO',
  FILTERED_VESSELS = 'FILTERED_VESSELS',
  ICCAT = 'ICCAT',
  INTEREST_POINT = 'INTEREST_POINT',
  IOTC = 'IOTC',
  MEASUREMENT = 'MEASUREMENT',
  MISSION = 'MISSION',
  MISSIONS_LABEL = 'MISSIONS_LABEL',
  MISSION_HOVER = 'MISSION_HOVER',
  NAFO = 'NAFO',
  NEAFC = 'NEAFC',
  REGULATORY = 'REGULATORY',
  REGULATORY_PREVIEW = 'REGULATORY_PREVIEW',
  SELECTED_VESSEL = 'SELECTED_VESSEL',
  SIOFA = 'SIOFA',
  SIX_MILES = 'SIX_MILES',
  THREE_MILES = 'THREE_MILES',
  TWELVE_MILES = 'TWELVE_MILES',
  VESSELS = 'VESSELS',
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

export type ShowableLayer = {
  code: string
  getZoneName?: (feature: any) => string
  group?: CodeAndName | undefined
  hasFetchableZones?: boolean
  hasSearchableZones?: boolean
  isIntersectable?: boolean
  name?: string
  subSubZoneFieldKey?: string
  subZoneFieldKey?: string
  type: LayerType
  zIndex?: number
  zoneFieldKey?: string
}

export type ShowedLayer = {
  namespace: string
  type: string
  zone: string | null
}

export type CodeAndName = {
  code: string
  name: string
}
