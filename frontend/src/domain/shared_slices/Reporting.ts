import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { CurrentAndArchivedReportingsOfSelectedVessel, Reporting } from '../types/reporting'
import type { VesselIdentity } from '../types/vessel'

export type ReportingState = {
  archivedReportingsFromDate: Date
  currentAndArchivedReportingsOfSelectedVessel: CurrentAndArchivedReportingsOfSelectedVessel | undefined
  currentReportings: Reporting[]
  editedReporting: Reporting | undefined
  editedReportingInSideWindow: Reporting | undefined
  // TODO Rename this prop.
  loadingReporting: boolean
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
  loadingReporting: false,
  vesselIdentity: undefined
}

const reportingSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reporting',
  reducers: {
    /**
     * Set the loading of reporting to true, and shows a loader in the reporting tab
     * @function loadReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     */
    loadReporting(state) {
      state.loadingReporting = true
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
      state.loadingReporting = false
    },

    /**
     * Set current reporting
     * @function setCurrentReportings
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Reporting[]}} action
     */
    setCurrentReportings(state, action) {
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
    setEditedReportingInSideWindow(state, action: PayloadAction<Reporting | undefined>) {
      state.editedReportingInSideWindow = action.payload
    },
    /**
     * Update a given current reporting
     * @function updateCurrentReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Reporting}} action - the reporting to update
     */
    updateCurrentReporting(state, action) {
      state.currentReportings = state.currentReportings
        .filter(reporting => reporting.id !== action.payload.id)
        .concat(action.payload)
    }
  }
})

export const {
  loadReporting,
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
