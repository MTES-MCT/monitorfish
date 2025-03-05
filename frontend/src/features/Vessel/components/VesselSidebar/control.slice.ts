import { customDayjs } from '@mtes-mct/monitor-ui'
import { createSlice } from '@reduxjs/toolkit'

import type { MissionAction } from '@features/Mission/missionAction.types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ControlState = {
  controlsFromDate: string
  currentControlSummary: MissionAction.MissionControlsSummary | undefined
  isLoadingControls: boolean
}
const INITIAL_STATE: ControlState = {
  controlsFromDate: customDayjs().utc().subtract(5, 'year').startOf('year').toISOString(),
  currentControlSummary: undefined,
  isLoadingControls: false
}

const controlSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'controls',
  reducers: {
    /**
     * Set the loading of controls to true, and shows a loader in the controls tab
     */
    loadControls(state) {
      state.isLoadingControls = true
    },

    /**
     * Reset the loading of controls
     */
    resetLoadControls(state) {
      state.isLoadingControls = false
    },

    /**
     * Set the date since controls are fetched
     */
    setControlFromDate(state, action: PayloadAction<string>) {
      state.controlsFromDate = action.payload
    },

    /**
     * Set selected vessel control resume and controls
     */
    setControlSummary(state, action: PayloadAction<MissionAction.MissionControlsSummary>) {
      state.currentControlSummary = action.payload
      state.isLoadingControls = false
    },

    /**
     * Unset the control resume and controls
     */
    unsetControlSummary(state) {
      state.currentControlSummary = undefined
      state.isLoadingControls = false
    }
  }
})

export const { loadControls, resetLoadControls, setControlFromDate, setControlSummary, unsetControlSummary } =
  controlSlice.actions

export const controlReducer = controlSlice.reducer
