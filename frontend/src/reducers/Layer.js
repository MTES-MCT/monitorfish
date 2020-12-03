import LayersEnum from "../domain/layers";

import { createSlice } from '@reduxjs/toolkit'

const layerSlice = createSlice({
    name: 'layer',
    initialState: {
        layers: [],
        layerToShow: null,
        layerToHide: null
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
        showLayer(state, action) {
            state.layerToShow = action.payload
        },
        hideLayer(state, action) {
            state.layerToHide = action.payload
        },
        resetShowLayer(state) {
            state.layerToShow = null
        },
        resetHideLayer(state) {
            state.layerToHide = null
        }
    }
})

export const {
    replaceVesselLayer,
    addLayer,
    removeLayer,
    setLayers,
    showLayer,
    hideLayer,
    resetShowLayer,
    resetHideLayer,
} = layerSlice.actions

export default layerSlice.reducer
