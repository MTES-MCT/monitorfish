import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace ReportingReducer */
const ReportingReducer = null
/* eslint-enable */

const reportingSlice = createSlice({
  name: 'reporting',
  initialState: {
    /** @type {CurrentAndArchivedReporting} */
    currentAndArchivedReporting: {
      current: [
        {
          id: '1',
          type: 'ALERT',
          vesselName: '',
          internalReferenceNumber: '',
          externalReferenceNumber: '',
          ircs: '',
          vesselIdentifier: '',
          creationDate: new Date(),
          validationDate: new Date(),
          value: {
            type: 'THREE_MILES_TRAWLING_ALERT'
          }
        },
        {
          id: '2',
          type: 'OBSERVATION',
          vesselName: '',
          internalReferenceNumber: '',
          externalReferenceNumber: '',
          ircs: '',
          vesselIdentifier: '',
          creationDate: new Date(),
          validationDate: new Date(),
          value: {
            type: 'GEAR'
          }
        }
      ],
      archived: []
    },
    /** @type {Reporting || null} */
    nextCurrentAndArchivedReporting: null,
    /** @type {Date} */
    reportingArchivedFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
    loadingReporting: false
  },
  reducers: {
    /**
     * Set current and archived reporting
     * @function setCurrentAndArchivedReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Reporting}} action - the reporting
     */
    setCurrentAndArchivedReporting (state, action) {
      state.currentAndArchivedReporting = action.payload
      state.loadingReporting = false
    },
    setNextCurrentAndArchivedReporting (state, action) {
      state.nextCurrentAndArchivedReporting = action.payload
    },
    resetNextCurrentAndArchivedReporting (state) {
      state.nextCurrentAndArchivedReporting = null
    },
    /**
     * Set the date since reporting archive is fetched
     * @function setReportingFromDate
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setReportingFromDate (state, action) {
      state.reportingArchivedFromDate = action.payload
    },
    /**
     * Set the loading of reporting to true, and shows a loader in the reporting tab
     * @function loadReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     */
    loadReporting (state) {
      state.loadingReporting = true
    }
  }
})

export const {
  setCurrentAndArchivedReporting,
  setNextCurrentAndArchivedReporting,
  resetNextCurrentAndArchivedReporting,
  setReportingFromDate,
  loadReporting
} = reportingSlice.actions

export default reportingSlice.reducer
