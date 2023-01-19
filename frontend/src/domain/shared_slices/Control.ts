import { createSlice } from '@reduxjs/toolkit'

import type { Controller, ControlSummary } from '../types/missionAction'

export type ControlState = {
  controllers: Controller[]
  controlsFromDate: Date
  // TODO Understand & check that.
  currentControlSummary: ControlSummary | null
  loadingControls: boolean
  nextControlSummary: ControlSummary | null
}
const INITIAL_STATE: ControlState = {
  controllers: [],

  controlsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
  // TODO Understand & check that.
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
     * @function loadControls
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
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setControlFromDate(state, action) {
      state.controlsFromDate = action.payload
    },

    /**
     * Set controllers
     * @function setControllers
     * @param {Object=} state
     * @param {{payload: Controller[]}} action - the controllers
     */
    setControllers(state, action) {
      state.controllers = action.payload
    },

    /**
     * Set selected vessel control resume and control
     * @function setControlSummary
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
