import { SEAFRONT_GROUP_SEAFRONTS, SeafrontGroup } from '@constants/seafront'
import { createSlice } from '@reduxjs/toolkit'
import { deleteListItems } from '@utils/deleteListItems'
import { propEq } from 'ramda'

import type { AlertSubMenu } from './constants'
import type {
  AlertNameAndVesselIdentity,
  AlertSpecification,
  LEGACY_PendingAlert,
  SilenceAlertQueueItem,
  SilencedAlert
} from '../../types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type AlertState = {
  editedAlertSpecification: AlertSpecification | undefined
  focusedPendingAlertId: number | undefined
  pendingAlerts: LEGACY_PendingAlert[]
  silencedAlerts: SilencedAlert[]
  silencedAlertsQueue: SilenceAlertQueueItem[]
  subMenu: AlertSubMenu
}
const INITIAL_STATE: AlertState = {
  editedAlertSpecification: undefined,
  focusedPendingAlertId: undefined,
  pendingAlerts: [],
  silencedAlerts: [],
  silencedAlertsQueue: [],
  subMenu: SeafrontGroup.MEMN
}

const slice = createSlice({
  initialState: INITIAL_STATE,
  name: 'alert',
  reducers: {
    addToPendingAlertsBeingSilenced(state, action: PayloadAction<SilenceAlertQueueItem>) {
      state.silencedAlertsQueue = [...state.silencedAlertsQueue, action.payload]
    },

    /**
     * Focus a pending alert in the alert list
     */
    focusOnAlert(state, action: PayloadAction<AlertNameAndVesselIdentity>) {
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

      const focusedPendingAlert = state.pendingAlerts.find(propEq(state.focusedPendingAlertId, 'id'))
      if (!focusedPendingAlert) {
        return
      }

      const seafrontGroup = (Object.keys(SEAFRONT_GROUP_SEAFRONTS) as SeafrontGroup[]).find(group => {
        if (
          focusedPendingAlert.value.seaFront &&
          SEAFRONT_GROUP_SEAFRONTS[group].includes(focusedPendingAlert.value.seaFront)
        ) {
          return group
        }

        return undefined
      })

      state.subMenu = seafrontGroup ?? SeafrontGroup.MEMN
    },

    /**
     * @param action - Original `PendingAlert.id`
     */
    removeFromSilencedAlertsQueue(state, action: PayloadAction<number>) {
      state.silencedAlertsQueue = deleteListItems(state.silencedAlertsQueue, 'pendingAlertId', action.payload)
    },

    /**
     * Reset focus on alert
     */
    resetFocusOnPendingAlert(state) {
      state.focusedPendingAlertId = undefined
    },

    setEditedAlertSpecification(state, action: PayloadAction<AlertSpecification | undefined>) {
      state.editedAlertSpecification = action.payload
    },

    /**
     * Set alerts
     */
    setPendingAlerts(state, action: PayloadAction<LEGACY_PendingAlert[]>) {
      state.pendingAlerts = action.payload
    },

    /**
     * Set silenced alerts
     */
    setSilencedAlerts(state, action: PayloadAction<SilencedAlert[]>) {
      state.silencedAlerts = action.payload
    },

    /**
     * Set sub menu
     */
    setSubMenu(state, action: PayloadAction<AlertSubMenu>) {
      state.subMenu = action.payload
    }
  }
})

export const {
  addToPendingAlertsBeingSilenced,
  focusOnAlert,
  removeFromSilencedAlertsQueue,
  resetFocusOnPendingAlert,
  setPendingAlerts,
  setSilencedAlerts,
  setSubMenu
} = slice.actions

export const alertReducer = slice.reducer
export const alertActions = slice.actions
