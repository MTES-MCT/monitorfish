import { customDayjs } from '@mtes-mct/monitor-ui'
import { createSlice } from '@reduxjs/toolkit'

import type { MissionAction } from '@features/Mission/missionAction.types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Dayjs } from 'dayjs'

export type ControlState = {
  controlsFromDate: Dayjs
  currentControlSummary: MissionAction.MissionControlsSummary | null
  loadingControls: boolean
  nextControlSummary: MissionAction.MissionControlsSummary | null
}
const INITIAL_STATE: ControlState = {
  controlsFromDate: customDayjs().utc().subtract(5, 'year').startOf('year'),
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
    setControlFromDate(state, action: PayloadAction<Dayjs>) {
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
