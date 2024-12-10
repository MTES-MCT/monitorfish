// TODO Review that "double" logic for Layer slice.

import { LayerProperties } from '@features/Map/constants'
import { getLayerNameNormalized } from '@features/Map/utils'
import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { isNotNullish } from '@utils/isNotNullish'

import { MonitorFishMap } from './Map.types'

import type { RegulatoryZone } from '@features/Regulation/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type { Pixel } from 'ol/pixel'

interface LayerState {
  administrativeZonesGeometryCache: Record<string, any>[]
  lastShowedFeatures: Array<Feature<Geometry>>
  layersSidebarOpenedLayerType: string | undefined
  layersToFeatures: MonitorFishMap.LayerToFeatures[]
  mousePosition: Pixel | undefined
  showedLayers: MonitorFishMap.ShowedLayer[]
}

const INITIAL_STATE: LayerState = {
  administrativeZonesGeometryCache: [],
  lastShowedFeatures: [],
  layersSidebarOpenedLayerType: undefined,
  layersToFeatures: [],
  mousePosition: undefined,
  // TODO Use redux-persist to load showed layers.
  showedLayers: localStorageManager.get<MonitorFishMap.ShowedLayer[]>(LocalStorageKey.LayersShowedOnMap, [])
}

const layerSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'layer',
  reducers: {
    addAdministrativeZoneGeometryToCache(state, action) {
      state.administrativeZonesGeometryCache = state.administrativeZonesGeometryCache.concat(action.payload)
    },

    /**
     * Show a Regulatory or Administrative layer
     */
    // TODO This `Partial<Map.ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
    addShowedLayer(state, action: PayloadAction<Partial<MonitorFishMap.ShowedLayer>>) {
      const { type, zone } = action.payload

      if (type !== MonitorFishMap.MonitorFishLayer.VESSELS) {
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
            } satisfies MonitorFishMap.ShowedLayer
          ]
        }
      }

      // TODO Use redux-persist to save showed layers.
      localStorageManager.set(LocalStorageKey.LayersShowedOnMap, state.showedLayers)
    },

    /**
     * Store layer to feature and simplified feature - To show simplified features if the zoom is low
     */
    pushLayerToFeatures(state, action: PayloadAction<MonitorFishMap.LayerToFeatures>) {
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
    removeShowedLayer(state, action: PayloadAction<MonitorFishMap.ShowedLayer>) {
      const { topic, type, zone } = action.payload

      if (type === MonitorFishMap.MonitorFishLayer.VESSELS) {
        return
      }

      if (type === LayerProperties.REGULATORY.code) {
        if (zone && topic) {
          state.showedLayers = state.showedLayers.filter(
            layer => !(layer.topic === topic && (layer.zone ? layer.zone === zone : true))
          )
        } else if (topic) {
          state.showedLayers = state.showedLayers.filter(layer => layer.topic !== topic)
        }
      } else {
        state.showedLayers = state.showedLayers.filter(
          layer => !(layer.type === type && (layer.zone ? layer.zone === zone : true))
        )
      }

      // TODO Use redux-persist to save showed layers.
      localStorageManager.set(LocalStorageKey.LayersShowedOnMap, state.showedLayers)
    },

    setLastShowedFeatures(state, action: PayloadAction<Array<Feature<Geometry>>>) {
      state.lastShowedFeatures = action.payload
    },

    setLayersSideBarOpenedLayerType(state, action) {
      state.layersSidebarOpenedLayerType = action.payload
    },

    setMousePosition(state, action: PayloadAction<Pixel>) {
      state.mousePosition = action.payload
    },

    setShowedLayersWithLocalStorageValues(state, action: PayloadAction<RegulatoryZone[]>) {
      let nextShowedLayers: MonitorFishMap.ShowedLayer[] = []
      // TODO Use redux-persist to load showed layers.
      const showedLayersInLocalStorage = localStorageManager.get<MonitorFishMap.ShowedLayer[]>(
        LocalStorageKey.LayersShowedOnMap,
        []
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
                  } satisfies MonitorFishMap.ShowedLayer)
                : null
            }

            return null
          }

          return showedLayer
        })
        .filter(isNotNullish)

      state.showedLayers = nextShowedLayers

      // TODO Use redux-persist to save showed layers.
      localStorageManager.set(LocalStorageKey.LayersShowedOnMap, nextShowedLayers)
    }
  }
})

export const layerActions = layerSlice.actions
export const layerReducer = layerSlice.reducer
