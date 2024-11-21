// TODO Review that "double" logic for Layer slice.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { isNotNullish } from '@utils/isNotNullish'
import { getLayerNameNormalized } from 'domain/entities/layers'
import { LayerProperties } from 'domain/entities/layers/constants'
import { MonitorFishLayer } from 'domain/entities/layers/types'

import { getLocalStorageState } from '../../utils'

import type { EditedRegulatoryZone } from '@features/Regulation/types'
import type { ShowedLayer } from 'domain/entities/layers/types'

const layersShowedOnMapLocalStorageKey = 'layersShowedOnMap'

// TODO Type all these props
export type LayerState = {
  administrativeZonesGeometryCache: Record<string, any>[]
  lastShowedFeatures: Record<string, any>[]
  layersSidebarOpenedLayerType: string | undefined
  layersToFeatures: Record<string, any>[]
  showedLayers: ShowedLayer[]
}

const reOrderOldObjectHierarchyIfFound = (zones: ShowedLayer[]) =>
  zones.map(zone => {
    if (zone && zone.layerName) {
      return {
        ...zone,
        topic: zone.layerName
      }
    }

    return zone
  })

const INITIAL_STATE: LayerState = {
  administrativeZonesGeometryCache: [],
  lastShowedFeatures: [],
  layersSidebarOpenedLayerType: undefined,
  layersToFeatures: [],
  showedLayers: reOrderOldObjectHierarchyIfFound(
    getLocalStorageState<ShowedLayer[]>([], `homepage${layersShowedOnMapLocalStorageKey}`)
  )
}

const layerSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulation',
  reducers: {
    addAdministrativeZoneGeometryToCache(state, action) {
      state.administrativeZonesGeometryCache = state.administrativeZonesGeometryCache.concat(action.payload)
    },

    /**
     * Show a Regulatory or Administrative layer
     */
    // TODO This `Partial<ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
    addShowedLayer(state, action: PayloadAction<Partial<ShowedLayer>>) {
      const { type, zone } = action.payload

      if (type !== MonitorFishLayer.VESSELS) {
        const searchedLayerName = getLayerNameNormalized({
          topic: 'topic' in action.payload ? action.payload.topic : undefined,
          type,
          zone
        })
        const found = !!state.showedLayers.find(layer => getLayerNameNormalized(layer) === searchedLayerName)

        if (!found) {
          state.showedLayers = [
            ...state.showedLayers,
            {
              id: 'id' in action.payload ? action.payload.id : undefined,
              topic: 'topic' in action.payload && action.payload.topic ? action.payload.topic : undefined,
              type,
              zone: zone ?? undefined
            } satisfies ShowedLayer
          ]
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
     */
    removeLayerToFeatures(state, action: PayloadAction<string>) {
      state.layersToFeatures = state.layersToFeatures.filter(layer => layer.name !== action.payload)
    },

    /**
     * Remove a Regulatory or Administrative layer
     */
    removeShowedLayer(state, action: PayloadAction<ShowedLayer>) {
      const { topic, type, zone } = action.payload

      if (type === MonitorFishLayer.VESSELS) {
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
    },

    setLastShowedFeatures(state, action) {
      state.lastShowedFeatures = action.payload
    },

    setLayersSideBarOpenedLayerType(state, action) {
      state.layersSidebarOpenedLayerType = action.payload
    },

    setShowedLayersWithLocalStorageValues(state, action: PayloadAction<EditedRegulatoryZone[]>) {
      let nextShowedLayers: ShowedLayer[] = []
      const showedLayersInLocalStorage = reOrderOldObjectHierarchyIfFound(
        getLocalStorageState<ShowedLayer[]>([], `homepage${layersShowedOnMapLocalStorageKey}`)
      )

      nextShowedLayers = showedLayersInLocalStorage
        // TODO Is it necessary?
        .filter(isNotNullish)
        .map(showedLayer => {
          if (showedLayer.type === LayerProperties.REGULATORY.code) {
            let nextRegulatoryZone = action.payload.find(regulatoryZone => {
              if (showedLayer.id) {
                return regulatoryZone.id === showedLayer.id
              }

              return regulatoryZone.topic === showedLayer.topic && regulatoryZone.zone === showedLayer.zone
            })

            if (nextRegulatoryZone) {
              if (!(nextRegulatoryZone.topic && nextRegulatoryZone.lawType) && nextRegulatoryZone.nextId) {
                nextRegulatoryZone = action.payload.find(
                  regulatoryZone => !!nextRegulatoryZone && regulatoryZone.id === nextRegulatoryZone.nextId
                )
              }

              return nextRegulatoryZone
                ? ({
                    gears: nextRegulatoryZone.gearRegulation,
                    id: nextRegulatoryZone.id,
                    topic: nextRegulatoryZone.topic,
                    type: showedLayer.type,
                    zone: nextRegulatoryZone.zone
                  } satisfies ShowedLayer)
                : null
            }

            return null
          }

          return showedLayer
        })
        .filter(isNotNullish)

      state.showedLayers = nextShowedLayers
      window.localStorage.setItem(`homepage${layersShowedOnMapLocalStorageKey}`, JSON.stringify(nextShowedLayers))
    }
  }
})

export const layerActions = layerSlice.actions
export const layerReducer = layerSlice.reducer
