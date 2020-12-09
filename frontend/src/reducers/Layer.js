import LayersEnum from "../domain/layers";

import Layers from '../domain/layers'
import { createSlice } from '@reduxjs/toolkit'
import {getLocalStorageState} from "../utils";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'
const selectedRegulatoryZonesLocalStorageKey = 'selectedRegulatoryZones'

const layerSlice = createSlice({
    name: 'layer',
    initialState: {
        layers: [
            new VectorLayer({
                source: new VectorSource(),
                className: Layers.VESSELS
            })
        ],
        zones: [
            { layer: Layers.EEZ, layerName: 'Zones ZEE' },
            { layer: Layers.FAO, layerName: 'Zones FAO/CIEM' },
            { layer: Layers.THREE_MILES, layerName: '3 Milles' },
            { layer: Layers.SIX_MILES, layerName: '6 Milles' },
            { layer: Layers.TWELVE_MILES, layerName: '12 Milles' },
            { layer: Layers.ONE_HUNDRED_MILES, layerName: '100 Milles' }
        ],
        showedLayers: getLocalStorageState([], layersShowedOnMapLocalStorageKey),
        selectedRegulatoryZones: getLocalStorageState({}, selectedRegulatoryZonesLocalStorageKey)
    },
    reducers: {
        replaceVesselLayer(state, action) {
            const arrayWithoutVessels = state.layers.filter(layer => layer.className_ !== LayersEnum.VESSELS)
            state.layers = [...arrayWithoutVessels, action.payload]
        },
        addLayer(state, action) {
            state.layers = state.layers.concat(action.payload)
        },
        removeLayer(state, action) {
            state.layers = state.layers.filter(layer => layer.className_ !== action.payload.className_)
        },
        setLayers(state, action) {
            state.layers = action.payload
        },
        addShowedLayer(state, action) {
            if(action.payload.type !== Layers.VESSELS) {
                if(!state.showedLayers.find(layer => layer.type === action.payload.type)) {
                    state.showedLayers = state.showedLayers.concat(action.payload)
                    window.localStorage.setItem(layersShowedOnMapLocalStorageKey, JSON.stringify(state.showedLayers))
                }
            }
        },
        removeShowedLayer(state, action) {
            if(action.payload.type !== Layers.VESSELS) {
                state.showedLayers = state.showedLayers.filter(layer => layer.type !== action.payload.type)
                window.localStorage.setItem(layersShowedOnMapLocalStorageKey, JSON.stringify(state.showedLayers))
            }
        },
        addRegulatoryZonesToSelection(state, action) {
            state.selectedRegulatoryZones = action.payload
            window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryZones))
        },
        removeRegulatoryZonesToSelection(state, action) {
            state.selectedRegulatoryZones[action.payload.layerName] = state.selectedRegulatoryZones[action.payload.layerName].filter(subZone => {
                return !(subZone.layerName === action.payload.layerName &&
                    subZone.gears === action.payload.gears &&
                    subZone.zone === action.payload.zone &&
                    subZone.species === action.payload.species &&
                    subZone.regulatoryReference === action.payload.regulatoryReference)
            })

            if (!state.selectedRegulatoryZones[action.payload.layerName].length) {
                delete state.selectedRegulatoryZones[action.payload.layerName]
            }

            window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryZones))
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
    removeRegulatoryZonesToSelection
} = layerSlice.actions

export default layerSlice.reducer
