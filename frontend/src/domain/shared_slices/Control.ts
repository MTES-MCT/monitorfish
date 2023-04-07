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
     * Set selected vessel control resume and control
     */
    setControlSummary(state, action: PayloadAction<MissionAction.MissionControlsSummary>) {
      state.currentControlSummary = action.payload
      state.loadingControls = false
    },

    setNextControlSummary(state, action: PayloadAction<MissionAction.MissionControlsSummary>) {
      state.nextControlSummary = action.payload
    }
  }
})

export const { loadControls, resetNextControlSummary, setControlFromDate, setControlSummary, setNextControlSummary } =
  controlSlice.actions

export const controlReducer = controlSlice.reducer
