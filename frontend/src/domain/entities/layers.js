/**
 *
 * @param {Object} layer
 * @param { String } layer.type
 * @param { String } layer.topic
 * @param { String } layer.zone
 * @returns String
 */
export const getLayerNameNormalized = layer => [layer.type, layer.topic, layer.zone].filter(Boolean).join(':')

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

export const layersType = {
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  BASE_LAYER: 'BASE_LAYER',
  FREE_DRAW: 'FREE_DRAW',
  INFRACTION_SUSPICION: 'INFRACTION_SUSPICION',
  MEASUREMENT: 'MEASUREMENT',
  REGULATORY: 'REGULATORY',
  VESSEL: 'VESSEL',
  VESSEL_ALERT: 'VESSEL_ALERT',
  VESSEL_ALERT_AND_BEACON_MALFUNCTION: 'VESSEL_ALERT_AND_BEACON_MALFUNCTION',
  VESSEL_BEACON_MALFUNCTION: 'VESSEL_BEACON_MALFUNCTION'
}

const Layers = {
  BASE_LAYER: {
    code: 'ol-layer',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: layersType.BASE_LAYER
  },
  FILTERED_VESSELS: {
    code: 'filtered_vessel',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: layersType.VESSEL,
    zIndex: 1000
  },
  MEASUREMENT: {
    code: 'measurement',
    group: null,
    containsMultipleZones: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.MEASUREMENT,
    isIntersectable: false,
    subZoneFieldKey: null,
    zIndex: 1010
  },
  INTEREST_POINT: {
    zIndex: 1020
  },
  SELECTED_VESSEL: {
    code: 'selected_vessel',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: layersType.VESSEL,
    zIndex: 995
  },
  EEZ: {
    code: 'eez_areas',
    group: null,
    containsMultipleZones: true,
    name: 'Zones ZEE',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: 'union'
  },
  VESSEL_ALERT: {
    code: 'vessel_alert',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: layersType.VESSEL_ALERT,
    zIndex: 990
  },
  FAO: {
    code: 'fao_areas',
    containsMultipleZones: true,
    group: null,
    name: 'Zones FAO / CIEM',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'f_division',
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    getZoneName: feature => {
      if (feature.get(Layers.FAO.subSubZoneFieldKey)) {
        return feature.get(Layers.FAO.subSubZoneFieldKey)
      }
      if (feature.get(Layers.FAO.subZoneFieldKey)) {
        return feature.get(Layers.FAO.subZoneFieldKey)
      } else if (feature.get(Layers.FAO.zoneFieldKey)) {
        return feature.get(Layers.FAO.zoneFieldKey)
      }

      return ''
    },
    zoneFieldKey: 'f_subarea',
    subSubZoneFieldKey: 'f_subdivis'
  },
  VESSEL_ALERT_AND_BEACON_MALFUNCTION: {
    code: 'vessel_alert_and_beacon_malfunction',
    containsMultipleZones: false,
    group: null,
    name: '',
    isIntersectable: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: layersType.VESSEL_BEACON_MALFUNCTION,
    zIndex: 990
  },
  eaux_occidentales_australes: {
    code: '1241_eaux_occidentales_australes_areas',
    group: layersGroups.TWELVE_FORTY_ONE,
    name: 'Eaux occidentales australes',
    containsMultipleZones: false,
    type: layersType.ADMINISTRATIVE,
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: true,
    subZoneFieldKey: null
  },
  VESSEL_BEACON_MALFUNCTION: {
    code: 'vessel_beacon_malfunction',
    containsMultipleZones: false,
    group: null,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    type: layersType.VESSEL_BEACON_MALFUNCTION,
    subZoneFieldKey: null,
    zIndex: 990
  },
  eaux_occidentales_septentrionales: {
    code: '1241_eaux_occidentales_septentrionales_areas',
    group: layersGroups.TWELVE_FORTY_ONE,
    containsMultipleZones: false,
    name: 'Eaux occidentales septentrionales',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: null
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
  eaux_union_dans_oi_et_atl_ouest: {
    code: '1241_eaux_union_dans_oi_et_atl_ouest_areas',
    containsMultipleZones: false,
    group: layersGroups.TWELVE_FORTY_ONE,
    name: "Eaux de l'Union dans l'OI et l'Atl. ouest",
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: true,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: null
  },
  mer_baltique: {
    code: '1241_mer_baltique_areas',
    containsMultipleZones: false,
    group: layersGroups.TWELVE_FORTY_ONE,
    name: 'Mer Baltique',
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: true,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: null
  },
  VESSEL_INFRACTION_SUSPICION: {
    code: 'vessel_infraction_suspicion',
    group: null,
    name: '',
    containsMultipleZones: false,
    type: layersType.VESSEL_ALERT,
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    subZoneFieldKey: null,
    zIndex: 989
  },
  cormoran: {
    code: 'cormoran_areas',
    group: null,
    name: 'Zones Cormoran (NAMO-SA)',
    containsMultipleZones: true,
    type: layersType.ADMINISTRATIVE,
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: true,
    subZoneFieldKey: 'zonex'
  },
  VESSEL_TRACK: {
    code: 'vessel_track',
    group: null,
    name: '',
    containsMultipleZones: false,
    type: layersType.VESSEL,
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    subZoneFieldKey: null,
    zIndex: 990
  },
  AEM: {
    code: 'aem_areas',
    group: null,
    containsMultipleZones: false,
    name: 'Zones AEM (MED)',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: false,
    subZoneFieldKey: 'name'
  },
  VESSELS_LABEL: {
    code: 'label',
    name: '',
    group: null,
    type: layersType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 980
  },
  CCAMLR: {
    code: 'fao_ccamlr_areas',
    containsMultipleZones: false,
    group: layersGroups.ORGP,
    name: 'CCAMLR',
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: true,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: null
  },
  VESSEL_ESTIMATED_POSITION: {
    code: 'estimated_position',
    name: '',
    group: null,
    type: layersType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 99
  },
  ICCAT: {
    code: 'fao_iccat_areas',
    containsMultipleZones: false,
    group: layersGroups.ORGP,
    name: 'ICCAT',
    isIntersectable: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: layersType.ADMINISTRATIVE
  },
  REGULATORY: {
    code: 'regulations',
    group: null,
    name: '',
    containsMultipleZones: false,
    type: layersType.REGULATORY,
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    subZoneFieldKey: null
  },
  IOTC: {
    code: 'fao_iotc_areas',
    containsMultipleZones: false,
    group: layersGroups.ORGP,
    isIntersectable: true,
    name: 'IOTC',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: layersType.ADMINISTRATIVE
  },
  SIX_MILES: {
    code: '6_miles_areas',
    group: null,
    name: '6 Milles',
    containsMultipleZones: false,
    type: layersType.ADMINISTRATIVE,
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    subZoneFieldKey: null
  },
  cgpm_areas: {
    code: 'cgpm_areas',
    group: layersGroups.ORGP,
    containsMultipleZones: true,
    name: 'CGPM',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: 'SMU_CODE'
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
  cgpm_statistical_rectangles_areas: {
    code: 'cgpm_statistical_rectangles_areas',
    containsMultipleZones: true,
    group: layersGroups.ORGP,
    name: 'CGPM (Rectangles statistiques)',
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: true,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: 'sect_cod'
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
  brexit: {
    code: 'brexit_areas',
    group: layersGroups.VMS_SITUATION_BREXIT,
    containsMultipleZones: true,
    name: 'Zones pour situation Brexit',
    showMultipleZonesInAdministrativeZones: true,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: 'nom'
  },
  effort_zones_areas: {
    code: 'effort_zones_areas',
    containsMultipleZones: true,
    group: null,
    name: "Zones d'effort",
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: true,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: 'zone'
  },
  mer_du_nord: {
    code: '1241_mer_du_nord_areas',
    group: layersGroups.TWELVE_FORTY_ONE,
    containsMultipleZones: false,
    name: 'Mer du Nord',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: null
  },
  mer_mediterranee: {
    code: '1241_mer_mediterranee_areas',
    group: layersGroups.TWELVE_FORTY_ONE,
    containsMultipleZones: false,
    name: 'Mer Méditerranée',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: null
  },
  mer_noire: {
    code: '1241_mer_noire_areas',
    group: layersGroups.TWELVE_FORTY_ONE,
    containsMultipleZones: false,
    name: 'Mer Noire',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: null
  },
  NAFO: {
    code: 'nafo_regulatory_area',
    containsMultipleZones: false,
    group: layersGroups.ORGP,
    isIntersectable: true,
    name: 'NAFO',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: layersType.ADMINISTRATIVE
  },
  navigation_category_five: {
    code: 'navigation_category_five_areas',
    containsMultipleZones: false,
    group: layersGroups.NAVIGATION_CATEGORY,
    name: '5ème',
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: null
  },
  navigation_category_four: {
    code: 'navigation_category_four_areas',
    containsMultipleZones: false,
    group: layersGroups.NAVIGATION_CATEGORY,
    name: '4ème',
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: null
  },
  navigation_category_three: {
    code: 'navigation_category_three_areas',
    containsMultipleZones: false,
    group: layersGroups.NAVIGATION_CATEGORY,
    name: '3ème',
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: null
  },
  navigation_category_two: {
    code: 'navigation_category_two_areas',
    containsMultipleZones: false,
    group: layersGroups.NAVIGATION_CATEGORY,
    name: '2ème',
    showMultipleZonesInAdministrativeZones: false,
    isIntersectable: false,
    type: layersType.ADMINISTRATIVE,
    subZoneFieldKey: null
  },
  NEAFC: {
    code: 'neafc_regulatory_area',
    group: layersGroups.ORGP,
    containsMultipleZones: false,
    name: 'NEAFC',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: null
  },
  rectangles_stat: {
    code: 'rectangles_stat_areas',
    group: null,
    containsMultipleZones: true,
    name: 'Rectangles statistiques',
    showMultipleZonesInAdministrativeZones: false,
    type: layersType.ADMINISTRATIVE,
    isIntersectable: true,
    subZoneFieldKey: 'icesname'
  },
  REGULATORY_PREVIEW: {
    code: 'regulatory_preview',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: '',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    type: null
  },
  saltwater_limit: {
    code: 'saltwater_limit_areas',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: 'Limites de salure des eaux',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'objnam',
    type: layersType.ADMINISTRATIVE
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
  situations: {
    code: 'situs_areas',
    containsMultipleZones: true,
    group: layersGroups.VMS_SITUATION,
    name: 'Zones pour situation VMS',
    isIntersectable: true,
    showMultipleZonesInAdministrativeZones: true,
    subZoneFieldKey: 'libelle',
    type: layersType.ADMINISTRATIVE
  },
  transversal_sea_limit: {
    code: 'transversal_sea_limit_areas',
    containsMultipleZones: false,
    group: null,
    isIntersectable: false,
    name: 'Limites transversales de mer',
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'objnam',
    type: layersType.ADMINISTRATIVE
  }
}

export const baseLayers = {
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
  SCAN_LITTORAL: {
    code: 'SCAN_LITTORAL',
    text: 'Terre/Mer Littoral (IGN/SHOM)'
  },
  SHOM: {
    code: 'SHOM',
    text: 'Carte marine (SHOM)'
  }
}

function removeMiscellaneousGears(layerGearsArray) {
  return layerGearsArray.filter(gearCode => gearCode !== 'MIS').map(gearCode => gearCode)
}

function removeVariousLonglineGears(layerGearsArray) {
  return layerGearsArray.filter(gearCode => gearCode !== 'LL').map(gearCode => gearCode)
}

export function getGearCategory(layerGears, gears) {
  if (layerGears?.authorized) {
    if (
      layerGears?.authorized.regulatedGearCategories &&
      Object.keys(layerGears?.authorized.regulatedGearCategories).length
    ) {
      return Object.keys(layerGears?.authorized.regulatedGearCategories)[0]
    }
    if (layerGears?.authorized.regulatedGears?.length) {
      let layerGearsArray = layerGears?.authorized.regulatedGears
      if (layerGearsArray.length > 1) {
        layerGearsArray = removeMiscellaneousGears(layerGearsArray)
      }
      if (layerGearsArray.length > 1) {
        layerGearsArray = removeVariousLonglineGears(layerGearsArray)
      }

      const gear = gears.find(_gear => layerGearsArray.some(gearCode => gearCode === _gear.code))

      return gear ? gear.category : null
    }
  }

  return null
}

export const SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY = 'selectedRegulatoryZoneIds'
export const SELECTED_REG_ZONES_LOCAL_STORAGE_KEY = 'selectedRegulatoryZones'

export const reOrderOldObjectHierarchyIfFound = layers => {
  layers.forEach(layer => {
    layers[layer] = layers[layer].map(zone => {
      if (zone && zone.layerName) {
        return {
          topic: zone.layerName,
          ...zone
        }
      }

      return zone
    })
  })

  return layers
}

export default Layers
