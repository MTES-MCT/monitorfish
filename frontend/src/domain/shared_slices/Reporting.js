import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace ReportingReducer */
const ReportingReducer = null
/* eslint-enable */

const reportingSlice = createSlice({
  initialState: {
    /** @type {Date} */
    archivedReportingsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),

    /** @type {CurrentAndArchivedReportings} */
    currentAndArchivedReportings: {
      archived: [],
      current: [
        {
          creationDate: new Date(),
          externalReferenceNumber: '',
          id: '1',
          internalReferenceNumber: '',
          ircs: '',
          type: 'ALERT',
          validationDate: new Date(),
          value: {
            type: 'THREE_MILES_TRAWLING_ALERT',
          },
          vesselIdentifier: '',
          vesselName: '',
        },
        {
          creationDate: new Date(),
          externalReferenceNumber: '',
          id: '2',
          internalReferenceNumber: '',
          ircs: '',
          type: 'OBSERVATION',
          validationDate: new Date(),
          value: {
            type: 'GEAR',
          },
          vesselIdentifier: '',
          vesselName: '',
        },
      ],
    },
    loadingReporting: false,
    vesselIdentity: null,
  },
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

    resetCurrentAndArchivedReportings(state) {
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
    setArchivedReportingsFromDate(state, action) {
      state.archivedReportingsFromDate = action.payload
    },

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
    setCurrentAndArchivedReportings(state, action) {
      state.currentAndArchivedReportings = action.payload.currentAndArchivedReportings
      state.vesselIdentity = action.payload.vesselIdentity
      state.loadingReporting = false
    },
  },
})

export const {
  loadReporting,
  resetCurrentAndArchivedReportings,
  setArchivedReportingsFromDate,
  setCurrentAndArchivedReportings,
} = reportingSlice.actions

export default reportingSlice.reducer
