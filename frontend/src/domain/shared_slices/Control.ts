import { createSlice } from '@reduxjs/toolkit'

import type { Controller, ControlSummary } from '../types/control'

export type ControlState = {
  controllers: Controller[]
  controlsFromDate: Date
  // TODO Understand & check that.
  currentControlSummary: Partial<ControlSummary>
  loadingControls: boolean
  nextControlSummary: ControlSummary | null
}
const INITIAL_STATE: ControlState = {
  controllers: [],

  controlsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
  // TODO Understand & check that.
  currentControlSummary: {},
  loadingControls: false,
  nextControlSummary: null
}

const controlSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'controls',
  reducers: {
    /**
     * Set the loading of controls to true, and shows a loader in the controls tab
     * @function loadControls
     * @memberOf ControlReducer
     * @param {Object=} state
     */
    loadControls(state) {
      state.loadingControls = true
    },

    resetNextControlSummary(state) {
      state.nextControlSummary = null
    },

    /**
     * Set the date since controls are fetched
     * @function setControlFromDate
     * @memberOf ControlReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setControlFromDate(state, action) {
      state.controlsFromDate = action.payload
    },

    /**
     * Set controllers
     * @function setControllers
     * @memberOf ControlReducer
     * @param {Object=} state
     * @param {{payload: Controller[]}} action - the controllers
     */
    setControllers(state, action) {
      state.controllers = action.payload
    },

    /**
     * Set selected vessel control resume and control
     * @function setControlSummary
     * @memberOf ControlReducer
     * @param {Object=} state
     * @param {{payload: ControlSummary}} action - the control resume
     */
    setControlSummary(state, action) {
      state.currentControlSummary = action.payload
      state.loadingControls = false
    },

    setNextControlSummary(state, action) {
      state.nextControlSummary = action.payload
    }
  }
})

export const {
  loadControls,
  resetNextControlSummary,
  setControlFromDate,
  setControllers,
  setControlSummary,
  setNextControlSummary
} = controlSlice.actions

export const controlReducer = controlSlice.reducer
