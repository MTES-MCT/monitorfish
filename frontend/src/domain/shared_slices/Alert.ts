import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { deleteListItems } from '../../utils/deleteListItems'

import type { PendingAlert, SilenceAlertQueueItem, SilencedAlert } from '../types/alert'
import type { SelectedVessel } from '../types/vessel'

export type AlertState = {
  focusedPendingAlertId: string | undefined
  pendingAlerts: PendingAlert[]
  silencedAlerts: SilencedAlert[]
  silencedAlertsQueue: SilenceAlertQueueItem[]
}
const INITIAL_STATE: AlertState = {
  focusedPendingAlertId: undefined,
  pendingAlerts: [],
  silencedAlerts: [],
  silencedAlertsQueue: []
}

const alertSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'alert',
  reducers: {
    addToPendingAlertsBeingSilenced(state, action: PayloadAction<SilenceAlertQueueItem>) {
      state.silencedAlertsQueue = [...state.silencedAlertsQueue, action.payload]
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

    /**
     * @param action - Original `PendingAlert.id`
     */
    removeFromSilencedAlertsQueue(state, action: PayloadAction<string>) {
      state.silencedAlertsQueue = deleteListItems(state.silencedAlertsQueue, 'pendingAlertId', action.payload)
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
  removeFromSilencedAlertsQueue,
  resetFocusOnPendingAlert,
  setPendingAlerts,
  setSilencedAlerts
} = alertSlice.actions

export const alertReducer = alertSlice.reducer
