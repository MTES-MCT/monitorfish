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
    /** @type {CurrentAndArchivedReporting || null} */
    nextCurrentAndArchivedReporting: null,
    /** @type {Date} */
    archivedReportingFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
    loadingReporting: false,
    vesselIdentity: null
  },
  reducers: {
    /**
     * Set current and archived reporting
     * @function setCurrentAndArchivedReporting
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: {
     *   currentAndArchivedReporting: CurrentAndArchivedReporting,
     *   vesselIdentity: VesselIdentity
     * }}} action - the reporting
     */
    setCurrentAndArchivedReporting (state, action) {
      state.currentAndArchivedReporting = action.payload.currentAndArchivedReporting
      state.vesselIdentity = action.payload.vesselIdentity
      state.loadingReporting = false
    },
    resetCurrentAndArchivedReporting (state) {
      state.currentAndArchivedReporting = null
      state.vesselIdentity = null
    },
    setNextCurrentAndArchivedReporting (state, action) {
      state.nextCurrentAndArchivedReporting = action.payload
    },
    resetNextCurrentAndArchivedReporting (state) {
      state.nextCurrentAndArchivedReporting = null
    },
    /**
     * Set the date since archived reporting are fetched
     * @function setArchivedReportingFromDate
     * @memberOf ReportingReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setArchivedReportingFromDate (state, action) {
      state.archivedReportingFromDate = action.payload
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
  resetCurrentAndArchivedReporting,
  setNextCurrentAndArchivedReporting,
  resetNextCurrentAndArchivedReporting,
  setArchivedReportingFromDate,
  loadReporting
} = reportingSlice.actions

export default reportingSlice.reducer
