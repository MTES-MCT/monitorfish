import { customDayjs } from '@mtes-mct/monitor-ui'
import { createSlice } from '@reduxjs/toolkit'

import type { VesselReportings, Reporting } from './types'
import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ReportingState = {
  archivedReportingsFromDate: string
  currentReportings: Reporting.Reporting[]
  editedReporting: Reporting.EditableReporting | undefined
  // TODO Use `sideWindowReportingSlice.ts` instead of this prop.
  editedReportingInSideWindow: Reporting.EditableReporting | undefined
  isLoadingReporting: boolean
  selectedVesselReportings: VesselReportings | undefined
  vesselIdentity: VesselIdentity | undefined
}
const INITIAL_STATE: ReportingState = {
  archivedReportingsFromDate: customDayjs().utc().subtract(5, 'year').startOf('year').toISOString(),
  currentReportings: [],
  editedReporting: undefined,
  editedReportingInSideWindow: undefined,
  isLoadingReporting: false,
  selectedVesselReportings: undefined,
  vesselIdentity: undefined
}

const mainWindowReportingSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reporting',
  reducers: {
    /**
     * Add a new reporting
     */
    addReportingToCurrentReportings(state, action: PayloadAction<Reporting.Reporting>) {
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
     */
    removeReportingsIdsFromCurrentReportings(state, action: PayloadAction<number[]>) {
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
     */
    setArchivedReportingsFromDate(state, action: PayloadAction<string>) {
      state.archivedReportingsFromDate = action.payload
    },

    /**
     * Set current reporting
     */
    setCurrentReportings(state, action: PayloadAction<Reporting.Reporting[]>) {
      state.currentReportings = action.payload
    },

    /**
     * Set the edited reporting
     */
    setEditedReporting(state, action: PayloadAction<Reporting.EditableReporting | undefined>) {
      state.editedReporting = action.payload
    },

    /**
     * Set the edited reporting in side window
     */
    setEditedReportingInSideWindow(state, action: PayloadAction<Reporting.EditableReporting | undefined>) {
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
    updateCurrentReporting(state, action: PayloadAction<Reporting.Reporting>) {
      state.currentReportings = state.currentReportings
        .filter(reporting => reporting.id !== action.payload.id)
        .concat(action.payload)
    }
  }
})

export const mainWindowReportingActions = mainWindowReportingSlice.actions
export const mainWindowReportingReducer = mainWindowReportingSlice.reducer
