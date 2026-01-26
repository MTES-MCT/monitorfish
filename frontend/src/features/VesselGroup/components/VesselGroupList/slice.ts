import { GroupType, Sharing } from '@features/VesselGroup/types'
import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export type VesselGroupListState = {
  filteredExpired: boolean
  filteredGroupType: GroupType | undefined
  filteredSharing: Sharing | undefined
  searchQuery: string | undefined
}

export const INITIAL_STATE: VesselGroupListState = {
  filteredExpired: false,
  filteredGroupType: undefined,
  filteredSharing: undefined,
  searchQuery: undefined
}

const vesselGroupListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselGroupList',
  reducers: {
    setFilteredExpired(state, action: PayloadAction<boolean>) {
      state.filteredExpired = action.payload
    },
    setFilteredGroupType(state, action: PayloadAction<GroupType | undefined>) {
      state.filteredGroupType = action.payload
    },
    setFilteredSharing(state, action: PayloadAction<Sharing | undefined>) {
      state.filteredSharing = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string | undefined>) {
      state.searchQuery = action.payload
    }
  }
})

export const vesselGroupListActions = vesselGroupListSlice.actions

export const vesselGroupListReducer = vesselGroupListSlice.reducer
