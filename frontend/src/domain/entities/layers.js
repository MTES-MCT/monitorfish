/**
 *
 * @param {Object} layer
 * @param { String } layer.type
 * @param { String } layer.topic
 * @param { String } layer.zone
 * @returns String
 */
export const getLayerNameNormalized = (layer) => {
  return [layer.type, layer.topic, layer.zone].filter(Boolean).join(':')
}

export const layersGroups = {
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
  },
  ORGP: {
    code: 'orgp',
    name: 'Zones ORGP'
  }
}

export const layersType = {
  VESSEL: 'VESSEL',
  VESSEL_ALERT: 'VESSEL_ALERT',
  VESSEL_BEACON_MALFUNCTION: 'VESSEL_BEACON_MALFUNCTION',
  VESSEL_ALERT_AND_BEACON_MALFUNCTION: 'VESSEL_ALERT_AND_BEACON_MALFUNCTION',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  REGULATORY: 'REGULATORY',
  BASE_LAYER: 'BASE_LAYER',
  FREE_DRAW: 'FREE_DRAW',
  MEASUREMENT: 'MEASUREMENT'
}

const Layers = {
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
  SELECTED_VESSEL: {
    code: 'selected_vessel',
    name: '',
    group: null,
    type: layersType.VESSEL,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 995
  },
  FILTERED_VESSELS: {
    code: 'filtered_vessel',
    name: '',
    group: null,
    type: layersType.VESSEL,
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
    type: layersType.VESSEL_ALERT,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: null,
    isIntersectable: false,
    zIndex: 990
  },
  VESSEL_BEACON_MALFUNCTION: {
    code: 'vessel_beacon_malfunction',
    name: '',
    group: null,
    type: layersType.VESSEL_BEACON_MALFUNCTION,
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
    type: layersType.VESSEL_BEACON_MALFUNCTION,
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
    type: layersType.VESSEL,
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
    type: layersType.VESSEL,
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
    type: layersType.VESSEL,
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
    type: layersType.MEASUREMENT,
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
    name: 'Zones FAO / CIEM',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    zoneFieldKey: 'f_subarea',
    subZoneFieldKey: 'f_division',
    subSubZoneFieldKey: 'f_subdivis',
    isIntersectable: true,
    getZoneName: feature => {
      if (feature.get(Layers.FAO.subSubZoneFieldKey)) {
        return feature.get(Layers.FAO.subSubZoneFieldKey)
      } else if (feature.get(Layers.FAO.subZoneFieldKey)) {
        return feature.get(Layers.FAO.subZoneFieldKey)
      } else if (feature.get(Layers.FAO.zoneFieldKey)) {
        return feature.get(Layers.FAO.zoneFieldKey)
      }

      return ''
    }
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
    name: 'Zones Cormoran (NAMO-SA)',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'zonex',
    isIntersectable: true
  },
  AEM: {
    code: 'aem_areas',
    name: 'Zones AEM (MED)',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: false,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'name',
    isIntersectable: false
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
    name: 'Rectangles statistiques',
    group: null,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'icesname',
    isIntersectable: true
  },
  cgpm_areas: {
    code: 'cgpm_areas',
    name: 'Zones CGPM',
    group: layersGroups.ORGP,
    type: layersType.ADMINISTRATIVE,
    containsMultipleZones: true,
    showMultipleZonesInAdministrativeZones: false,
    subZoneFieldKey: 'SMU_CODE',
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
  }
}

export const baseLayers = {
  LIGHT: {
    code: 'LIGHT',
    text: 'Fond de carte clair'
  },
  OSM: {
    code: 'OSM',
    text: 'Open Street Map'
  },
  SHOM: {
    code: 'SHOM',
    text: 'Carte marine (SHOM)'
  },
  SATELLITE: {
    code: 'SATELLITE',
    text: 'Satellite'
  },
  DARK: {
    code: 'DARK',
    text: 'Fond de carte sombre'
  }
}

function removeMiscellaneousGears (layerGearsArray) {
  return layerGearsArray
    .filter(gearCode => gearCode !== 'MIS')
    .map(gearCode => gearCode)
}

function removeVariousLonglineGears (layerGearsArray) {
  return layerGearsArray
    .filter(gearCode => gearCode !== 'LL')
    .map(gearCode => gearCode)
}

export function getGearCategory (layerGears, gears) {
  if (layerGears) {
    if (layerGears.regulatedGearCategories && Object.keys(layerGears.regulatedGearCategories).length) {
      return Object.keys(layerGears.regulatedGearCategories)[0]
    } else if (layerGears.regulatedGears?.length) {
      let layerGearsArray = layerGears.regulatedGears
      if (layerGearsArray.length > 1) {
        layerGearsArray = removeMiscellaneousGears(layerGearsArray)
      }
      if (layerGearsArray.length > 1) {
        layerGearsArray = removeVariousLonglineGears(layerGearsArray)
      }

      const gear = gears
        .find(_gear => {
          return layerGearsArray
            .some(gearCode => {
              return gearCode === _gear.code
            })
        })
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
