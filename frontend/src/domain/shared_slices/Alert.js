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
    alertListIsOpen: false,
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
     * Open alert list
     * @function openAlertList
     * @memberOf AlertReducer
     * @param {Object=} state
     */
    openAlertList (state) {
      state.alertListIsOpen = true
    },
    /**
     * Close alert list
     * @function closeAlertList
     * @memberOf AlertReducer
     * @param {Object=} state
     */
    closeAlertList (state) {
      state.alertListIsOpen = false
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
        alert.name === name &&
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
    }
  }
})

export const {
  setAlerts,
  openAlertList,
  closeAlertList,
  focusOnAlert,
  resetFocusOnAlert
} = alertSlice.actions

export default alertSlice.reducer
