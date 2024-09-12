import { customDayjs } from '@mtes-mct/monitor-ui'
import { createSlice } from '@reduxjs/toolkit'

import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type {
  VesselReportings,
  EditableReporting,
  InfractionSuspicionReporting,
  PendingAlertReporting
} from '@features/Reporting/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Dayjs } from 'dayjs'

export type ReportingState = {
  archivedReportingsFromDate: Dayjs
  currentReportings: Array<InfractionSuspicionReporting | PendingAlertReporting>
  editedReporting: EditableReporting | undefined
  editedReportingInSideWindow: EditableReporting | undefined
  isLoadingReporting: boolean
  selectedVesselReportings: VesselReportings | undefined
  vesselIdentity: VesselIdentity | undefined
}
const INITIAL_STATE: ReportingState = {
  archivedReportingsFromDate: customDayjs().utc().subtract(5, 'year').startOf('year'),
  currentReportings: [],
  editedReporting: undefined,
  editedReportingInSideWindow: undefined,
  isLoadingReporting: false,
  selectedVesselReportings: undefined,
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

    resetSelectedVesselReportings(state) {
      state.selectedVesselReportings = undefined
      state.vesselIdentity = undefined
      state.isLoadingReporting = false
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
    setEditedReportingInSideWindow(state, action: PayloadAction<EditableReporting | undefined>) {
      state.editedReportingInSideWindow = action.payload
    },

    setSelectedVesselReportings(
      state,
      action: PayloadAction<{ selectedVesselReportings: VesselReportings; vesselIdentity: VesselIdentity }>
    ) {
      state.selectedVesselReportings = action.payload.selectedVesselReportings
      state.vesselIdentity = action.payload.vesselIdentity
      state.isLoadingReporting = false
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
  resetSelectedVesselReportings,
  setArchivedReportingsFromDate,
  setCurrentReportings,
  setEditedReporting,
  setEditedReportingInSideWindow,
  setSelectedVesselReportings,
  updateCurrentReporting
} = reportingSlice.actions

export const reportingReducer = reportingSlice.reducer
