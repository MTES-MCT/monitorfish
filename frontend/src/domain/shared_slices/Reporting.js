import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace ReportingReducer */
const ReportingReducer = null
/* eslint-enable */

const reportingSlice = createSlice({
  name: 'reporting',
  initialState: {
    /** @type {CurrentAndArchivedReportings} */
    currentAndArchivedReportings: {
      current: [],
      archived: []
    },
    /** @type {Date} */
    archivedReportingsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
    loadingReporting: false,
    vesselIdentity: null,
    /** @type {Reporting[]} */
    currentReportings: [],
    editedReportingInSideWindow: undefined,
    editedReporting: undefined
  },
  reducers: {
    /**
     * Set current and archived reporting
     * @function setCurrentAndArchivedReportings
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: {
     *   currentAndArchivedReportings: CurrentAndArchivedReportings,
     *   vesselIdentity: VesselIdentity
     * }}} action - the reporting
     */
    setCurrentAndArchivedReportings (state, action) {
      state.currentAndArchivedReportings = action.payload.currentAndArchivedReportings
      state.vesselIdentity = action.payload.vesselIdentity
      state.loadingReporting = false
    },
    resetCurrentAndArchivedReportings (state) {
      state.currentAndArchivedReportings = null
      state.vesselIdentity = null
    },
    /**
     * Set the date since archived reporting are fetched
     * @function setArchivedReportingsFromDate
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setArchivedReportingsFromDate (state, action) {
      state.archivedReportingsFromDate = action.payload
    },
    /**
     * Set the loading of reporting to true, and shows a loader in the reporting tab
     * @function loadReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     */
    loadReporting (state) {
      state.loadingReporting = true
    },
    /**
     * Set current reporting
     * @function setCurrentReportings
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Reporting[]}} action
     */
    setCurrentReportings (state, action) {
      state.currentReportings = action.payload
    },
    /**
     * Remove reporting from current reporting
     * @function removeReportingsIdsFromCurrentReportings
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: number[]}} action - the ids of the reporting to remove
     */
    removeReportingsIdsFromCurrentReportings (state, action) {
      state.currentReportings = state.currentReportings
        .filter(reporting => !action.payload.find(reportingId => reportingId === reporting.id))
    },
    /**
     * Set the edited reporting in side window
     * @function setEditedReportingInSideWindow
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: boolean}} action
     */
    setEditedReportingInSideWindow (state, action) {
      state.editedReportingInSideWindow = action.payload
    },
    /**
     * Set the edited reporting
     * @function setEditedReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: boolean}} action
     */
    setEditedReporting (state, action) {
      state.editedReporting = action.payload
    },
    /**
     * Update a given current reporting
     * @function updateCurrentReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Reporting}} action - the reporting to update
     */
    updateCurrentReporting (state, action) {
      state.currentReportings = state.currentReportings
        .filter(reporting => reporting.id !== action.payload.id)
        .concat(action.payload)
    },
  }
})

export const {
  setCurrentAndArchivedReportings,
  resetCurrentAndArchivedReportings,
  setArchivedReportingsFromDate,
  loadReporting,
  setCurrentReportings,
  removeReportingsIdsFromCurrentReportings,
  setEditedReportingInSideWindow,
  updateCurrentReporting,
  setEditedReporting
} = reportingSlice.actions

export default reportingSlice.reducer
