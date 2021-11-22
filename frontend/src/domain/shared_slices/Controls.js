import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace ControlsReducer */
const ControlsReducer = null
/* eslint-enable */

const controlsSlice = createSlice({
  name: 'controls',
  initialState: {
    controlResumeAndControls: {},
    nextControlResumeAndControls: null,
    controlsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
    loadingControls: false
  },
  reducers: {
    /**
     * Set selected vessel control resume and control
     * @function setControlResumeAndControls
     * @memberOf ControlsReducer
     * @param {Object=} state
     * @param {{payload: ControlResume}} action - the control resume
     */
    setControlResumeAndControls (state, action) {
      state.controlResumeAndControls = action.payload
      state.loadingControls = false
    },
    setNextControlResumeAndControls (state, action) {
      state.nextControlResumeAndControls = action.payload
    },
    resetNextControlResumeAndControls (state) {
      state.nextControlResumeAndControls = null
    },
    /**
     * Set the date since controls are fetched
     * @function setControlFromDate
     * @memberOf ControlsReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setControlFromDate (state, action) {
      state.controlsFromDate = action.payload
    },
    /**
     * Set the loading of controls to true, and shows a loader in the controls tab
     * @function loadControls
     * @memberOf ControlsReducer
     * @param {Object=} state
     */
    loadControls (state) {
      state.loadingControls = true
    }
  }
})

export const {
  setControlResumeAndControls,
  setNextControlResumeAndControls,
  resetNextControlResumeAndControls,
  loadControls,
  setControlFromDate
} = controlsSlice.actions

export default controlsSlice.reducer
