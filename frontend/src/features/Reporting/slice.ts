import { createSlice } from '@reduxjs/toolkit'

import { type ApiSearchFilter, type Reporting, ReportingSearchPeriod } from './types'

import type { PayloadAction } from '@reduxjs/toolkit'

export type ReportingState = {
  displayFilters: ApiSearchFilter
  editedReporting: Reporting.EditableReporting | undefined
  selectedReportingFeatureIds: string[]
}
const INITIAL_STATE: ReportingState = {
  displayFilters: {
    endDate: undefined,
    isArchived: undefined,
    isIUU: undefined,
    reportingPeriod: ReportingSearchPeriod.LAST_3_MONTHS,
    reportingType: undefined,
    startDate: undefined
  },
  editedReporting: undefined,
  selectedReportingFeatureIds: []
}

const reportingSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reporting',
  reducers: {
    setDisplayFilters(state, action: PayloadAction<ApiSearchFilter>) {
      state.displayFilters = action.payload
    },

    setEditedReporting(state, action: PayloadAction<Reporting.EditableReporting>) {
      state.editedReporting = action.payload
    },

    toggleSelectedReportingFeatureId(state, action: PayloadAction<string>) {
      const index = state.selectedReportingFeatureIds.indexOf(action.payload)
      if (index === -1) {
        state.selectedReportingFeatureIds.push(action.payload)
      } else {
        state.selectedReportingFeatureIds.splice(index, 1)
      }
    },

    unsetEditedReporting(state) {
      state.editedReporting = undefined
    },

    unsetSelectedReportingFeatureIds(state) {
      state.selectedReportingFeatureIds = []
    }
  }
})

export const reportingActions = reportingSlice.actions
export const reportingReducer = reportingSlice.reducer
