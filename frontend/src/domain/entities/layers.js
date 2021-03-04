export default {
    BASE_LAYER: 'ol-layer',
    VESSELS: 'vessels',
    REGULATORY: 'regulatory_areas',
    EEZ: 'eez_areas',
    FAO: 'fao_areas',
    THREE_MILES: '3_miles_areas',
    SIX_MILES: '6_miles_areas',
    TWELVE_MILES: '12_miles_areas',
    ONE_HUNDRED_MILES: '100_miles_areas',
    COAST_LINES: 'coast_lines',
    VESSEL_TRACK: 'vessel_track'
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