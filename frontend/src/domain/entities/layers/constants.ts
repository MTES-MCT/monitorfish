import { MonitorFishLayer } from './types'

import type { CodeAndName, ShowableLayer } from './types'

export const layersGroups: Record<string, CodeAndName> = {
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
  },
  VMS_SITUATION_BREXIT: {
    code: 'brexit_areas',
    name: 'Zones pour situation VMS Brexit'
  }
}

export enum LayerType {
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  BASE_LAYER = 'BASE_LAYER',
  DRAW = 'DRAW',
  FREE_DRAW = 'FREE_DRAW',
  INFRACTION_SUSPICION = 'INFRACTION_SUSPICION',
  INTEREST_POINT = 'INTEREST_POINT',
  MEASUREMENT = 'MEASUREMENT',
  MISSION = 'MISSION',
  REGULATORY = 'REGULATORY',
  REGULATORY_PREVIEW = 'REGULATORY_PREVIEW',
  VESSEL = 'VESSEL',
  VESSEL_ALERT = 'VESSEL_ALERT',
  VESSEL_ALERT_AND_BEACON_MALFUNCTION = 'VESSEL_ALERT_AND_BEACON_MALFUNCTION',
  VESSEL_BEACON_MALFUNCTION = 'VESSEL_BEACON_MALFUNCTION'
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const LayerProperties: Record<MonitorFishLayer, ShowableLayer> = {
  BASE_LAYER: {
    code: 'ol-layer',
    type: LayerType.BASE_LAYER
  },
  VESSELS: {
    code: MonitorFishLayer.VESSELS,
    type: LayerType.VESSEL,
    zIndex: 1000,
    isClickable: true,
    isHoverable: true
  },
  MISSION_PIN_POINT: {
    code: MonitorFishLayer.MISSION,
    type: LayerType.MISSION,
    zIndex: 970,
    isClickable: true,
    isHoverable: true
  },
  MISSION_HOVER: {
    code: MonitorFishLayer.MISSION_HOVER,
    type: LayerType.MISSION,
    zIndex: 80
  },
  MISSION_SELECTED: {
    code: MonitorFishLayer.MISSION_SELECTED,
    type: LayerType.MISSION,
    zIndex: 81
  },
  MISSION_ACTION_SELECTED: {
    code: MonitorFishLayer.MISSION_ACTION_SELECTED,
    type: LayerType.MISSION,
    zIndex: 82,
    isClickable: true,
    isHoverable: true
  },
  MISSIONS_LABEL: {
    code: MonitorFishLayer.MISSIONS_LABEL,
    type: LayerType.MISSION,
    zIndex: 980
  },
  SELECTED_VESSEL: {
    code: MonitorFishLayer.SELECTED_VESSEL,
    type: LayerType.VESSEL,
    zIndex: 995,
    isClickable: true,
    isHoverable: true
  },
  DRAW: {
    code: MonitorFishLayer.DRAW,
    type: LayerType.DRAW,
    zIndex: 999
  },
  FILTERED_VESSELS: {
    code: MonitorFishLayer.FILTERED_VESSELS,
    type: LayerType.VESSEL,
    zIndex: 1000,
    isClickable: true,
    isHoverable: true
  },
  VESSEL_ALERT: {
    code: MonitorFishLayer.VESSEL_ALERT,
    type: LayerType.VESSEL_ALERT,
    zIndex: 990
  },
  VESSEL_INFRACTION_SUSPICION: {
    code: MonitorFishLayer.VESSEL_INFRACTION_SUSPICION,
    type: LayerType.VESSEL_ALERT,
    zIndex: 989
  },
  VESSEL_BEACON_MALFUNCTION: {
    code: MonitorFishLayer.VESSEL_BEACON_MALFUNCTION,
    type: LayerType.VESSEL_BEACON_MALFUNCTION,
    zIndex: 990
  },
  VESSEL_ALERT_AND_BEACON_MALFUNCTION: {
    code: MonitorFishLayer.VESSEL_ALERT_AND_BEACON_MALFUNCTION,
    type: LayerType.VESSEL_BEACON_MALFUNCTION,
    zIndex: 990
  },
  VESSELS_LABEL: {
    code: MonitorFishLayer.VESSELS_LABEL,
    type: LayerType.VESSEL,
    zIndex: 980
  },
  VESSEL_TRACK: {
    code: MonitorFishLayer.VESSEL_TRACK,
    type: LayerType.VESSEL,
    zIndex: 990,
    isClickable: true,
    isHoverable: true
  },
  VESSEL_ESTIMATED_POSITION: {
    code: MonitorFishLayer.VESSEL_ESTIMATED_POSITION,
    type: LayerType.VESSEL,
    zIndex: 99,
    isHoverable: true
  },
  MEASUREMENT: {
    code: MonitorFishLayer.MEASUREMENT,
    type: LayerType.MEASUREMENT,
    zIndex: 1010
  },
  INTEREST_POINT: {
    code: MonitorFishLayer.INTEREST_POINT,
    type: LayerType.INTEREST_POINT,
    zIndex: 1020
  },
  REGULATORY: {
    code: MonitorFishLayer.REGULATORY,
    type: LayerType.REGULATORY,
    isClickable: true,
    isHoverable: true
  },
  EEZ: {
    code: MonitorFishLayer.EEZ,
    name: 'Zones ZEE',
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    subZoneFieldKey: 'union',
    isIntersectable: true
  },
  FAO: {
    code: MonitorFishLayer.FAO,
    name: 'Zones FAO / CIEM',
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    zoneFieldKey: 'f_subarea',
    subZoneFieldKey: 'f_division',
    subSubZoneFieldKey: 'f_subdivis',
    isIntersectable: true,
    getZoneName: feature => {
      if (!LayerProperties.FAO) {
        return ''
      }

      if (feature.get(LayerProperties.FAO.subSubZoneFieldKey)) {
        return feature.get(LayerProperties.FAO.subSubZoneFieldKey)
      }
      if (feature.get(LayerProperties.FAO.subZoneFieldKey)) {
        return feature.get(LayerProperties.FAO.subZoneFieldKey)
      }
      if (feature.get(LayerProperties.FAO.zoneFieldKey)) {
        return feature.get(LayerProperties.FAO.zoneFieldKey)
      }

      return ''
    }
  },
  THREE_MILES: {
    code: MonitorFishLayer.THREE_MILES,
    name: '3 Milles',
    type: LayerType.ADMINISTRATIVE
  },
  SIX_MILES: {
    code: MonitorFishLayer.SIX_MILES,
    name: '6 Milles',
    type: LayerType.ADMINISTRATIVE
  },
  TWELVE_MILES: {
    code: MonitorFishLayer.TWELVE_MILES,
    name: '12 Milles',
    type: LayerType.ADMINISTRATIVE
  },
  eaux_occidentales_australes: {
    code: MonitorFishLayer.eaux_occidentales_australes,
    name: 'Eaux occidentales australes',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  eaux_occidentales_septentrionales: {
    code: MonitorFishLayer.eaux_occidentales_septentrionales,
    name: 'Eaux occidentales septentrionales',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  eaux_union_dans_oi_et_atl_ouest: {
    code: MonitorFishLayer.eaux_union_dans_oi_et_atl_ouest,
    name: "Eaux de l'Union dans l'OI et l'Atl. ouest",
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  mer_baltique: {
    code: MonitorFishLayer.mer_baltique,
    name: 'Mer Baltique',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  mer_du_nord: {
    code: MonitorFishLayer.mer_du_nord,
    name: 'Mer du Nord',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  mer_mediterranee: {
    code: MonitorFishLayer.mer_mediterranee,
    name: 'Mer Méditerranée',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  mer_noire: {
    code: MonitorFishLayer.mer_noire,
    name: 'Mer Noire',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  cormoran: {
    code: MonitorFishLayer.cormoran,
    name: 'Zones Cormoran (NAMO-SA)',
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    subZoneFieldKey: 'zonex',
    isIntersectable: true
  },
  AEM: {
    code: MonitorFishLayer.AEM,
    name: 'Zones AEM (MED)',
    type: LayerType.ADMINISTRATIVE,
    subZoneFieldKey: 'name'
  },
  CCAMLR: {
    code: MonitorFishLayer.CCAMLR,
    name: 'CCAMLR',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  ICCAT: {
    code: MonitorFishLayer.ICCAT,
    name: 'ICCAT',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  IOTC: {
    code: MonitorFishLayer.IOTC,
    name: 'IOTC',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  NEAFC: {
    code: MonitorFishLayer.NEAFC,
    name: 'NEAFC',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  NAFO: {
    code: MonitorFishLayer.NAFO,
    name: 'NAFO',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  SIOFA: {
    code: MonitorFishLayer.SIOFA,
    name: 'SIOFA',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    isIntersectable: true
  },
  rectangles_stat: {
    code: MonitorFishLayer.rectangles_stat,
    name: 'Rectangles statistiques',
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    subZoneFieldKey: 'icesname',
    isIntersectable: true
  },
  cgpm_areas: {
    code: MonitorFishLayer.cgpm_areas,
    name: 'CGPM',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    subZoneFieldKey: 'SMU_CODE',
    isIntersectable: true
  },
  cgpm_statistical_rectangles_areas: {
    code: MonitorFishLayer.cgpm_statistical_rectangles_areas,
    name: 'CGPM (Rectangles statistiques)',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    subZoneFieldKey: 'sect_cod',
    isIntersectable: true
  },
  effort_zones_areas: {
    code: MonitorFishLayer.effort_zones_areas,
    name: "Zones d'effort",
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    subZoneFieldKey: 'zone',
    isIntersectable: true
  },
  situations: {
    code: MonitorFishLayer.situations,
    name: 'Zones pour situation VMS',
    group: layersGroups.VMS_SITUATION,
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    hasFetchableZones: true,
    subZoneFieldKey: 'libelle',
    isIntersectable: true
  },
  brexit: {
    code: MonitorFishLayer.brexit,
    name: 'Zones pour situation Brexit',
    group: layersGroups.VMS_SITUATION_BREXIT,
    type: LayerType.ADMINISTRATIVE,
    hasSearchableZones: true,
    hasFetchableZones: true,
    subZoneFieldKey: 'nom',
    isIntersectable: true
  },
  REGULATORY_PREVIEW: {
    code: MonitorFishLayer.REGULATORY_PREVIEW,
    type: LayerType.REGULATORY_PREVIEW
  },
  navigation_category_two: {
    code: MonitorFishLayer.navigation_category_two,
    name: '2ème',
    group: layersGroups.NAVIGATION_CATEGORY,
    type: LayerType.ADMINISTRATIVE
  },
  navigation_category_three: {
    code: MonitorFishLayer.navigation_category_three,
    name: '3ème',
    group: layersGroups.NAVIGATION_CATEGORY,
    type: LayerType.ADMINISTRATIVE
  },
  navigation_category_four: {
    code: MonitorFishLayer.navigation_category_four,
    name: '4ème',
    group: layersGroups.NAVIGATION_CATEGORY,
    type: LayerType.ADMINISTRATIVE
  },
  navigation_category_five: {
    code: MonitorFishLayer.navigation_category_five,
    name: '5ème',
    group: layersGroups.NAVIGATION_CATEGORY,
    type: LayerType.ADMINISTRATIVE
  },
  saltwater_limit: {
    code: MonitorFishLayer.saltwater_limit,
    name: 'Limites de salure des eaux',
    type: LayerType.ADMINISTRATIVE,
    subZoneFieldKey: 'objnam'
  },
  transversal_sea_limit: {
    code: MonitorFishLayer.transversal_sea_limit,
    name: 'Limites transversales de mer',
    type: LayerType.ADMINISTRATIVE,
    subZoneFieldKey: 'objnam'
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const BaseLayers = {
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

export const SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY = 'selectedRegulatoryZoneIds'
export const SELECTED_REG_ZONES_LOCAL_STORAGE_KEY = 'selectedRegulatoryZones'
