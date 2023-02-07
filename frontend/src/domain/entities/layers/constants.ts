export const layersGroups = {
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
    code: 'vms_situation',
    name: 'Zones pour situation VMS'
  },
  VMS_SITUATION_BREXIT: {
    code: 'vms_situation_brexit',
    name: 'Zones pour situation VMS Brexit'
  }
}

export enum LayerType {
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  BASE_LAYER = 'BASE_LAYER',
  DRAW = 'DRAW',
  FREE_DRAW = 'FREE_DRAW',
  INFRACTION_SUSPICION = 'INFRACTION_SUSPICION',
  MEASUREMENT = 'MEASUREMENT',
  REGULATORY = 'REGULATORY',
  VESSEL = 'VESSEL',
  VESSEL_ALERT = 'VESSEL_ALERT',
  VESSEL_ALERT_AND_BEACON_MALFUNCTION = 'VESSEL_ALERT_AND_BEACON_MALFUNCTION',
  VESSEL_BEACON_MALFUNCTION = 'VESSEL_BEACON_MALFUNCTION'
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const Layer = {
  BASE_LAYER: {
    code: 'ol-layer',
    name: '',
    group: null,
    type: LayerType.BASE_LAYER,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  VESSELS: {
    code: 'vessels',
    name: '',
    group: null,
    type: LayerType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 1000
  },
  SELECTED_VESSEL: {
    code: 'selected_vessel',
    name: '',
    group: null,
    type: LayerType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 995
  },
  DRAW: {
    code: 'draw',
    name: '',
    group: null,
    type: LayerType.DRAW,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 999
  },
  FILTERED_VESSELS: {
    code: 'filtered_vessel',
    name: '',
    group: null,
    type: LayerType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 1000
  },
  VESSEL_ALERT: {
    code: 'vessel_alert',
    name: '',
    group: null,
    type: LayerType.VESSEL_ALERT,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 990
  },
  VESSEL_INFRACTION_SUSPICION: {
    code: 'vessel_infraction_suspicion',
    name: '',
    group: null,
    type: LayerType.VESSEL_ALERT,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 989
  },
  VESSEL_BEACON_MALFUNCTION: {
    code: 'vessel_beacon_malfunction',
    name: '',
    group: null,
    type: LayerType.VESSEL_BEACON_MALFUNCTION,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 990
  },
  VESSEL_ALERT_AND_BEACON_MALFUNCTION: {
    code: 'vessel_alert_and_beacon_malfunction',
    name: '',
    group: null,
    type: LayerType.VESSEL_BEACON_MALFUNCTION,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 990
  },
  VESSELS_LABEL: {
    code: 'label',
    name: '',
    group: null,
    type: LayerType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 980
  },
  VESSEL_TRACK: {
    code: 'vessel_track',
    name: '',
    group: null,
    type: LayerType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 990
  },
  VESSEL_ESTIMATED_POSITION: {
    code: 'estimated_position',
    name: '',
    group: null,
    type: LayerType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 99
  },
  MEASUREMENT: {
    code: 'measurement',
    name: '',
    group: null,
    type: LayerType.MEASUREMENT,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 1010
  },
  INTEREST_POINT: {
    zIndex: 1020
  },
  REGULATORY: {
    code: 'regulations',
    name: '',
    group: null,
    type: LayerType.REGULATORY,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  EEZ: {
    code: 'eez_areas',
    name: 'Zones ZEE',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'union',
    isIntersectable: true
  },
  FAO: {
    code: 'fao_areas',
    name: 'Zones FAO / CIEM',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    zoneFieldKey: 'f_subarea',
    subZoneFieldKey: 'f_division',
    subSubZoneFieldKey: 'f_subdivis',
    isIntersectable: true,
    getZoneName: feature => {
      if (feature.get(Layer.FAO.subSubZoneFieldKey)) {
        return feature.get(Layer.FAO.subSubZoneFieldKey)
      }
      if (feature.get(Layer.FAO.subZoneFieldKey)) {
        return feature.get(Layer.FAO.subZoneFieldKey)
      }
      if (feature.get(Layer.FAO.zoneFieldKey)) {
        return feature.get(Layer.FAO.zoneFieldKey)
      }

      return ''
    }
  },
  THREE_MILES: {
    code: '3_miles_areas',
    name: '3 Milles',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  SIX_MILES: {
    code: '6_miles_areas',
    name: '6 Milles',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  TWELVE_MILES: {
    code: '12_miles_areas',
    name: '12 Milles',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  eaux_occidentales_australes: {
    code: '1241_eaux_occidentales_australes_areas',
    name: 'Eaux occidentales australes',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  eaux_occidentales_septentrionales: {
    code: '1241_eaux_occidentales_septentrionales_areas',
    name: 'Eaux occidentales septentrionales',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  eaux_union_dans_oi_et_atl_ouest: {
    code: '1241_eaux_union_dans_oi_et_atl_ouest_areas',
    name: "Eaux de l'Union dans l'OI et l'Atl. ouest",
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  mer_baltique: {
    code: '1241_mer_baltique_areas',
    name: 'Mer Baltique',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  mer_du_nord: {
    code: '1241_mer_du_nord_areas',
    name: 'Mer du Nord',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  mer_mediterranee: {
    code: '1241_mer_mediterranee_areas',
    name: 'Mer Méditerranée',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  mer_noire: {
    code: '1241_mer_noire_areas',
    name: 'Mer Noire',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  cormoran: {
    code: 'cormoran_areas',
    name: 'Zones Cormoran (NAMO-SA)',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'zonex',
    isIntersectable: true
  },
  AEM: {
    code: 'aem_areas',
    name: 'Zones AEM (MED)',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'name',
    isIntersectable: false
  },
  CCAMLR: {
    code: 'fao_ccamlr_areas',
    name: 'CCAMLR',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  ICCAT: {
    code: 'fao_iccat_areas',
    name: 'ICCAT',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  IOTC: {
    code: 'fao_iotc_areas',
    name: 'IOTC',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  NEAFC: {
    code: 'neafc_regulatory_area',
    name: 'NEAFC',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  NAFO: {
    code: 'nafo_regulatory_area',
    name: 'NAFO',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  SIOFA: {
    code: 'fao_siofa_areas',
    name: 'SIOFA',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  rectangles_stat: {
    code: 'rectangles_stat_areas',
    name: 'Rectangles statistiques',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'icesname',
    isIntersectable: true
  },
  cgpm_areas: {
    code: 'cgpm_areas',
    name: 'CGPM',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'SMU_CODE',
    isIntersectable: true
  },
  cgpm_statistical_rectangles_areas: {
    code: 'cgpm_statistical_rectangles_areas',
    name: 'CGPM (Rectangles statistiques)',
    group: layersGroups.ORGP,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'sect_cod',
    isIntersectable: true
  },
  effort_zones_areas: {
    code: 'effort_zones_areas',
    name: "Zones d'effort",
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'zone',
    isIntersectable: true
  },
  situations: {
    code: 'situs_areas',
    name: 'Zones pour situation VMS',
    group: layersGroups.VMS_SITUATION,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: true,
    subZoneFieldKey: 'libelle',
    isIntersectable: true
  },
  brexit: {
    code: 'brexit_areas',
    name: 'Zones pour situation Brexit',
    group: layersGroups.VMS_SITUATION_BREXIT,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: true,
    subZoneFieldKey: 'nom',
    isIntersectable: true
  },
  REGULATORY_PREVIEW: {
    code: 'regulatory_preview',
    name: '',
    group: null,
    type: null,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  navigation_category_two: {
    code: 'navigation_category_two_areas',
    name: '2ème',
    group: layersGroups.NAVIGATION_CATEGORY,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  navigation_category_three: {
    code: 'navigation_category_three_areas',
    name: '3ème',
    group: layersGroups.NAVIGATION_CATEGORY,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  navigation_category_four: {
    code: 'navigation_category_four_areas',
    name: '4ème',
    group: layersGroups.NAVIGATION_CATEGORY,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  navigation_category_five: {
    code: 'navigation_category_five_areas',
    name: '5ème',
    group: layersGroups.NAVIGATION_CATEGORY,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  saltwater_limit: {
    code: 'saltwater_limit_areas',
    name: 'Limites de salure des eaux',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'objnam',
    isIntersectable: false
  },
  transversal_sea_limit: {
    code: 'transversal_sea_limit_areas',
    name: 'Limites transversales de mer',
    group: null,
    type: LayerType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'objnam',
    isIntersectable: false
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
