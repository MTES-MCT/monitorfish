import { createSlice } from '@reduxjs/toolkit'

import { type ApiSearchFilter, type Reporting, ReportingSearchPeriod } from './types'

import type { PayloadAction } from '@reduxjs/toolkit'

export type ReportingState = {
  displayFilters: ApiSearchFilter
  editedReporting: Reporting.EditableReporting | undefined
  selectedReportingFeatureId: string | undefined
}
const INITIAL_STATE: ReportingState = {
  displayFilters: {
    endDate: undefined,
    ids: undefined,
    isArchived: undefined,
    isIUU: undefined,
    reportingPeriod: ReportingSearchPeriod.LAST_3_MONTHS,
    reportingType: undefined,
    startDate: undefined
  },
  editedReporting: undefined,
  selectedReportingFeatureId: undefined
}

const reportingSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reporting',
  reducers: {
    selectReportingFeatureId(state, action: PayloadAction<string>) {
      state.selectedReportingFeatureId = action.payload
    },

    setDisplayFilters(state, action: PayloadAction<ApiSearchFilter>) {
      state.displayFilters = action.payload
    },

    setEditedReporting(state, action: PayloadAction<Reporting.EditableReporting>) {
      state.editedReporting = action.payload
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
