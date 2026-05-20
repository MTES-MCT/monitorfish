import { ReportingType } from '@features/Reporting/types/ReportingType'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ReportingTableFiltersState = {
  absentVessel: true | undefined
  reportingTypesDisplayed: ReportingType[] | undefined
  searchQuery: string | undefined
}

const INITIAL_STATE: ReportingTableFiltersState = {
  absentVessel: undefined,
  reportingTypesDisplayed: undefined,
  searchQuery: undefined
}

const reportingTableFiltersSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reportingTableFilters',
  reducers: {
    setAbsentVessel: (state, action: PayloadAction<boolean>) => {
      state.absentVessel = action.payload || undefined
    },
    setReportingTypesDisplayed: (state, action: PayloadAction<ReportingType[] | undefined>) => {
      state.reportingTypesDisplayed = action.payload
    },
    setSearchQueryFilter: (state, action: PayloadAction<string | undefined>) => {
      state.searchQuery = action.payload
    }
  }
})

export const reportingTableFiltersActions = reportingTableFiltersSlice.actions
export const reportingTableFiltersReducer = reportingTableFiltersSlice.reducer
