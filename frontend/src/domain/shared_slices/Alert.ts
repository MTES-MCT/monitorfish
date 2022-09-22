import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { ActiveAlert, SilencedAlert } from '../types/alert'

export type AlertState = {
  alerts: ActiveAlert[]
  focusOnAlert: ActiveAlert | undefined
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
     */
    resetFocusOnAlert(state) {
      state.focusOnAlert = undefined
    },

    /**
     * Set alerts
     */
    setAlerts(state, action: PayloadAction<ActiveAlert[]>) {
      state.alerts = action.payload
    },

    /**
     * Set silenced alerts
     */
    setSilencedAlerts(state, action: PayloadAction<SilencedAlert[]>) {
      state.silencedAlerts = action.payload
    }
  }
})

export const { focusOnAlert, resetFocusOnAlert, setAlerts, setSilencedAlerts } = alertSlice.actions

export const alertReducer = alertSlice.reducer
