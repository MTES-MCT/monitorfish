export const layersGroups = {
    TWELVE_FORTY_ONE: {
        code: "twelve_forty_one",
        name: "1241"
    },
    VMS_SITUATION: {
        code: "vms_situation",
        name: "Situation VMS"
    },
    ORGP: {
        code: "orgp",
        name: "ORGP"
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
        subZoneFieldKey: null
    },
    VESSELS: {
        code: 'vessels',
        name: '',
        group: null,
        type: layersType.VESSEL,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    VESSEL_TRACK: {
        code: 'vessel_track',
        name: '',
        group: null,
        type: layersType.VESSEL,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    REGULATORY: {
        code: 'regulatory_areas',
        name: '',
        group: null,
        type: layersType.REGULATORY,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    EEZ: {
        code: 'eez_areas',
        name: 'Zones ZEE',
        group: null,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    FAO: {
        code: 'fao_areas',
        name: 'Zones FAO/CIEM',
        group: null,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: true,
        subZoneFieldKey: 'f_division'
    },
    THREE_MILES: {
        code: '3_miles_areas',
        name: '3 Milles',
        group: null,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    SIX_MILES: {
        code: '6_miles_areas',
        name: '6 Milles',
        group: null,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    TWELVE_MILES: {
        code: '12_miles_areas',
        name: '12 Milles',
        group: null,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    eaux_occidentales_australes: {
        code: '1241_eaux_occidentales_australes_areas',
        name: 'Eaux occidentales australes',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    eaux_occidentales_septentrionales: {
        code: '1241_eaux_occidentales_septentrionales_areas',
        name: 'Eaux occidentales septentrionales',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    eaux_union_dans_oi_et_atl_ouest: {
        code: '1241_eaux_union_dans_oi_et_atl_ouest_areas',
        name: 'Eaux union dans oi et atl ouest',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    mer_baltique: {
        code: '1241_mer_baltique_areas',
        name: 'Mer baltique',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    mer_du_nord: {
        code: '1241_mer_du_nord_areas',
        name: 'Mer du nord',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    mer_mediterranee: {
        code: '1241_mer_mediterranee_areas',
        name: 'Mer mediterranee',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    mer_noire: {
        code: '1241_mer_noire_areas',
        name: 'Mer noire',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    cormoran: {
        code: 'cormoran_areas',
        name: 'Cormoran',
        group: null,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: true,
        subZoneFieldKey: 'zonex'
    },
    CCAMLR: {
        code: 'fao_ccamlr_areas',
        name: 'CCAMLR',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    ICCAT: {
        code: 'fao_iccat_areas',
        name: 'ICCAT',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    IOTC: {
        code: 'fao_iotc_areas',
        name: 'IOTC',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    NEAFC: {
        code: 'fao_neafc_areas',
        name: 'NEAFC',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    SIOFA: {
        code: 'fao_siofa_areas',
        name: 'SIOFA',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    rectangles_stat: {
        code: 'rectangles_stat_areas',
        name: 'Rectangles stat',
        group: null,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: false,
        subZoneFieldKey: null
    },
    situation_atlant: {
        code: 'situ_atlant_areas',
        name: 'Situation atlantique',
        group: layersGroups.VMS_SITUATION,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: true,
        subZoneFieldKey: 'libelle'
    },
    situation_med: {
        code: 'situ_med_areas',
        name: 'Situation med',
        group: layersGroups.VMS_SITUATION,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: true,
        subZoneFieldKey: 'libelle'
    },
    situation_memn: {
        code: 'situ_memn_areas',
        name: 'Situation MEMN',
        group: layersGroups.VMS_SITUATION,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: true,
        subZoneFieldKey: 'libelle'
    },
    situation_outre_mer: {
        code: 'situ_outre_mer_areas',
        name: 'Situation outre mer',
        group: layersGroups.VMS_SITUATION,
        type: layersType.ADMINISTRATIVE,
        containsMultipleZones: true,
        subZoneFieldKey: 'libelle'
    },
}

export const baseLayers = {
    OSM: {
        code: "OSM",
        text: "Open Street Map"
    },
    SATELLITE: {
        code: "SATELLITE",
        text: "Satellite"
    },
    LIGHT: {
        code: "LIGHT",
        text: "Fond de carte clair"
    },
    DARK: {
        code: "DARK",
        text: "Fond de carte sombre"
    },
}

export const vesselIconIsLight = selectedBaseLayer => selectedBaseLayer === baseLayers.DARK.code ||
    selectedBaseLayer === baseLayers.SATELLITE.code