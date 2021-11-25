import { createSlice } from '@reduxjs/toolkit'
import { MenuSeaFronts } from '../../features/alerts/alerts_window/AlertsWindow'

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
      seaFront: MenuSeaFronts.MEMN,
      vesselName: 'PHENOMENE',
      flagState: 'FR',
      internalReferenceNumber: 'FRA000021705',
      dateTime: '2020-04-30T00:00:00.000Z',
      value: {
        speed: 2.56,
        incursionNumber: 5
      }
    },
    {
      id: 2,
      seaFront: MenuSeaFronts.NAMOSA,
      vesselName: 'PHENOMENE 2',
      flagState: 'FR',
      internalReferenceNumber: 'FRA000021705',
      dateTime: '2020-04-30T00:00:00.000Z',
      value: {
        speed: 2.56,
        incursionNumber: 5
      }
    }]
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
    }
  }
})

export const {
  setAlerts
} = alertSlice.actions

export default alertSlice.reducer
