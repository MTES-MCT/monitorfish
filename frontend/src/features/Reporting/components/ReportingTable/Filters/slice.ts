import { createSlice } from '@reduxjs/toolkit'

export type reportingTableFiltersState = {
  searchQuery: string | undefined
}
const INITIAL_STATE: reportingTableFiltersState = {
  searchQuery: undefined
}

const reportingTableFiltersSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reportingTableFilters',
  reducers: {
    setSearchQueryFilter: (state, action) => {
      state.searchQuery = action.payload
    }
  }
})

export const reportingTableFiltersActions = reportingTableFiltersSlice.actions
export const reportingTableFiltersReducer = reportingTableFiltersSlice.reducer
