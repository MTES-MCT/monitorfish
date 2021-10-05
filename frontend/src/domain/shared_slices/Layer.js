import Layers from '../entities/layers'
import { createGenericSlice, getLocalStorageState } from '../../utils'

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'

const initialState = {
  layers: [],
  lastShowedFeatures: [],
  layersAndAreas: [],
  layersToFeatures: [],
  administrativeZonesGeometryCache: [],
  layersSidebarOpenedLayer: ''
}

const reOrderOldObjectHierarchyIfFound = zones => {
  return zones.map(zone => {
    if (zone && zone.layerName) {
      return {
        topic: zone.layerName,
        ...zone
      }
    }

    return zone
  })
}

const homepageInitialState = {
  ...initialState,
  showedLayers: reOrderOldObjectHierarchyIfFound(getLocalStorageState([], `homepage${layersShowedOnMapLocalStorageKey}`))
}

const backofficeInitialState = {
  ...initialState,
  showedLayers: reOrderOldObjectHierarchyIfFound(getLocalStorageState([], `backoffice${layersShowedOnMapLocalStorageKey}`))
}

const reducers = {
  addAdministrativeZoneGeometryToCache (state, action) {
    state.administrativeZonesGeometryCache = state.administrativeZonesGeometryCache.concat(action.payload)
  },
  /**
   * Add a new layer
   * @param {Object=} state
   * @param {{payload: any | null}} action - The OpenLayers VectorLayer object to add
   */
  addLayer (state, action) {
    state.layers = state.layers.concat(action.payload)
  },
  /**
   * Remove a layer
   * @param {Object=} state
   * @param {{payload: any | null}} action - The OpenLayers VectorLayer object to remove
   */
  removeLayer (state, action) {
    state.layers = state.layers.filter(layer => layer.className_ !== action.payload.className_)
  },
  /**
   * Remove layers
   * @param {Object=} state
   * @param {{payload: any[] | null}} action - The OpenLayers VectorLayer objects to remove
   */
  removeLayers (state, action) {
    state.layers = state.layers.filter(layer => !action.payload
      .some(layerToRemove => layerToRemove.className_ === layer.className_))
  },
  /**
   * Set initial layers
   * @param {Object=} state
   * @param {{payload: any[] | null}} action - The OpenLayers VectorLayer objects
   */
  setLayers (state, action) {
    state.layers = action.payload
  },
  /**
   * Show a Regulatory or Administrative layer
   * @param {Object=} state
   * @param {{payload: AdministrativeOrRegulatoryLayer | null}} action - The layer to show
   */
  addShowedLayer (state, action) {
    const {
      type,
      topic,
      zone,
      namespace
    } = action.payload
    if (type !== Layers.VESSELS.code) {
      let found = false
      if (type === Layers.REGULATORY.code) {
        found = state.showedLayers
          .filter(layer => layer.type === Layers.REGULATORY.code)
          .some(layer => (
            layer.topic === topic &&
            layer.zone === zone
          ))
      } else if (zone) {
        found = state.showedLayers
          .some(layer => (
            layer.type === type &&
            layer.layer === zone
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
  /**
   * Remove a Regulatory or Administrative layer
   * @param {Object=} state
   * @param {{payload: AdministrativeOrRegulatoryLayer | null}} action - The layer to remove
   */
  removeShowedLayer (state, action) {
    const {
      type,
      topic,
      zone,
      namespace
    } = action.payload

    if (type === Layers.VESSELS.code) {
      return
    }

    if (type === Layers.REGULATORY.code) {
      if (zone && topic) {
        state.showedLayers = state.showedLayers
          .filter(layer => !(layer.topic === topic && layer.zone === zone))
          // LayerName is not used anymore, but may be still store in LocalStorage
          .filter(layer => !(layer.layerName === topic && layer.zone === zone))
      } else if (topic) {
        state.showedLayers = state.showedLayers
          .filter(layer => !(layer.topic === topic))
          // LayerName is not used anymore, but may be still store in LocalStorage
          .filter(layer => !(layer.layerName === topic))
      }
    } else {
      state.showedLayers = state.showedLayers.filter(layer => layer.type !== type)
    }
    window.localStorage.setItem(`${namespace}${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
  },
  /**
   * Add a new layer with an area to show layers in a sort order (the biggest are under the smallest)
   * @param {Object=} state
   * @param {{payload: LayerAndArea | null}} action - The layer and area
   */
  pushLayerAndArea (state, action) {
    state.layersAndAreas = state.layersAndAreas.filter(layerAndArea => {
      return layerAndArea.name !== action.payload.name
    })
    state.layersAndAreas = state.layersAndAreas.concat(action.payload)
  },
  /**
   * Remove a layer with an area
   * @param {Object=} state
   * @param {{payload: LayerAndArea | null}} action - The layer and area
   */
  removeLayerAndArea (state, action) {
    state.layersAndAreas = state.layersAndAreas.filter(layerAndArea => {
      return layerAndArea.name !== action.payload
    })
  },
  /**
   * Store layer to feature and simplified feature - To show simplified features if the zoom is low
   * @param {Object=} state
   * @param {{payload: LayerToFeatures | null}} action - The layer and features
   */
  pushLayerToFeatures (state, action) {
    state.layersToFeatures = state.layersToFeatures.filter(layer => {
      return layer.name !== action.payload.name
    })
    state.layersToFeatures = state.layersToFeatures.concat(action.payload)
  },
  /**
   * Remove a layer and the features
   * @param {Object=} state
   * @param {{payload: string | null}} action - The layer name
   */
  removeLayerToFeatures (state, action) {
    state.layersToFeatures = state.layersToFeatures.filter(layer => {
      return layer.name !== action.payload
    })
  },
  setLastShowedFeatures (state, action) {
    state.lastShowedFeatures = action.payload
  },
  setLayersSideBarOpenedZone (state, action) {
    state.layersSidebarOpenedLayer = action.payload
  }
}

export default {
  homepage: createGenericSlice(homepageInitialState, reducers, 'HomePageLayerSlice'),
  backoffice: createGenericSlice(backofficeInitialState, reducers, 'BackofficeLayerSlice')
}
