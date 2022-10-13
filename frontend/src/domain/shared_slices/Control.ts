import { createSlice } from '@reduxjs/toolkit'

import type { Controller, ControlResume } from '../types/control'

export type ControlState = {
  // TODO Understand & check that.
  controlResumeAndControls: Partial<ControlResume>
  controllers: Controller[]
  controlsFromDate: Date
  loadingControls: boolean
  nextControlResumeAndControls: ControlResume | null
}
const INITIAL_STATE: ControlState = {
  controllers: [],
  // TODO Understand & check that.
  controlResumeAndControls: {},
  controlsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
  loadingControls: false,
  nextControlResumeAndControls: null
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

    resetNextControlResumeAndControls(state) {
      state.nextControlResumeAndControls = null
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
     * @function setControlResumeAndControls
     * @memberOf ControlReducer
     * @param {Object=} state
     * @param {{payload: ControlResume}} action - the control resume
     */
    setControlResumeAndControls(state, action) {
      state.controlResumeAndControls = action.payload
      state.loadingControls = false
    },

    setNextControlResumeAndControls(state, action) {
      state.nextControlResumeAndControls = action.payload
    }
  }
})

export const {
  loadControls,
  resetNextControlResumeAndControls,
  setControlFromDate,
  setControllers,
  setControlResumeAndControls,
  setNextControlResumeAndControls
} = controlSlice.actions

export const controlReducer = controlSlice.reducer
