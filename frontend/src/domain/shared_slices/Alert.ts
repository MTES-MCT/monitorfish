import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { equals, reject } from 'ramda'

import type { PendingAlert, SilencedAlert } from '../types/alert'
import type { SelectedVessel } from '../types/vessel'

export type AlertState = {
  focusedPendingAlertId: string | undefined
  /** Pending alerts that were just silenced a few seconds ago */
  pendingAlertIdsBeingSilenced: string[]
  pendingAlerts: PendingAlert[]
  silencedAlerts: SilencedAlert[]
}
const INITIAL_STATE: AlertState = {
  focusedPendingAlertId: undefined,
  pendingAlertIdsBeingSilenced: [],
  pendingAlerts: [],
  silencedAlerts: []
}

const alertSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'alert',
  reducers: {
    addToPendingAlertsBeingSilenced(state, action: PayloadAction<string>) {
      state.pendingAlertIdsBeingSilenced = [...state.pendingAlertIdsBeingSilenced, action.payload]
    },

    /**
     * Focus a pending alert in the alert list
     */
    focusOnAlert(state, action: PayloadAction<SelectedVessel>) {
      const { externalReferenceNumber, internalReferenceNumber, ircs, name } = action.payload
      const foundPendingAlert = state.pendingAlerts.find(
        alert =>
          alert.value.type === name &&
          alert.internalReferenceNumber === internalReferenceNumber &&
          alert.externalReferenceNumber === externalReferenceNumber &&
          alert.ircs === ircs
      )
      if (!foundPendingAlert) {
        return
      }

      state.focusedPendingAlertId = foundPendingAlert.id
    },

    removeFromPendingAlertsBeingSilenced(state, action: PayloadAction<string>) {
      state.pendingAlertIdsBeingSilenced = reject(equals(action.payload))(state.pendingAlertIdsBeingSilenced)
    },

    /**
     * Reset focus on alert
     */
    resetFocusOnPendingAlert(state) {
      state.focusedPendingAlertId = undefined
    },

    /**
     * Set alerts
     */
    setPendingAlerts(state, action: PayloadAction<PendingAlert[]>) {
      state.pendingAlerts = action.payload
    },

    /**
     * Set silenced alerts
     */
    setSilencedAlerts(state, action: PayloadAction<SilencedAlert[]>) {
      state.silencedAlerts = action.payload
    }
  }
})

export const {
  addToPendingAlertsBeingSilenced,
  focusOnAlert,
  removeFromPendingAlertsBeingSilenced,
  resetFocusOnPendingAlert,
  setPendingAlerts,
  setSilencedAlerts
} = alertSlice.actions

export const alertReducer = alertSlice.reducer
