// TODO Review that "double" logic for Layer slice.

import { getLayerNameNormalized } from '@features/MainMap/utils'
import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { MainMap } from './MainMap.types'
import { reOrderOldObjectHierarchyIfFound } from './utils'

interface BackOfficeMainMapState {
  showedLayers: MainMap.ShowedLayer[]
}

const INITIAL_STATE: BackOfficeMainMapState = {
  showedLayers: reOrderOldObjectHierarchyIfFound(
    // TODO Use redux-persist to load showed layers.
    localStorageManager.get<MainMap.ShowedLayer[]>(LocalStorageKey.LayersShowedOnMap, [])
  )
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

      if (type !== MainMap.MonitorFishLayer.VESSELS) {
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

          // TODO Use redux-persist to save showed layers.
          localStorageManager.set(LocalStorageKey.BackofficeLayersShowedOnMap, state.showedLayers)
        }
      }
    },

    resetShowedLayer(state) {
      state.showedLayers = []

      // TODO Use redux-persist to save showed layers.
      localStorageManager.set(LocalStorageKey.BackofficeLayersShowedOnMap, [])
    }
  }
})

export const backOfficeMainMapActions = backOfficeMainMapSlice.actions
export const backOfficeMainMapReducer = backOfficeMainMapSlice.reducer
