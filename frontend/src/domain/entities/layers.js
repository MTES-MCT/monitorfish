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
    BASE_LAYER: 'BASE_LAYER'
}

export default {
    BASE_LAYER: {
        code: 'ol-layer',
        name: '',
        group: null,
        type: layersType.BASE_LAYER
    },
    VESSELS: {
        code: 'vessels',
        name: '',
        group: null,
        type: layersType.VESSEL
    },
    VESSEL_TRACK: {
        code: 'vessel_track',
        name: '',
        group: null,
        type: layersType.VESSEL
    },
    REGULATORY: {
        code: 'regulatory_areas',
        name: '',
        group: null,
        type: layersType.REGULATORY
    },
    EEZ: {
        code: 'eez_areas',
        name: 'Zones ZEE',
        group: null,
        type: layersType.ADMINISTRATIVE
    },
    FAO: {
        code: 'fao_areas',
        name: 'Zones FAO/CIEM',
        group: null,
        type: layersType.ADMINISTRATIVE
    },
    THREE_MILES: {
        code: '3_miles_areas',
        name: '3 Milles',
        group: null,
        type: layersType.ADMINISTRATIVE
    },
    SIX_MILES: {
        code: '6_miles_areas',
        name: '6 Milles',
        group: null,
        type: layersType.ADMINISTRATIVE
    },
    TWELVE_MILES: {
        code: '12_miles_areas',
        name: '12 Milles',
        group: null,
        type: layersType.ADMINISTRATIVE
    },
    eaux_occidentales_australes: {
        code: '1241_eaux_occidentales_australes_areas',
        name: 'Eaux occidentales australes',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE
    },
    eaux_occidentales_septentrionales: {
        code: '1241_eaux_occidentales_septentrionales_areas',
        name: 'Eaux occidentales septentrionales',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE
    },
    eaux_union_dans_oi_et_atl_ouest: {
        code: '1241_eaux_union_dans_oi_et_atl_ouest_areas',
        name: 'Eaux union dans oi et atl ouest',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE
    },
    mer_baltique: {
        code: '1241_mer_baltique_areas',
        name: 'Mer baltique',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE
    },
    mer_du_nord: {
        code: '1241_mer_du_nord_areas',
        name: 'Mer du nord',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE
    },
    mer_mediterranee: {
        code: '1241_mer_mediterranee_areas',
        name: 'Mer mediterranee',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE
    },
    mer_noire: {
        code: '1241_mer_noire_areas',
        name: 'Mer noire',
        group: layersGroups.TWELVE_FORTY_ONE,
        type: layersType.ADMINISTRATIVE
    },
    cormoran: {
        code: 'cormoran_areas',
        name: 'Cormoran',
        group: null,
        type: layersType.ADMINISTRATIVE
    },
    CCAMLR: {
        code: 'fao_ccamlr_areas',
        name: 'CCAMLR',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE
    },
    ICCAT: {
        code: 'fao_iccat_areas',
        name: 'ICCAT',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE
    },
    IOTC: {
        code: 'fao_iotc_areas',
        name: 'IOTC',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE
    },
    NEAFC: {
        code: 'fao_neafc_areas',
        name: 'NEAFC',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE
    },
    SIOFA: {
        code: 'fao_siofa_areas',
        name: 'SIOFA',
        group: layersGroups.ORGP,
        type: layersType.ADMINISTRATIVE
    },
    rectangles_stat: {
        code: 'rectangles_stat_areas',
        name: 'Rectangles stat',
        group: null,
        type: layersType.ADMINISTRATIVE
    },
    situation_atlant: {
        code: 'situ_atlant_areas',
        name: 'Situation atlantique',
        group: layersGroups.VMS_SITUATION,
        type: layersType.ADMINISTRATIVE
    },
    situation_med: {
        code: 'situ_med_areas',
        name: 'Situation med',
        group: layersGroups.VMS_SITUATION,
        type: layersType.ADMINISTRATIVE
    },
    situation_memn: {
        code: 'situ_memn_areas',
        name: 'Situation MEMN',
        group: layersGroups.VMS_SITUATION,
        type: layersType.ADMINISTRATIVE
    },
    situation_outre_mer: {
        code: 'situ_outre_mer_areas',
        name: 'Situation outre mer',
        group: layersGroups.VMS_SITUATION,
        type: layersType.ADMINISTRATIVE
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