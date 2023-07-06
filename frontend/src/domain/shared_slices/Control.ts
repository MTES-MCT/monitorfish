import { createSlice } from '@reduxjs/toolkit'

import type { MissionAction } from '../types/missionAction'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ControlState = {
  controlsFromDate: Date
  currentControlSummary: MissionAction.MissionControlsSummary | null
  loadingControls: boolean
  nextControlSummary: MissionAction.MissionControlsSummary | null
}
const INITIAL_STATE: ControlState = {
  controlsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
  currentControlSummary: null,
  loadingControls: false,
  nextControlSummary: null
}

const controlSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'controls',
  reducers: {
    /**
     * Set the loading of controls to true, and shows a loader in the controls tab
     */
    loadControls(state) {
      state.loadingControls = true
    },

    /**
     * Reset the loading of controls
     */
    resetLoadControls(state) {
      state.loadingControls = false
    },

    resetNextControlSummary(state) {
      state.nextControlSummary = null
    },

    /**
     * Set the date since controls are fetched
     */
    setControlFromDate(state, action: PayloadAction<Date>) {
      state.controlsFromDate = action.payload
    },

    /**
     * Set selected vessel control resume and controls
     */
    setControlSummary(state, action: PayloadAction<MissionAction.MissionControlsSummary>) {
      state.currentControlSummary = action.payload
      state.loadingControls = false
    },

    setNextControlSummary(state, action: PayloadAction<MissionAction.MissionControlsSummary>) {
      state.nextControlSummary = action.payload
    },

    /**
     * Unset the control resume and controls
     */
    unsetControlSummary(state) {
      state.currentControlSummary = null
      state.loadingControls = false
    }
  }
})

export const {
  loadControls,
  resetLoadControls,
  resetNextControlSummary,
  setControlFromDate,
  setControlSummary,
  setNextControlSummary,
  unsetControlSummary
} = controlSlice.actions

export const controlReducer = controlSlice.reducer
