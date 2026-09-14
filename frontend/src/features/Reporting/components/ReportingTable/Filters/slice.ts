import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ReportingsExtraData } from '@features/Reporting/types'

/**
 * Filters that only make sense for the reporting list. Everything shared with the map menu lives
 * in the `reporting` slice.
 */
export type ReportingTableFiltersState = {
  absentVessel: true | undefined
  /**
   * Seafront counts of the last list query, kept here so that the seafront sub-menu — rendered by
   * a parent of the table, which owns the pagination state — can display them without issuing its
   * own request.
   */
  perSeafrontGroupCount: ReportingsExtraData['perSeafrontGroupCount'] | undefined
  searchQuery: string | undefined
}

const INITIAL_STATE: ReportingTableFiltersState = {
  absentVessel: undefined,
  perSeafrontGroupCount: undefined,
  searchQuery: undefined
}

const reportingTableFiltersSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reportingTableFilters',
  reducers: {
    setAbsentVessel: (state, action: PayloadAction<boolean>) => {
      state.absentVessel = action.payload || undefined
    },
    setPerSeafrontGroupCount: (
      state,
      action: PayloadAction<ReportingsExtraData['perSeafrontGroupCount'] | undefined>
    ) => {
      state.perSeafrontGroupCount = action.payload
    },
    setSearchQueryFilter: (state, action: PayloadAction<string | undefined>) => {
      state.searchQuery = action.payload
    }
  }
})

export const reportingTableFiltersActions = reportingTableFiltersSlice.actions
export const reportingTableFiltersReducer = reportingTableFiltersSlice.reducer
