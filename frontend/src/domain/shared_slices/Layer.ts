// TODO Review that "double" logic for Layer slice.

import { createGenericSlice, getLocalStorageState } from '../../utils'
import { getLayerNameNormalized } from '../entities/layers'
import { LayerProperties } from '../entities/layers/constants'

import type { LayerSliceNamespace, ShowedLayer } from '../entities/layers/types'
import type { AdministrativeOrRegulatoryLayerIdentity } from '../types/layer'
import type { PayloadAction, Slice } from '@reduxjs/toolkit'
import type { WritableDraft } from 'immer/dist/types/types-external'

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'

// TODO Type all these props
export type LayerState = {
  administrativeZonesGeometryCache: Record<string, any>[]
  lastShowedFeatures: Record<string, any>[]
  layersSidebarOpenedLayerType: string | undefined
  layersToFeatures: Record<string, any>[]
  showedLayers: ShowedLayer[]
}
const INITIAL_STATE: LayerState = {
  administrativeZonesGeometryCache: [],
  lastShowedFeatures: [],
  layersSidebarOpenedLayerType: undefined,
  layersToFeatures: [],
  showedLayers: []
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
   */
  addShowedLayer(state: WritableDraft<LayerState>, action: PayloadAction<ShowedLayer>) {
    const { id, namespace, topic, type, zone } = action.payload

    if (type !== LayerProperties.VESSELS_POINTS.code) {
      const searchedLayerName = getLayerNameNormalized({ topic, type, zone })
      const found = !!state.showedLayers.find(layer => getLayerNameNormalized(layer) === searchedLayerName)

      if (!found) {
        state.showedLayers = [
          ...state.showedLayers,
          {
            id,
            namespace,
            topic,
            type,
            zone
          }
        ]

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
  pushLayerToFeatures(state: WritableDraft<LayerState>, action) {
    state.layersToFeatures = state.layersToFeatures.filter(layer => layer.name !== action.payload.name)
    state.layersToFeatures = state.layersToFeatures.concat(action.payload)
  },

  /**
   * Remove a layer and the features
   */
  removeLayerToFeatures(state: WritableDraft<LayerState>, action: PayloadAction<string>) {
    state.layersToFeatures = state.layersToFeatures.filter(layer => layer.name !== action.payload)
  },

  /**
   * Remove a Regulatory or Administrative layer
   */
  removeShowedLayer(state: WritableDraft<LayerState>, action: PayloadAction<AdministrativeOrRegulatoryLayerIdentity>) {
    const { namespace, topic, type, zone } = action.payload

    if (type === LayerProperties.VESSELS_POINTS.code) {
      return
    }

    if (type === LayerProperties.REGULATORY.code) {
      if (zone && topic) {
        state.showedLayers = state.showedLayers
          .filter(layer => !(layer.topic === topic && layer.zone === zone))
          // LayerName is not used anymore, but may be still stored in LocalStorage (see l. 17)
          .filter(layer => !((layer as any).layerName === topic && layer.zone === zone))
      } else if (topic) {
        state.showedLayers = state.showedLayers
          .filter(layer => !(layer.topic === topic))
          // LayerName is not used anymore, but may be still stored in LocalStorage (see l. 17)
          .filter(layer => !((layer as any).layerName === topic))
      }
    } else {
      state.showedLayers = state.showedLayers.filter(layer => !(layer.type === type && layer.zone === zone))
    }
    if (namespace !== 'backoffice') {
      window.localStorage.setItem(`${namespace}${layersShowedOnMapLocalStorageKey}`, JSON.stringify(state.showedLayers))
    }
  },

  resetShowedLayer(state: WritableDraft<LayerState>, action) {
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

  setLastShowedFeatures(state: WritableDraft<LayerState>, action) {
    state.lastShowedFeatures = action.payload
  },

  setLayersSideBarOpenedLayerType(state: WritableDraft<LayerState>, action) {
    state.layersSidebarOpenedLayerType = action.payload
  },

  setShowedLayersWithLocalStorageValues(state: WritableDraft<LayerState>, action) {
    const { regulatoryZones } = action.payload
    let nextShowedLayers = []
    if (action.payload.namespace === 'homepage') {
      const showedLayersInLocalStorage = reOrderOldObjectHierarchyIfFound(
        getLocalStorageState([], `homepage${layersShowedOnMapLocalStorageKey}`)
      )

      nextShowedLayers = showedLayersInLocalStorage
        .filter(layer => layer)
        .map(showedLayer => {
          if (showedLayer.type === LayerProperties.REGULATORY.code) {
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
    window.localStorage.setItem(`homepage${layersShowedOnMapLocalStorageKey}`, JSON.stringify(nextShowedLayers))
  }
}

const layerSlice: Record<LayerSliceNamespace, Slice<LayerState>> = {
  backoffice: createGenericSlice(BACKOFFICE_INITIAL_STATE, reducers, 'BackofficeLayerSlice') as Slice<LayerState>,
  homepage: createGenericSlice(HOMEPAGE_INITIAL_STATE, reducers, 'HomePageLayerSlice') as Slice<LayerState>
}

// TODO Remove default export once cleaned.
// eslint-disable-next-line import/no-default-export
export default layerSlice
