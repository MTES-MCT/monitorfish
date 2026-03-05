import { AdministrativeAreaTypeLabel } from '@features/Alert/constants'

import { MonitorFishMap } from './Map.types'

import type { Option } from '@mtes-mct/monitor-ui'

export const WSG84_PROJECTION = 'EPSG:4326'
export const OPENLAYERS_PROJECTION = 'EPSG:3857'

export enum InteractionType {
  CIRCLE = 'CIRCLE',
  POINT = 'POINT',
  POLYGON = 'POLYGON',
  SELECTION = 'SELECTION',
  SQUARE = 'SQUARE'
}

export enum InteractionListener {
  CONTROL_POINT = 'CONTROL_POINT',
  REPORTING_POINT = 'REPORTING_POINT',
  EDIT_DYNAMIC_VESSEL_GROUP_DIALOG = 'EDIT_DYNAMIC_VESSEL_GROUP_DIALOG',
  INTEREST_POINT = 'INTEREST_POINT',
  MEASUREMENT = 'MEASUREMENT',
  MISSION_ZONE = 'MISSION_ZONE',
  REGULATION = 'REGULATION',
  VESSELS_LIST = 'VESSELS_LIST'
}

export enum MeasurementType {
  CIRCLE_RANGE = 'Circle',
  MULTILINE = 'LineString'
}

export enum CoordinatesFormat {
  DECIMAL_DEGREES = 'DD',
  DEGREES_MINUTES_DECIMALS = 'DMD',
  DEGREES_MINUTES_SECONDS = 'DMS'
}

export const COORDINATES_FORMAT_OPTIONS: Array<Option<CoordinatesFormat>> = [
  {
    label: 'DMS',
    value: CoordinatesFormat.DEGREES_MINUTES_SECONDS
  },
  {
    label: 'DMD',
    value: CoordinatesFormat.DEGREES_MINUTES_DECIMALS
  },
  {
    label: 'DD',
    value: CoordinatesFormat.DECIMAL_DEGREES
  }
]

export enum MapBox {
  ACCOUNT = 'ACCOUNT',
  FAVORITE_VESSELS = 'FAVORITE_VESSELS',
  INTEREST_POINT = 'INTEREST_POINT',
  MEASUREMENT = 'MEASUREMENT',
  MEASUREMENT_MENU = 'MEASUREMENT_MENU',
  MISSIONS = 'MISSIONS',
  NEW_FEATURES = 'NEW_FEATURES',
  REGULATIONS = 'REGULATIONS',
  REPORTINGS = 'REPORTINGS',
  REPORTING_FORM = 'REPORTING_FORM',
  VESSEL_GROUPS = 'VESSEL_GROUPS',
  VESSEL_VISIBILITY = 'VESSEL_VISIBILITY'
}

export enum OpenLayersGeometryType {
  CIRCLE = 'Circle',
  MULTIPOINT = 'MultiPoint',
  MULTIPOLYGON = 'MultiPolygon',
  POINT = 'Point',
  POLYGON = 'Polygon'
}

export const layersGroups: Record<string, MonitorFishMap.CodeAndName> = {
  NAVIGATION_CATEGORY: {
    code: 'navigation_category',
    name: 'Catégories de navigation'
  },
  ORGP: {
    code: 'orgp',
    name: 'Zones ORGP'
  },
  TWELVE_FORTY_ONE: {
    code: 'twelve_forty_one',
    name: 'Zones du 1241'
  },
  VMS_SITUATION: {
    code: 'situs_areas',
    name: 'Zones pour situation VMS'
  }
}

export enum LayerType {
  BASE_LAYER = 'BASE_LAYER',
  CUSTOM = 'CUSTOM',
  DRAW = 'DRAW',
  FREE_DRAW = 'FREE_DRAW',
  INFRACTION_SUSPICION = 'INFRACTION_SUSPICION',
  INTEREST_POINT = 'INTEREST_POINT',
  MEASUREMENT = 'MEASUREMENT',
  MISSION = 'MISSION',
  REGULATORY = 'REGULATORY',
  REGULATORY_PREVIEW = 'REGULATORY_PREVIEW',
  REPORTING = 'REPORTING',
  STATION = 'STATION',
  VESSEL = 'VESSEL',
  VESSEL_ALERT = 'VESSEL_ALERT',
  VESSEL_ALERT_AND_BEACON_MALFUNCTION = 'VESSEL_ALERT_AND_BEACON_MALFUNCTION',
  VESSEL_BEACON_MALFUNCTION = 'VESSEL_BEACON_MALFUNCTION'
}

/**
 * /!\ Do not modify the code property : in some cases, it is the Geoserver layer name, hence the name of the PostGIS table
 */
/* eslint-disable sort-keys-fix/sort-keys-fix */
export const LayerProperties: Record<MonitorFishMap.MonitorFishLayer, MonitorFishMap.ShowableLayer> = {
  [MonitorFishMap.MonitorFishLayer.BASE_LAYER]: {
    code: 'ol-layer',
    type: LayerType.BASE_LAYER
  },
  [MonitorFishMap.MonitorFishLayer.VESSELS]: {
    code: MonitorFishMap.MonitorFishLayer.VESSELS,
    type: LayerType.VESSEL,
    zIndex: 1000
  },
  [MonitorFishMap.MonitorFishLayer.MISSION_PIN_POINT]: {
    code: MonitorFishMap.MonitorFishLayer.MISSION_PIN_POINT,
    type: LayerType.MISSION,
    zIndex: 1001
  },
  [MonitorFishMap.MonitorFishLayer.REPORTING]: {
    code: MonitorFishMap.MonitorFishLayer.REPORTING,
    type: LayerType.REPORTING,
    zIndex: 1002
  },
  [MonitorFishMap.MonitorFishLayer.MISSION_HOVER]: {
    code: MonitorFishMap.MonitorFishLayer.MISSION_HOVER,
    type: LayerType.MISSION,
    zIndex: 80
  },
  [MonitorFishMap.MonitorFishLayer.MISSION_SELECTED]: {
    code: MonitorFishMap.MonitorFishLayer.MISSION_SELECTED,
    type: LayerType.MISSION,
    zIndex: 81
  },
  [MonitorFishMap.MonitorFishLayer.MISSION_ACTION_SELECTED]: {
    code: MonitorFishMap.MonitorFishLayer.MISSION_ACTION_SELECTED,
    type: LayerType.MISSION,
    zIndex: 82
  },
  [MonitorFishMap.MonitorFishLayer.MISSIONS_LABEL]: {
    code: MonitorFishMap.MonitorFishLayer.MISSIONS_LABEL,
    type: LayerType.MISSION,
    zIndex: 980
  },
  [MonitorFishMap.MonitorFishLayer.SELECTED_VESSEL]: {
    code: MonitorFishMap.MonitorFishLayer.SELECTED_VESSEL,
    type: LayerType.VESSEL,
    zIndex: 995
  },
  [MonitorFishMap.MonitorFishLayer.DRAW]: {
    code: MonitorFishMap.MonitorFishLayer.DRAW,
    type: LayerType.DRAW,
    zIndex: 999
  },
  [MonitorFishMap.MonitorFishLayer.STATION]: {
    code: MonitorFishMap.MonitorFishLayer.STATION,
    type: LayerType.STATION,
    zIndex: 1001
  },
  [MonitorFishMap.MonitorFishLayer.FILTERED_VESSELS]: {
    code: MonitorFishMap.MonitorFishLayer.FILTERED_VESSELS,
    type: LayerType.VESSEL,
    zIndex: 1000
  },
  [MonitorFishMap.MonitorFishLayer.VESSEL_ALERT]: {
    code: MonitorFishMap.MonitorFishLayer.VESSEL_ALERT,
    type: LayerType.VESSEL_ALERT,
    zIndex: 990
  },
  [MonitorFishMap.MonitorFishLayer.VESSEL_INFRACTION_SUSPICION]: {
    code: MonitorFishMap.MonitorFishLayer.VESSEL_INFRACTION_SUSPICION,
    type: LayerType.VESSEL_ALERT,
    zIndex: 989
  },
  [MonitorFishMap.MonitorFishLayer.VESSEL_BEACON_MALFUNCTION]: {
    code: MonitorFishMap.MonitorFishLayer.VESSEL_BEACON_MALFUNCTION,
    type: LayerType.VESSEL_BEACON_MALFUNCTION,
    zIndex: 990
  },
  [MonitorFishMap.MonitorFishLayer.VESSEL_ALERT_AND_BEACON_MALFUNCTION]: {
    code: MonitorFishMap.MonitorFishLayer.VESSEL_ALERT_AND_BEACON_MALFUNCTION,
    type: LayerType.VESSEL_BEACON_MALFUNCTION,
    zIndex: 990
  },
  [MonitorFishMap.MonitorFishLayer.VESSELS_LABEL]: {
    code: MonitorFishMap.MonitorFishLayer.VESSELS_LABEL,
    type: LayerType.VESSEL,
    zIndex: 980
  },
  [MonitorFishMap.MonitorFishLayer.VESSEL_TRACK]: {
    code: MonitorFishMap.MonitorFishLayer.VESSEL_TRACK,
    type: LayerType.VESSEL,
    zIndex: 990
  },
  [MonitorFishMap.MonitorFishLayer.VESSEL_ESTIMATED_POSITION]: {
    code: MonitorFishMap.MonitorFishLayer.VESSEL_ESTIMATED_POSITION,
    type: LayerType.VESSEL,
    zIndex: 99
  },
  [MonitorFishMap.MonitorFishLayer.MEASUREMENT]: {
    code: MonitorFishMap.MonitorFishLayer.MEASUREMENT,
    type: LayerType.MEASUREMENT,
    zIndex: 1010
  },
  [MonitorFishMap.MonitorFishLayer.INTEREST_POINT]: {
    code: MonitorFishMap.MonitorFishLayer.INTEREST_POINT,
    type: LayerType.INTEREST_POINT,
    zIndex: 1020
  },
  [MonitorFishMap.MonitorFishLayer.REGULATORY]: {
    code: 'regulations',
    type: LayerType.REGULATORY
  },
  [MonitorFishMap.MonitorFishLayer.CUSTOM]: {
    code: MonitorFishMap.MonitorFishLayer.CUSTOM,
    name: 'Zone manuelle',
    type: LayerType.CUSTOM,
    zIndex: 1009,
    isIntersectable: true
  },
  [MonitorFishMap.MonitorFishLayer.REGULATORY_PREVIEW]: {
    code: 'regulatory_preview',
    type: LayerType.REGULATORY_PREVIEW
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

/**
 * /!\ Do not modify the code property : it is the Geoserver layer name, hence the name of the PostGIS table
 */
/* eslint-disable sort-keys-fix/sort-keys-fix */
export const AdminLayerProperties: Record<MonitorFishMap.AdminLayer, MonitorFishMap.AdminShowableLayer> = {
  [MonitorFishMap.AdminLayer.EEZ]: {
    code: 'eez_areas',
    name: AdministrativeAreaTypeLabel.EEZ_AREA,
    hasSearchableZones: true,
    zoneNamePropertyKey: 'union',
    isIntersectable: true
  },
  [MonitorFishMap.AdminLayer.FAO]: {
    code: 'fao_areas',
    name: AdministrativeAreaTypeLabel.FAO_AREA,
    hasSearchableZones: true,
    zoneNamePropertyKey: 'f_code',
    isIntersectable: true
  },
  [MonitorFishMap.AdminLayer.THREE_MILES]: {
    code: '3_miles_areas',
    name: '3 Milles'
  },
  [MonitorFishMap.AdminLayer.SIX_MILES]: {
    code: '6_miles_areas',
    name: '6 Milles'
  },
  [MonitorFishMap.AdminLayer.TWELVE_MILES]: {
    code: '12_miles_areas',
    name: '12 Milles'
  },
  [MonitorFishMap.AdminLayer.eaux_occidentales_australes]: {
    code: '1241_eaux_occidentales_australes_areas',
    name: 'Eaux occidentales australes',
    group: layersGroups.TWELVE_FORTY_ONE,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.eaux_occidentales_septentrionales]: {
    code: '1241_eaux_occidentales_septentrionales_areas',
    name: 'Eaux occidentales septentrionales',
    group: layersGroups.TWELVE_FORTY_ONE,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.eaux_union_dans_oi_et_atl_ouest]: {
    code: '1241_eaux_union_dans_oi_et_atl_ouest_areas',
    name: "Eaux de l'Union dans l'OI et l'Atl. ouest",
    group: layersGroups.TWELVE_FORTY_ONE,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.mer_baltique]: {
    code: '1241_mer_baltique_areas',
    name: 'Mer Baltique',
    group: layersGroups.TWELVE_FORTY_ONE,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.mer_du_nord]: {
    code: '1241_mer_du_nord_areas',
    name: 'Mer du Nord',
    group: layersGroups.TWELVE_FORTY_ONE,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.mer_mediterranee]: {
    code: '1241_mer_mediterranee_areas',
    name: 'Mer Méditerranée',
    group: layersGroups.TWELVE_FORTY_ONE,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.mer_noire]: {
    code: '1241_mer_noire_areas',
    name: 'Mer Noire',
    group: layersGroups.TWELVE_FORTY_ONE,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.mer_celtique]: {
    code: '1241_mer_celtique_areas',
    name: 'Mer Celtique',
    group: layersGroups.TWELVE_FORTY_ONE,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.cormoran]: {
    code: 'cormoran_areas',
    name: 'Zones Cormoran (NAMO-SA)',
    hasSearchableZones: true,
    zoneNamePropertyKey: 'zonex',
    isIntersectable: true
  },
  [MonitorFishMap.AdminLayer.AEM]: {
    code: 'aem_areas',
    name: 'Zones AEM (MED)',
    zoneNamePropertyKey: 'name'
  },
  [MonitorFishMap.AdminLayer.CCAMLR]: {
    code: 'fao_ccamlr_areas',
    name: 'CCAMLR',
    group: layersGroups.ORGP,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.ICCAT]: {
    code: 'fao_iccat_areas',
    name: 'ICCAT',
    group: layersGroups.ORGP,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.IOTC]: {
    code: 'fao_iotc_areas',
    name: 'IOTC',
    group: layersGroups.ORGP,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.NEAFC]: {
    code: 'neafc_regulatory_area',
    name: 'NEAFC',
    group: layersGroups.ORGP,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.NAFO]: {
    code: 'nafo_regulatory_area',
    name: 'NAFO',
    group: layersGroups.ORGP,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.SIOFA]: {
    code: 'fao_siofa_areas',
    name: 'SIOFA',
    group: layersGroups.ORGP,
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.rectangles_stat]: {
    code: 'rectangles_stat_areas',
    name: 'Rectangles statistiques',
    hasSearchableZones: true,
    zoneNamePropertyKey: 'icesname',
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.cgpm_areas]: {
    code: 'cgpm_areas',
    name: 'CGPM',
    group: layersGroups.ORGP,
    hasSearchableZones: true,
    zoneNamePropertyKey: 'SMU_CODE',
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.cgpm_statistical_rectangles_areas]: {
    code: 'cgpm_statistical_rectangles_areas',
    name: 'CGPM (Rectangles statistiques)',
    group: layersGroups.ORGP,
    hasSearchableZones: true,
    zoneNamePropertyKey: 'sect_cod',
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.effort_zones_areas]: {
    code: 'effort_zones_areas',
    name: "Zones d'effort",
    hasSearchableZones: true,
    zoneNamePropertyKey: 'zone',
    isIntersectable: false
  },
  [MonitorFishMap.AdminLayer.situations]: {
    code: 'situs_areas',
    name: 'Zones pour situation VMS',
    group: layersGroups.VMS_SITUATION,
    hasSearchableZones: true,
    hasFetchableZones: true,
    zoneNamePropertyKey: 'libelle',
    isIntersectable: true
  },
  [MonitorFishMap.AdminLayer.navigation_category_two]: {
    code: 'navigation_category_two_areas',
    name: '2ème',
    group: layersGroups.NAVIGATION_CATEGORY
  },
  [MonitorFishMap.AdminLayer.navigation_category_three]: {
    code: 'navigation_category_three_areas',
    name: '3ème',
    group: layersGroups.NAVIGATION_CATEGORY
  },
  [MonitorFishMap.AdminLayer.navigation_category_four]: {
    code: 'navigation_category_four_areas',
    name: '4ème',
    group: layersGroups.NAVIGATION_CATEGORY
  },
  [MonitorFishMap.AdminLayer.navigation_category_five]: {
    code: 'navigation_category_five_areas',
    name: '5ème',
    group: layersGroups.NAVIGATION_CATEGORY
  },
  [MonitorFishMap.AdminLayer.saltwater_limit]: {
    code: 'saltwater_limit_areas',
    name: 'Limites de salure des eaux',
    zoneNamePropertyKey: 'objnam'
  },
  [MonitorFishMap.AdminLayer.transversal_sea_limit]: {
    code: 'transversal_sea_limit_areas',
    name: 'Limites transversales de mer',
    zoneNamePropertyKey: 'objnam'
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const BaseLayer = {
  DARK: {
    code: 'DARK',
    text: 'Fond de carte sombre'
  },
  LIGHT: {
    code: 'LIGHT',
    text: 'Fond de carte clair'
  },
  OSM: {
    code: 'OSM',
    text: 'Open Street Map'
  },
  SATELLITE: {
    code: 'SATELLITE',
    text: 'Satellite'
  },
  SHOM: {
    code: 'SHOM',
    text: 'Carte marine (SHOM)'
  }
}
