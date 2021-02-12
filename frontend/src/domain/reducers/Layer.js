import LayersEnum from "../entities/layers";
import Layers from "../entities/layers";
import {createSlice} from '@reduxjs/toolkit'
import {getLocalStorageState} from "../../utils";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'

const layerSlice = createSlice({
    name: 'layer',
    initialState: {
        layers: [
            new VectorLayer({
                renderBuffer: 7,
                source: new VectorSource(),
                className: Layers.VESSELS
            })
        ],
        administrativeZones: [
            { layer: Layers.EEZ, layerName: 'Zones ZEE' },
            { layer: Layers.FAO, layerName: 'Zones FAO/CIEM' },
            { layer: Layers.THREE_MILES, layerName: '3 Milles' },
            { layer: Layers.SIX_MILES, layerName: '6 Milles' },
            { layer: Layers.TWELVE_MILES, layerName: '12 Milles' },
        ],
        showedLayers: getLocalStorageState([], layersShowedOnMapLocalStorageKey),
        lastShowedFeatures: [],
        layersAndAreas: []
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
        removeLayers(state, action) {
            state.layers = state.layers.filter(layer => !action.payload
                .some(layerToRemove => layerToRemove.className_ === layer.className_))
        },
        setLayers(state, action) {
            state.layers = action.payload
        },
        addShowedLayer(state, action) {
            if(action.payload.type !== Layers.VESSELS) {
                let found = false
                if (action.payload.type === LayersEnum.REGULATORY) {
                    found = state.showedLayers
                        .filter(layer => layer.type === LayersEnum.REGULATORY)
                        .some(layer => (
                            layer.zone.layerName === action.payload.zone.layerName &&
                            layer.zone.zone === action.payload.zone.zone
                    ))
                } else {
                    found = state.showedLayers.some(layer => layer.type === action.payload.type)
                }

                if (!found) {
                    state.showedLayers = state.showedLayers.concat(action.payload)
                    window.localStorage.setItem(layersShowedOnMapLocalStorageKey, JSON.stringify(state.showedLayers))
                }
            }
        },
        removeShowedLayer(state, action) {
            if(action.payload.type !== Layers.VESSELS) {
                if (action.payload.type === LayersEnum.REGULATORY) {
                    if(action.payload.zone.zone) {
                        state.showedLayers = state.showedLayers
                            .filter(layer => !(
                                layer.type === LayersEnum.REGULATORY &&
                                layer.zone.layerName === action.payload.zone.layerName &&
                                layer.zone.zone === action.payload.zone.zone))
                    } else {
                        state.showedLayers = state.showedLayers
                            .filter(layer => !(
                                layer.type === LayersEnum.REGULATORY &&
                                layer.zone.layerName === action.payload.zone.layerName))
                    }
                } else {
                    state.showedLayers = state.showedLayers.filter(layer => layer.type !== action.payload.type)
                }

                window.localStorage.setItem(layersShowedOnMapLocalStorageKey, JSON.stringify(state.showedLayers))
            }
        },
        pushLayerAndArea(state, action) {
            state.layersAndAreas = state.layersAndAreas.filter(layerAndArea => {
                return layerAndArea.name !== action.payload.name
            })
            state.layersAndAreas = state.layersAndAreas.concat(action.payload)
        },
        removeLayerAndArea(state, action) {
            state.layersAndAreas = state.layersAndAreas.filter(layerAndArea => {
                return layerAndArea.name !== action.payload
            })
        },
        setLastShowedFeatures(state, action) {
            state.lastShowedFeatures = action.payload
        }
    }
})

export const {
    replaceVesselLayer,
    addLayer,
    removeLayer,
    removeLayers,
    setLayers,
    addShowedLayer,
    removeShowedLayer,
    pushLayerAndArea,
    removeLayerAndArea,
    setLastShowedFeatures
} = layerSlice.actions

export default layerSlice.reducer
