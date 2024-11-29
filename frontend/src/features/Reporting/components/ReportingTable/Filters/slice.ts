import { ReportingType } from '@features/Reporting/types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type reportingTableFiltersState = {
  reportingTypesDisplayed: ReportingType[]
  searchQuery: string | undefined
}
const INITIAL_STATE: reportingTableFiltersState = {
  reportingTypesDisplayed: [ReportingType.ALERT, ReportingType.INFRACTION_SUSPICION],
  searchQuery: undefined
}

const reportingTableFiltersSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reportingTableFilters',
  reducers: {
    setReportingTypesDisplayed: (state, action: PayloadAction<ReportingType[]>) => {
      state.reportingTypesDisplayed = action.payload
    },
    setSearchQueryFilter: (state, action: PayloadAction<string | undefined>) => {
      state.searchQuery = action.payload
    }
  }
})

export const reportingTableFiltersActions = reportingTableFiltersSlice.actions
export const reportingTableFiltersReducer = reportingTableFiltersSlice.reducer
