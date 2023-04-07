import { createSlice } from '@reduxjs/toolkit'

import type { VesselIdentity } from '../entities/vessel/types'
import type {
  CurrentAndArchivedReportingsOfSelectedVessel,
  InfractionSuspicionReporting,
  PendingAlertReporting
} from '../types/reporting'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ReportingState = {
  archivedReportingsFromDate: Date
  currentAndArchivedReportingsOfSelectedVessel: CurrentAndArchivedReportingsOfSelectedVessel | undefined
  currentReportings: Array<InfractionSuspicionReporting | PendingAlertReporting>
  editedReporting: InfractionSuspicionReporting | PendingAlertReporting | undefined
  editedReportingInSideWindow: InfractionSuspicionReporting | PendingAlertReporting | undefined
  isLoadingReporting: boolean
  vesselIdentity: VesselIdentity | undefined
}
const INITIAL_STATE: ReportingState = {
  archivedReportingsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
  currentAndArchivedReportingsOfSelectedVessel: {
    archived: [],
    current: []
  },
  currentReportings: [],
  editedReporting: undefined,
  editedReportingInSideWindow: undefined,
  isLoadingReporting: false,
  vesselIdentity: undefined
}

const reportingSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reporting',
  reducers: {
    /**
     * Add a new reporting
     * @function setCurrentReportings
     * @param {Object=} state
     * @param {{payload: Reporting}} action
     */
    addReportingToCurrentReportings(state, action) {
      state.currentReportings = state.currentReportings.concat(action.payload)
    },

    /**
     * Set the loading of reporting to true, and shows a loader in the reporting tab
     * @function loadReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     */
    loadReporting(state) {
      state.isLoadingReporting = true
    },

    /**
     * Remove a given current reporting
     */
    removeCurrentReporting(state, action: PayloadAction<number>) {
      state.currentReportings = state.currentReportings.filter(reporting => reporting.id !== action.payload)
    },

    /**
     * Remove reporting from current reporting
     * @function removeReportingsIdsFromCurrentReportings
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: number[]}} action - the ids of the reporting to remove
     */
    removeReportingsIdsFromCurrentReportings(state, action) {
      state.currentReportings = state.currentReportings.filter(
        reporting => !action.payload.find(reportingId => reportingId === reporting.id)
      )
    },

    resetCurrentAndArchivedReportingsOfSelectedVessel(state) {
      state.currentAndArchivedReportingsOfSelectedVessel = undefined
      state.vesselIdentity = undefined
    },

    /**
     * Set the date since archived reporting are fetched
     * @function setArchivedReportingsFromDate
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setArchivedReportingsFromDate(state, action) {
      state.archivedReportingsFromDate = action.payload
    },

    /**
     * Set current and archived reporting
     * @function setCurrentAndArchivedReportingsOfSelectedVessel
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: {
     *   currentAndArchivedReportingsOfSelectedVessel: CurrentAndArchivedReportingsOfSelectedVessel,
     *   vesselIdentity: VesselIdentity
     * }}} action - the reporting
     */
    setCurrentAndArchivedReportingsOfSelectedVessel(state, action) {
      state.currentAndArchivedReportingsOfSelectedVessel = action.payload.currentAndArchivedReportingsOfSelectedVessel
      state.vesselIdentity = action.payload.vesselIdentity
      state.isLoadingReporting = false
    },

    /**
     * Set current reporting
     */
    setCurrentReportings(state, action: PayloadAction<Array<InfractionSuspicionReporting | PendingAlertReporting>>) {
      state.currentReportings = action.payload
    },

    /**
     * Set the edited reporting
     * @function setEditedReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: boolean}} action
     */
    setEditedReporting(state, action) {
      state.editedReporting = action.payload
    },

    /**
     * Set the edited reporting in side window
     */
    setEditedReportingInSideWindow(
      state,
      action: PayloadAction<InfractionSuspicionReporting | PendingAlertReporting | undefined>
    ) {
      state.editedReportingInSideWindow = action.payload
    },

    /**
     * Update a given current reporting
     */
    updateCurrentReporting(state, action: PayloadAction<InfractionSuspicionReporting>) {
      state.currentReportings = state.currentReportings
        .filter(reporting => reporting.id !== action.payload.id)
        .concat(action.payload)
    }
  }
})

export const {
  addReportingToCurrentReportings,
  loadReporting,
  removeCurrentReporting,
  removeReportingsIdsFromCurrentReportings,
  resetCurrentAndArchivedReportingsOfSelectedVessel,
  setArchivedReportingsFromDate,
  setCurrentAndArchivedReportingsOfSelectedVessel,
  setCurrentReportings,
  setEditedReporting,
  setEditedReportingInSideWindow,
  updateCurrentReporting
} = reportingSlice.actions

export const reportingReducer = reportingSlice.reducer
