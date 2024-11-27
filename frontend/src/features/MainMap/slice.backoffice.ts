// TODO Review that "double" logic for Layer slice.

import { getLayerNameNormalized } from '@features/MainMap/utils'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { LayerProperties } from './constants'
import { MainMap } from './MainMap.types'

import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

interface BackOfficeMainMapState {
  lastShowedFeatures: Array<Feature<Geometry>>
  layersSidebarOpenedLayerType: string | undefined
  layersToFeatures: MainMap.LayerToFeatures[]
  showedLayers: MainMap.ShowedLayer[]
}

const INITIAL_STATE: BackOfficeMainMapState = {
  lastShowedFeatures: [],
  layersSidebarOpenedLayerType: undefined,
  layersToFeatures: [],
  showedLayers: []
}

const backOfficeMainMapSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulation',
  reducers: {
    /**
     * Show a Regulatory or Administrative layer
     */
    // TODO This `Partial<MainMap.ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
    addShowedLayer(state, action: PayloadAction<Partial<MainMap.ShowedLayer>>) {
      const { type, zone } = action.payload

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
          } satisfies MainMap.ShowedLayer
        ]
      }
    },

    /**
     * Store layer to feature and simplified feature - To show simplified features if the zoom is low
     */
    pushLayerToFeatures(state, action: PayloadAction<MainMap.LayerToFeatures>) {
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
    removeShowedLayer(state, action: PayloadAction<MainMap.ShowedLayer>) {
      const { topic, type, zone } = action.payload

      if (type === MainMap.MonitorFishLayer.VESSELS) {
        return
      }

      if (type === LayerProperties.REGULATORY.code) {
        if (zone && topic) {
          state.showedLayers = state.showedLayers.filter(layer => !(layer.topic === topic && layer.zone === zone))
        } else if (topic) {
          state.showedLayers = state.showedLayers.filter(layer => layer.topic !== topic)
        }
      } else {
        state.showedLayers = state.showedLayers.filter(layer => !(layer.type === type && layer.zone === zone))
      }
    },

    resetShowedLayer(state) {
      state.showedLayers = []
    },

    setLastShowedFeatures(state, action: PayloadAction<Array<Feature<Geometry>>>) {
      state.lastShowedFeatures = action.payload
    },

    setLayersSideBarOpenedLayerType(state, action) {
      state.layersSidebarOpenedLayerType = action.payload
    }
  }
})

export const backOfficeMainMapActions = backOfficeMainMapSlice.actions
export const backOfficeMainMapReducer = backOfficeMainMapSlice.reducer
