import { createSlice } from '@reduxjs/toolkit'

import { type Reporting, ReportingSearchPeriod, type ReportingsFilter } from './types'

import type { PayloadAction } from '@reduxjs/toolkit'

export type ReportingState = {
  editedReporting: Reporting.EditableReporting | undefined
  filters: ReportingsFilter
  selectedReportingFeatureId: string | undefined
}
const INITIAL_STATE: ReportingState = {
  editedReporting: undefined,
  filters: {
    endDate: undefined,
    ids: undefined,
    isArchived: undefined,
    isIUU: undefined,
    origin: undefined,
    reportingPeriod: ReportingSearchPeriod.LAST_3_MONTHS,
    reportingType: undefined,
    startDate: undefined,
    zone: undefined
  },
  selectedReportingFeatureId: undefined
}

const reportingSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reporting',
  reducers: {
    selectReportingFeatureId(state, action: PayloadAction<string>) {
      state.selectedReportingFeatureId = action.payload
    },

    setEditedReporting(state, action: PayloadAction<Reporting.EditableReporting>) {
      state.editedReporting = action.payload
    },

    setFilters(state, action: PayloadAction<ReportingsFilter>) {
      state.filters = action.payload
    },

    toggleSelectedReportingFeatureId(state, action: PayloadAction<string>) {
      if (state.selectedReportingFeatureId === action.payload) {
        state.selectedReportingFeatureId = undefined
      } else {
        state.selectedReportingFeatureId = action.payload
      }
    },

    unsetEditedReporting(state) {
      state.editedReporting = undefined
    },

    unsetSelectedReportingFeatureId(state) {
      state.selectedReportingFeatureId = undefined
    }
  }
})

export const reportingActions = reportingSlice.actions
export const reportingReducer = reportingSlice.reducer
