import Layers from '../entities/layers'
import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'

const regulatorySlice = createSlice({
  name: 'layer',
  initialState: {
    layers: [],
    showedLayers: getLocalStorageState([], layersShowedOnMapLocalStorageKey),
    lastShowedFeatures: [],
    layersAndAreas: [],
    administrativeZonesGeometryCache: []
  },
  reducers: {
    addAdministrativeZoneGeometryToCache (state, action) {
      state.administrativeZonesGeometryCache = state.administrativeZonesGeometryCache.concat(action.payload)
    },
    addLayer (state, action) {
      state.layers = state.layers.concat(action.payload)
    },
    removeLayer (state, action) {
      state.layers = state.layers.filter(layer => layer.className_ !== action.payload.className_)
    },
    removeLayers (state, action) {
      state.layers = state.layers.filter(layer => !action.payload
        .some(layerToRemove => layerToRemove.className_ === layer.className_))
    },
    setLayers (state, action) {
      state.layers = action.payload
    },
    addShowedLayer (state, action) {
      if (action.payload.type !== Layers.VESSELS.code) {
        let found = false
        if (action.payload.type === Layers.REGULATORY.code) {
          found = state.showedLayers
            .filter(layer => layer.type === Layers.REGULATORY.code)
            .some(layer => (
              layer.zone.layerName === action.payload.zone.layerName &&
                            layer.zone.zone === action.payload.zone.zone
            ))
        } else if (action.payload.zone) {
          found = state.showedLayers
            .some(layer => (
              layer.type === action.payload.type &&
                        layer.zone === action.payload.zone
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
    removeShowedLayer (state, action) {
      if (action.payload.type !== Layers.VESSELS.code) {
        if (action.payload.type === Layers.REGULATORY.code) {
          if (action.payload.zone.zone) {
            state.showedLayers = state.showedLayers
              .filter(layer => !(
                layer.type === Layers.REGULATORY.code &&
                                layer.zone.layerName === action.payload.zone.layerName &&
                                layer.zone.zone === action.payload.zone.zone))
          } else {
            state.showedLayers = state.showedLayers
              .filter(layer => !(
                layer.type === Layers.REGULATORY.code &&
                                layer.zone.layerName === action.payload.zone.layerName))
          }
        } else {
          state.showedLayers = state.showedLayers.filter(layer => layer.type !== action.payload.type)
        }

        window.localStorage.setItem(layersShowedOnMapLocalStorageKey, JSON.stringify(state.showedLayers))
      }
    },
    pushLayerAndArea (state, action) {
      state.layersAndAreas = state.layersAndAreas.filter(layerAndArea => {
        return layerAndArea.name !== action.payload.name
      })
      state.layersAndAreas = state.layersAndAreas.concat(action.payload)
    },
    removeLayerAndArea (state, action) {
      state.layersAndAreas = state.layersAndAreas.filter(layerAndArea => {
        return layerAndArea.name !== action.payload
      })
    },
    setLastShowedFeatures (state, action) {
      state.lastShowedFeatures = action.payload
    }
  }
})

export const {
  addLayer,
  removeLayer,
  removeLayers,
  setLayers,
  addShowedLayer,
  removeShowedLayer,
  pushLayerAndArea,
  removeLayerAndArea,
  setLastShowedFeatures,
  addAdministrativeZoneGeometryToCache
} = regulatorySlice.actions

export default regulatorySlice.reducer
