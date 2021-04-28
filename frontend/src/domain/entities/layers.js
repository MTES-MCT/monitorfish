export const layersGroups = {
  TWELVE_FORTY_ONE: {
    code: 'twelve_forty_one',
    name: '1241'
  },
  VMS_SITUATION: {
    code: 'vms_situation',
    name: 'Zones pour situation VMS'
  },
  VMS_SITUATION_BREXIT: {
    code: 'vms_situation_brexit',
    name: 'Zones pour situation VMS Brexit'
  },
  ORGP: {
    code: 'orgp',
    name: 'ORGP'
  }
}

export const layersType = {
  VESSEL: 'VESSEL',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  REGULATORY: 'REGULATORY',
  BASE_LAYER: 'BASE_LAYER',
  FREE_DRAW: 'FREE_DRAW'
}

export default {
  BASE_LAYER: {
    code: 'ol-layer',
    name: '',
    group: null,
    type: layersType.BASE_LAYER,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  VESSELS: {
    code: 'vessels',
    name: '',
    group: null,
    type: layersType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 1000
  },
  VESSEL_TRACK: {
    code: 'vessel_track',
    name: '',
    group: null,
    type: layersType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 999
  },
  REGULATORY: {
    code: 'regulatory_areas',
    name: '',
    group: null,
    type: layersType.REGULATORY,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  EEZ: {
    code: 'eez_areas',
    name: 'Zones ZEE',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'union',
    isIntersectable: true
  },
  FAO: {
    code: 'fao_areas',
    name: 'Zones FAO/CIEM',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'f_division',
    subSubZoneFieldKey: 'f_subdivis',
    isIntersectable: true
  },
  AEM: {
    code: 'aem_areas',
    name: 'Zones AEM',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'name',
    isIntersectable: false
  },
  THREE_MILES: {
    code: '3_miles_areas',
    name: '3 Milles',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  SIX_MILES: {
    code: '6_miles_areas',
    name: '6 Milles',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  TWELVE_MILES: {
    code: '12_miles_areas',
    name: '12 Milles',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false
  },
  eaux_occidentales_australes: {
    code: '1241_eaux_occidentales_australes_areas',
    name: 'Eaux occidentales australes',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  eaux_occidentales_septentrionales: {
    code: '1241_eaux_occidentales_septentrionales_areas',
    name: 'Eaux occidentales septentrionales',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  eaux_union_dans_oi_et_atl_ouest: {
    code: '1241_eaux_union_dans_oi_et_atl_ouest_areas',
    name: 'Eaux de l\'Union dans l\'OI et l\'Atl. ouest',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  mer_baltique: {
    code: '1241_mer_baltique_areas',
    name: 'Mer Baltique',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  mer_du_nord: {
    code: '1241_mer_du_nord_areas',
    name: 'Mer du Nord',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  mer_mediterranee: {
    code: '1241_mer_mediterranee_areas',
    name: 'Mer Méditerranée',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  mer_noire: {
    code: '1241_mer_noire_areas',
    name: 'Mer Noire',
    group: layersGroups.TWELVE_FORTY_ONE,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  cormoran: {
    code: 'cormoran_areas',
    name: 'Cormoran',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'zonex',
    isIntersectable: true
  },
  CCAMLR: {
    code: 'fao_ccamlr_areas',
    name: 'CCAMLR',
    group: layersGroups.ORGP,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  ICCAT: {
    code: 'fao_iccat_areas',
    name: 'ICCAT',
    group: layersGroups.ORGP,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  IOTC: {
    code: 'fao_iotc_areas',
    name: 'IOTC',
    group: layersGroups.ORGP,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  NEAFC: {
    code: 'fao_neafc_areas',
    name: 'NEAFC',
    group: layersGroups.ORGP,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  SIOFA: {
    code: 'fao_siofa_areas',
    name: 'SIOFA',
    group: layersGroups.ORGP,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: true
  },
  rectangles_stat: {
    code: 'rectangles_stat_areas',
    name: 'Rectangles stat',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'icesname',
    isIntersectable: true
  },
  situations: {
    code: 'situs_areas',
    name: 'Zones pour situation VMS',
    group: layersGroups.VMS_SITUATION,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: true,
    subZoneFieldKey: 'libelle',
    isIntersectable: true
  },
  brexit: {
    code: 'brexit_areas',
    name: 'Zones pour situation Brexit',
    group: layersGroups.VMS_SITUATION_BREXIT,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: true,
    subZoneFieldKey: 'nom',
    isIntersectable: true
  }
}

export const baseLayers = {
  OSM: {
    code: 'OSM',
    text: 'Open Street Map'
  },
  SATELLITE: {
    code: 'SATELLITE',
    text: 'Satellite'
  },
  LIGHT: {
    code: 'LIGHT',
    text: 'Fond de carte clair'
  },
  DARK: {
    code: 'DARK',
    text: 'Fond de carte sombre'
  }
}

export const vesselIconIsLight = selectedBaseLayer => selectedBaseLayer === baseLayers.DARK.code ||
    selectedBaseLayer === baseLayers.SATELLITE.code
