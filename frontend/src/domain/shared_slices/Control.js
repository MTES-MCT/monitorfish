import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace ControlReducer */
const ControlReducer = null
/* eslint-enable */

const controlSlice = createSlice({
  initialState: {
    controllers: [],

    /** @type {ControlResume} */
    controlResumeAndControls: {},

    /** @type {Date} */
    controlsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),

    loadingControls: false,
    /** @type {ControlResume || null} */
    nextControlResumeAndControls: null,
  },
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
    },
  },
})

export const {
  loadControls,
  resetNextControlResumeAndControls,
  setControlFromDate,
  setControllers,
  setControlResumeAndControls,
  setNextControlResumeAndControls,
} = controlSlice.actions

export default controlSlice.reducer
