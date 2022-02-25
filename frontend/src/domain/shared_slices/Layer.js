import Layers, { getLayerNameNormalized } from '../entities/layers'
import { createGenericSlice, getLocalStorageState } from '../../utils'

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'

const initialState = {
  lastShowedFeatures: [],
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
  showedLayers: []
}

const reducers = {
  addAdministrativeZoneGeometryToCache (state, action) {
    state.administrativeZonesGeometryCache = state.administrativeZonesGeometryCache.concat(action.payload)
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
      id,
      namespace,
      regulatoryGears
    } = action.payload

    if (type !== Layers.VESSELS.code) {
      const searchedLayerName = getLayerNameNormalized({ type, topic, zone })
      const found = !!state.showedLayers
        .find(layer => getLayerNameNormalized(layer) === searchedLayerName)

      if (!found) {
        state.showedLayers = state.showedLayers.concat({
          type,
          topic,
          zone,
          id,
          namespace,
          gears: regulatoryGears
        })
        if (namespace !== 'backoffice') {
          window.localStorage.setItem(`${namespace}${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
        }
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
          // LayerName is not used anymore, but may be still stored in LocalStorage (see l. 17)
          .filter(layer => !(layer.layerName === topic && layer.zone === zone))
      } else if (topic) {
        state.showedLayers = state.showedLayers
          .filter(layer => !(layer.topic === topic))
          // LayerName is not used anymore, but may be still stored in LocalStorage (see l. 17)
          .filter(layer => !(layer.layerName === topic))
      }
    } else {
      state.showedLayers = state.showedLayers.filter(layer => !(layer.type === type && layer.zone === zone))
    }
    if (namespace !== 'backoffice') {
      window.localStorage.setItem(`${namespace}${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
    }
  },
  resetShowedLayer (state, action) {
    state.showedLayers = []
    if (action.payload !== 'backoffice') {
      window.localStorage.setItem(`${action.payload}${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
    } else {
      window.localStorage.removeItem(`${action.payload}${layersShowedOnMapLocalStorageKey}`)
    }
  },
  setShowedLayers (state, action) {
    const regulatoryZones = action.payload.regulatoryZones
    let nextShowedLayers = []
    if (action.payload.namespace === 'homepage') {
      const showedLayersInLS = reOrderOldObjectHierarchyIfFound(getLocalStorageState([], `homepage${layersShowedOnMapLocalStorageKey}`))
      nextShowedLayers = showedLayersInLS.map(showedLayer => {
        let nextRegulatoryZone = regulatoryZones.find(regulatoryZone => {
          if (showedLayer.id) {
            return regulatoryZone.id === showedLayer.id
          } else {
            return regulatoryZone.topic === showedLayer.topic && regulatoryZone.zone === showedLayer.zone
          }
        })
        if (nextRegulatoryZone) {
          if (!(nextRegulatoryZone.topic && nextRegulatoryZone.lawType) && nextRegulatoryZone.nextId) {
            nextRegulatoryZone = regulatoryZones.find(regulatoryZone => regulatoryZone.id === nextRegulatoryZone.nextId)
          }
          return {
            type: showedLayer.type,
            namespace: showedLayer.namespace,
            gears: nextRegulatoryZone.gears,
            topic: nextRegulatoryZone.topic,
            id: nextRegulatoryZone.id,
            zone: nextRegulatoryZone.zone
          }
        }
        return null
      })
    }
    state.showedLayers = nextShowedLayers
    window.localStorage.setItem(`homepage${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
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
