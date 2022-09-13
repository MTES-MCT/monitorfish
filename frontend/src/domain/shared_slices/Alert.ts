import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace AlertReducer */
const AlertReducer = null
/* eslint-enable */

const alertSlice = createSlice({
  name: 'alert',
  initialState: {
    /** @type {Alert[]} alerts */
    alerts: [],
    /** @type {SilencedAlert[]} silencedAlerts */
    silencedAlerts: [],
    /** @type {Alert | null} focusOnAlert */
    focusOnAlert: null
  },
  reducers: {
    /**
     * Set alerts
     * @function setAlerts
     * @memberOf AlertReducer
     * @param {Object=} state
     * @param {{payload: Alert[]}} action - The alerts
     */
    setAlerts (state, action) {
      state.alerts = action.payload
    },
    /**
     * Focus on alert in the alert list
     * @function setFocusOnAlert
     * @memberOf AlertReducer
     * @param {Object=} state
     * @param {{payload: {
     *   name: string,
     *   internalReferenceNumber: string,
     *   externalReferenceNumber: string,
     *   ircs: string,
     * }}} action - An alert to be focused on
     */
    focusOnAlert (state, action) {
      const {
        name,
        internalReferenceNumber,
        externalReferenceNumber,
        ircs
      } = action.payload

      state.focusOnAlert = state.alerts.find(alert =>
        alert.value.type === name &&
        alert.internalReferenceNumber === internalReferenceNumber &&
        alert.externalReferenceNumber === externalReferenceNumber &&
        alert.ircs === ircs)
    },
    /**
     * Reset focus on alert
     * @function setFocusOnAlert
     * @memberOf AlertReducer
     * @param {Object=} state
     */
    resetFocusOnAlert (state) {
      state.focusOnAlert = null
    },
    /**
     * Set silenced alerts
     * @function setSilencedAlerts
     * @memberOf AlertReducer
     * @param {Object=} state
     * @param {{payload: SilencedAlert[]}} action - The silenced alerts
     */
    setSilencedAlerts (state, action) {
      state.silencedAlerts = action.payload
    }
  }
})

export const {
  setAlerts,
  focusOnAlert,
  resetFocusOnAlert,
  setSilencedAlerts
} = alertSlice.actions

export default alertSlice.reducer
