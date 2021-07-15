import Layers from '../entities/layers'
import { createGenericSlice, getLocalStorageState } from '../../utils'

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'

const reducers = {
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
    const {
      namespace,
      zone,
      type
    } = action.payload
    if (type !== Layers.VESSELS.code) {
      let found = false
      if (type === Layers.REGULATORY.code) {
        found = state.showedLayers
          .filter(layer => layer.type === Layers.REGULATORY.code)
          .some(layer => (
            layer.zone.layerName === zone.layerName &&
            layer.zone.zone === zone.zone
          ))
      } else if (zone) {
        found = state.showedLayers
          .some(layer => (
            layer.type === type &&
            layer.zone === zone
          ))
      } else {
        found = state.showedLayers.some(layer => layer.type === type)
      }

      if (!found) {
        state.showedLayers = state.showedLayers.concat(action.payload)
        window.localStorage.setItem(`${namespace}${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
      }
    }
  },
  removeShowedLayer (state, action) {
    const {
      type,
      zone,
      namespace
    } = action.payload
    if (type !== Layers.VESSELS.code) {
      if (type === Layers.REGULATORY.code) {
        if (zone.zone) {
          state.showedLayers = state.showedLayers
            .filter(layer => !(
              layer.type === Layers.REGULATORY.code &&
              layer.zone.layerName === zone.layerName &&
              layer.zone.zone === zone.zone))
        } else {
          state.showedLayers = state.showedLayers
            .filter(layer => !(
              layer.type === Layers.REGULATORY.code &&
              layer.zone.layerName === zone.layerName))
        }
      } else {
        state.showedLayers = state.showedLayers.filter(layer => layer.type !== type)
      }
      window.localStorage.setItem(`${namespace}${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
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
  },
  setLayersSideBarOpenedZone (state, action) {
    state.layersSidebarOpenedZone = action.payload
  }
}

const initialState = {
  layers: [],
  lastShowedFeatures: [],
  layersAndAreas: [],
  administrativeZonesGeometryCache: [],
  layersSidebarOpenedZone: ''
}

const homepageInitialState = {
  ...initialState,
  showedLayers: getLocalStorageState([], `homepage${layersShowedOnMapLocalStorageKey}`)
}

const backofficeInitialState = {
  ...initialState,
  showedLayers: getLocalStorageState([], `backoffice${layersShowedOnMapLocalStorageKey}`)
}

export default {
  homepage: createGenericSlice(homepageInitialState, reducers, 'HomePageLayerSlice'),
  backoffice: createGenericSlice(backofficeInitialState, reducers, 'BackofficeLayerSlice')
}
