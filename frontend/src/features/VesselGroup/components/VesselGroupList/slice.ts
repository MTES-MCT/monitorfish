import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export type VesselGroupListState = {
  filteredExpired: boolean
  openedVesselGroupIds: number[]
  searchQuery: string | undefined
}

export const INITIAL_STATE: VesselGroupListState = {
  filteredExpired: false,
  openedVesselGroupIds: [],
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
    },
    vesselGroupIdToggled(state, action: PayloadAction<number>) {
      const id = action.payload
      if (state.openedVesselGroupIds.includes(id)) {
        state.openedVesselGroupIds = state.openedVesselGroupIds.filter(i => i !== id)
      } else {
        state.openedVesselGroupIds.push(id)
      }
    }
  }
})

export const vesselGroupListActions = vesselGroupListSlice.actions

export const vesselGroupListReducer = vesselGroupListSlice.reducer
