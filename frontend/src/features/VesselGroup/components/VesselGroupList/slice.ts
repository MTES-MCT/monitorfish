import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export type VesselGroupListState = {
  filteredExpired: boolean
  searchQuery: string | undefined
}

export const INITIAL_STATE: VesselGroupListState = {
  filteredExpired: false,
  searchQuery: undefined
}

const vesselGroupListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselGroupList',
  reducers: {
    setFilteredExpired(state, action: PayloadAction<boolean>) {
      state.filteredExpired = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string | undefined>) {
      state.searchQuery = action.payload
    }
  }
})

export const vesselGroupListActions = vesselGroupListSlice.actions

export const vesselGroupListReducer = vesselGroupListSlice.reducer
