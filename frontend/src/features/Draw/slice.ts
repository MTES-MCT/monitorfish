import { createSlice } from '@reduxjs/toolkit'

import type { InteractionListener, InteractionType } from '@features/Map/constants'
import type { MonitorFishMap } from '@features/Map/Map.types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Geometry } from 'geojson'

export type DrawState = {
  drawedGeometry: Geometry | undefined
  initialGeometry: Geometry | undefined
  interactionType: InteractionType | undefined
  listener: InteractionListener | undefined
}
const INITIAL_STATE: DrawState = {
  drawedGeometry: undefined,
  initialGeometry: undefined,
  interactionType: undefined,
  listener: undefined
}

const drawReducerSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'draw',
  reducers: {
    resetGeometry(state) {
      state.drawedGeometry = undefined
      state.initialGeometry = undefined
    },

    /**
     * Reset the interaction with the OpenLayers map
     */
    resetInteraction(state) {
      state.interactionType = undefined
      state.listener = undefined
      state.drawedGeometry = undefined
      state.initialGeometry = undefined
    },

    setDrawedGeometry(state, action: PayloadAction<Geometry>) {
      state.drawedGeometry = action.payload
    },

    /**
     * Set the initial geometry to edit with <DrawLayer/>
     */
    setInitialGeometry(state, action: PayloadAction<Geometry>) {
      state.initialGeometry = action.payload
    },

    /**
     * Changes the interaction type
     * @see InteractionType
     */
    setInteractionType(state, action: PayloadAction<InteractionType>) {
      state.interactionType = action.payload
    },

    /**
     * Start an interaction with the OpenLayers map, hence use the mouse to draw geometries
     */
    setInteractionTypeAndListener(state, action: PayloadAction<MonitorFishMap.InteractionTypeAndListener>) {
      state.interactionType = action.payload.type
      state.listener = action.payload.listener
    }
  }
})

export const {
  resetInteraction,
  setDrawedGeometry,
  setInitialGeometry,
  setInteractionType,
  setInteractionTypeAndListener
} = drawReducerSlice.actions

export const drawActions = drawReducerSlice.actions
export const drawReducer = drawReducerSlice.reducer
