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
    /** @type {Date} */
    archivedReportingsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
    loadingReporting: false,
    vesselIdentity: null
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
    }
  }
})

export const {
  setCurrentAndArchivedReportings,
  resetCurrentAndArchivedReportings,
  setArchivedReportingsFromDate,
  loadReporting
} = reportingSlice.actions

export default reportingSlice.reducer
