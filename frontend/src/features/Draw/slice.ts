import { createSlice } from '@reduxjs/toolkit'

import type { InteractionListener, InteractionType } from '../../domain/entities/map/constants'
import type { GeoJSON, GeoJSON as GeoJSONType } from '../../domain/types/GeoJSON'
import type { InteractionTypeAndListener } from '../../domain/types/map'
import type { PayloadAction } from '@reduxjs/toolkit'

export type DrawState = {
  drawedGeometry: GeoJSON.Geometry | undefined
  initialGeometry: GeoJSON.Geometry | undefined
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

    setDrawedGeometry(state, action: PayloadAction<GeoJSONType.Geometry>) {
      state.drawedGeometry = action.payload
    },

    /**
     * Set the initial geometry to edit with <DrawLayer/>
     */
    setInitialGeometry(state, action: PayloadAction<GeoJSONType.Geometry>) {
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
    setInteractionTypeAndListener(state, action: PayloadAction<InteractionTypeAndListener>) {
      state.interactionType = action.payload.type
      state.listener = action.payload.listener
    }
  }
})

export const {
  resetGeometry,
  resetInteraction,
  setDrawedGeometry,
  setInitialGeometry,
  setInteractionType,
  setInteractionTypeAndListener
} = drawReducerSlice.actions

export const drawReducer = drawReducerSlice.reducer
