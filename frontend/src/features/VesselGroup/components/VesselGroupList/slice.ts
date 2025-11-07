import { GroupType, Sharing } from '@features/VesselGroup/types'
import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import type { PayloadAction } from '@reduxjs/toolkit'

export type VesselGroupListState = {
  filteredExpired: boolean
  filteredGroupTypes: GroupType[]
  filteredSharing: Sharing[]
  searchQuery: string | undefined
}

export const INITIAL_STATE: VesselGroupListState = {
  filteredExpired: false,
  filteredGroupTypes: [GroupType.DYNAMIC, GroupType.FIXED],
  filteredSharing: [Sharing.SHARED, Sharing.PRIVATE],
  searchQuery: undefined
}

const persistConfig = {
  key: 'vesselGroupList',
  storage
}

const vesselGroupListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselGroupList',
  reducers: {
    setFilteredExpired(state, action: PayloadAction<boolean>) {
      state.filteredExpired = action.payload
    },
    setFilteredGroupTypes(state, action: PayloadAction<GroupType[]>) {
      state.filteredGroupTypes = action.payload
    },
    setFilteredSharing(state, action: PayloadAction<Sharing[]>) {
      state.filteredSharing = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string | undefined>) {
      state.searchQuery = action.payload
    }
  }
})

export const vesselGroupListActions = vesselGroupListSlice.actions

export const vesselGroupListReducer = persistReducer(persistConfig, vesselGroupListSlice.reducer)
