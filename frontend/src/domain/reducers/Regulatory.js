
import { createSlice } from '@reduxjs/toolkit'
import {getLocalStorageState} from "../../utils";

const selectedRegulatoryZonesLocalStorageKey = 'selectedRegulatoryZones'

const layerSlice = createSlice({
    name: 'regulatory',
    initialState: {
        isReadyToShowRegulatoryZones: false,
        selectedRegulatoryZones: getLocalStorageState({}, selectedRegulatoryZonesLocalStorageKey),
        regulatoryZoneMetadata: null,
        loadingRegulatoryZoneMetadata: false,
        regulatoryZoneMetadataPanelIsOpen: false
    },
    reducers: {
        addRegulatoryZonesToSelection(state, action) {
            state.selectedRegulatoryZones = action.payload
            window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryZones))
        },
        removeRegulatoryZonesFromSelection(state, action) {
            if(action.payload.zone) {
                state.selectedRegulatoryZones[action.payload.layerName] = state.selectedRegulatoryZones[action.payload.layerName].filter(subZone => {
                    return !(subZone.layerName === action.payload.layerName && subZone.zone === action.payload.zone)
                })
            } else {
                state.selectedRegulatoryZones[action.payload.layerName] = state.selectedRegulatoryZones[action.payload.layerName].filter(subZone => {
                    return !(subZone.layerName === action.payload.layerName)
                })
            }

            if (!state.selectedRegulatoryZones[action.payload.layerName].length) {
                delete state.selectedRegulatoryZones[action.payload.layerName]
            }

            window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryZones))
        },
        setIsReadyToShowRegulatoryZones(state) {
            state.isReadyToShowRegulatoryZones = true
        },
        setLoadingRegulatoryZoneMetadata(state) {
            state.loadingRegulatoryZoneMetadata = true
            state.regulatoryZoneMetadata = null
            state.regulatoryZoneMetadataPanelIsOpen = true
        },
        setRegulatoryZoneMetadata(state, action) {
            state.loadingRegulatoryZoneMetadata = false
            state.regulatoryZoneMetadata = action.payload
        },
        closeRegulatoryZoneMetadataPanel(state) {
            state.regulatoryZoneMetadataPanelIsOpen = false
            state.regulatoryZoneMetadata = null
        }
    }
})

export const {
    replaceVesselLayer,
    addLayer,
    removeLayer,
    setLayers,
    addShowedLayer,
    removeShowedLayer,
    addRegulatoryZonesToSelection,
    removeRegulatoryZonesFromSelection,
    setIsReadyToShowRegulatoryZones,
    setLoadingRegulatoryZoneMetadata,
    setRegulatoryZoneMetadata,
    closeRegulatoryZoneMetadataPanel
} = layerSlice.actions

export default layerSlice.reducer
