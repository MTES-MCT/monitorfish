/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit'

/** @namespace ControlsReducer */
const ControlsReducer = null
/* eslint-disable */

const controlsSlice = createSlice({
  name: 'controls',
  initialState: {
    controlResumeAndControls: {},
    nextControlResumeAndControls: null,
    controlsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1)
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
      state.loadingVessel = null
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
    }
  }
})

export const {
  setControlResumeAndControls,
  setNextControlResumeAndControls,
  resetNextControlResumeAndControls,
  loadingControls,
  setControlFromDate
} = controlsSlice.actions

export default controlsSlice.reducer
