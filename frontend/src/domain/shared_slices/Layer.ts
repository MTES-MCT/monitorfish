// TODO Review that "double" logic for Layer slice.

import { createGenericSlice, getLocalStorageState } from '../../utils'
import Layers, { getLayerNameNormalized } from '../entities/layers'

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'

// TODO Type all these props
export type LayerState = {
  administrativeZonesGeometryCache: Record<string, any>[]
  lastShowedFeatures: Record<string, any>[]
  layersSidebarOpenedLayer: string
  layersToFeatures: Record<string, any>[]
}
const INITIAL_STATE = {
  administrativeZonesGeometryCache: [],
  lastShowedFeatures: [],
  layersSidebarOpenedLayer: '',
  layersToFeatures: []
}

const reOrderOldObjectHierarchyIfFound = zones =>
  zones.map(zone => {
    if (zone && zone.layerName) {
      return {
        topic: zone.layerName,
        ...zone
      }
    }

    return zone
  })

const HOMEPAGE_INITIAL_STATE = {
  ...INITIAL_STATE,
  showedLayers: reOrderOldObjectHierarchyIfFound(
    getLocalStorageState([], `homepage${layersShowedOnMapLocalStorageKey}`)
  )
}

const BACKOFFICE_INITIAL_STATE = {
  ...INITIAL_STATE,
  showedLayers: []
}

const reducers = {
  addAdministrativeZoneGeometryToCache(state, action) {
    state.administrativeZonesGeometryCache = state.administrativeZonesGeometryCache.concat(action.payload)
  },
  /**
   * Show a Regulatory or Administrative layer
   * @param {Object=} state
   * @param {{payload: AdministrativeOrRegulatoryLayer | null}} action - The layer to show
   */
  addShowedLayer(state, action) {
    const { gearRegulation, id, namespace, topic, type, zone } = action.payload

    if (type !== Layers.VESSELS.code) {
      const searchedLayerName = getLayerNameNormalized({ topic, type, zone })
      const found = !!state.showedLayers.find(layer => getLayerNameNormalized(layer) === searchedLayerName)

      if (!found) {
        state.showedLayers = state.showedLayers.concat({
          gears: gearRegulation,
          id,
          namespace,
          topic,
          type,
          zone
        })
        if (namespace !== 'backoffice') {
          window.localStorage.setItem(
            `${namespace}${layersShowedOnMapLocalStorageKey}`,
            JSON.stringify(state.showedLayers)
          )
        }
      }
    }
  },

  /**
   * Store layer to feature and simplified feature - To show simplified features if the zoom is low
   * @param {Object=} state
   * @param {{payload: LayerToFeatures | null}} action - The layer and features
   */
  pushLayerToFeatures(state, action) {
    state.layersToFeatures = state.layersToFeatures.filter(layer => layer.name !== action.payload.name)
    state.layersToFeatures = state.layersToFeatures.concat(action.payload)
  },

  /**
   * Remove a layer and the features
   * @param {Object=} state
   * @param {{payload: string | null}} action - The layer name
   */
  removeLayerToFeatures(state, action) {
    state.layersToFeatures = state.layersToFeatures.filter(layer => layer.name !== action.payload)
  },

  /**
   * Remove a Regulatory or Administrative layer
   * @param {Object=} state
   * @param {{payload: AdministrativeOrRegulatoryLayer | null}} action - The layer to remove
   */
  removeShowedLayer(state, action) {
    const { namespace, topic, type, zone } = action.payload

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

  resetShowedLayer(state, action) {
    state.showedLayers = []
    if (action.payload !== 'backoffice') {
      window.localStorage.setItem(
        `${action.payload}${layersShowedOnMapLocalStorageKey}`,
        JSON.stringify(state.showedLayers)
      )
    } else {
      window.localStorage.removeItem(`${action.payload}${layersShowedOnMapLocalStorageKey}`)
    }
  },

  setLastShowedFeatures(state, action) {
    state.lastShowedFeatures = action.payload
  },
  setLayersSideBarOpenedZone(state, action) {
    state.layersSidebarOpenedLayer = action.payload
  },
  setShowedLayersWithLocalStorageValues(state, action) {
    const { regulatoryZones } = action.payload
    let nextShowedLayers = []
    if (action.payload.namespace === 'homepage') {
      const showedLayersInLocalStorage = reOrderOldObjectHierarchyIfFound(
        getLocalStorageState([], `homepage${layersShowedOnMapLocalStorageKey}`)
      )

      nextShowedLayers = showedLayersInLocalStorage
        .filter(layer => layer)
        .map(showedLayer => {
          if (showedLayer.type === Layers.REGULATORY.code) {
            let nextRegulatoryZone = regulatoryZones.find(regulatoryZone => {
              if (showedLayer.id) {
                return regulatoryZone.id === showedLayer.id
              }

              return regulatoryZone.topic === showedLayer.topic && regulatoryZone.zone === showedLayer.zone
            })

            if (nextRegulatoryZone) {
              if (!(nextRegulatoryZone.topic && nextRegulatoryZone.lawType) && nextRegulatoryZone.nextId) {
                nextRegulatoryZone = regulatoryZones.find(
                  regulatoryZone => regulatoryZone.id === nextRegulatoryZone.nextId
                )
              }

              return {
                gears: nextRegulatoryZone.gearRegulation,
                id: nextRegulatoryZone.id,
                namespace: showedLayer.namespace,
                topic: nextRegulatoryZone.topic,
                type: showedLayer.type,
                zone: nextRegulatoryZone.zone
              }
            }

            return null
          }

          return showedLayer
        })
        .filter(layer => layer)
    }

    state.showedLayers = nextShowedLayers
    window.localStorage.setItem(`homepage${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
  }
}

const layerSliceForBackoffice = createGenericSlice(BACKOFFICE_INITIAL_STATE, reducers, 'BackofficeLayerSlice')
const layerSliceForHomepage = createGenericSlice(HOMEPAGE_INITIAL_STATE, reducers, 'HomePageLayerSlice')

export const layerReducerForBackoffice = layerSliceForBackoffice.reducer
export const layerReducerForHomepage = layerSliceForHomepage.reducer
