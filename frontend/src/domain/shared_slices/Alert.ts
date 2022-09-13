import { createSlice } from '@reduxjs/toolkit'

import type { Alert, SilencedAlert } from '../types/alert'

export type AlertState = {
  alerts: Alert[]
  focusOnAlert: Alert | undefined
  silencedAlerts: SilencedAlert[]
}
const INITIAL_STATE: AlertState = {
  alerts: [],
  focusOnAlert: undefined,
  silencedAlerts: []
}

const alertSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'alert',
  reducers: {
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
    focusOnAlert(state, action) {
      const { externalReferenceNumber, internalReferenceNumber, ircs, name } = action.payload

      // TODO Clarify that (what, undefined?).
      state.focusOnAlert = state.alerts.find(
        alert =>
          alert.value.type === name &&
          alert.internalReferenceNumber === internalReferenceNumber &&
          alert.externalReferenceNumber === externalReferenceNumber &&
          alert.ircs === ircs
      )
    },

    /**
     * Reset focus on alert
     * @function setFocusOnAlert
     * @memberOf AlertReducer
     * @param {Object=} state
     */
    resetFocusOnAlert(state) {
      state.focusOnAlert = undefined
    },

    /**
     * Set alerts
     * @function setAlerts
     * @memberOf AlertReducer
     * @param {Object=} state
     * @param {{payload: Alert[]}} action - The alerts
     */
    setAlerts(state, action) {
      state.alerts = action.payload
    },
    /**
     * Set silenced alerts
     * @function setSilencedAlerts
     * @memberOf AlertReducer
     * @param {Object=} state
     * @param {{payload: SilencedAlert[]}} action - The silenced alerts
     */
    setSilencedAlerts(state, action) {
      state.silencedAlerts = action.payload
    }
  }
})

export const { focusOnAlert, resetFocusOnAlert, setAlerts, setSilencedAlerts } = alertSlice.actions

export const alertReducer = alertSlice.reducer
