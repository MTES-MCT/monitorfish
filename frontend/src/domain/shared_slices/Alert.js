import { createSlice } from '@reduxjs/toolkit'
import { MenuSeaFronts } from '../../features/alert_list/alerts_window/AlertsWindow'

/* eslint-disable */
/** @namespace AlertReducer */
const AlertReducer = null
/* eslint-enable */

const alertSlice = createSlice({
  name: 'alert',
  initialState: {
    /** @type {Alert[]} alerts */
    alerts: [{
      id: 1,
      type: 'THREE_MILES_TRAWLING_ALERT',
      seaFront: MenuSeaFronts.MEMN,
      vesselName: 'PHENOMENE',
      flagState: 'FR',
      internalReferenceNumber: 'FAK000999999',
      externalReferenceNumber: 'DONTSINK',
      ircs: 'CALLME',
      dateTime: '2020-04-30T00:00:00.000Z',
      value: {
        speed: 2.56,
        incursionNumber: 5
      }
    },
    {
      id: 2,
      type: 'THREE_MILES_TRAWLING_ALERT',
      seaFront: MenuSeaFronts.NAMOSA,
      vesselName: 'PHENOMENE 2',
      flagState: 'FR',
      internalReferenceNumber: 'FAK000939999',
      externalReferenceNumber: 'DFGRG',
      ircs: 'CALLME',
      dateTime: '2020-04-30T00:00:00.000Z',
      value: {
        speed: 2.56,
        incursionNumber: 5
      }
    }],
    alertListIsOpen: false
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
    }
  }
})

export const {
  setAlerts,
  openAlertList,
  closeAlertList
} = alertSlice.actions

export default alertSlice.reducer
