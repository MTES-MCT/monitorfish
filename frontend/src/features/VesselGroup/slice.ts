import { createSelector, createSlice } from '@reduxjs/toolkit'

import { vesselGroupApi } from './apis'
import { getFilteredVesselGroups } from './utils/getFilteredVesselGroups'

import type { CreateOrUpdateVesselGroup, GroupType, Sharing } from '@features/VesselGroup/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { MainRootState } from '@store'

export type VesselGroupState = {
  areVesselsNotInVesselGroupsHidden: boolean
  editedVesselGroup: CreateOrUpdateVesselGroup | undefined
  filteredGroupType: GroupType | undefined
  filteredPriority: boolean
  filteredSharing: Sharing | undefined
  vesselGroupsIdsDisplayed: number[]
  vesselGroupsIdsPinned: number[]
}
export const INITIAL_STATE: VesselGroupState = {
  areVesselsNotInVesselGroupsHidden: false,
  editedVesselGroup: undefined,
  filteredGroupType: undefined,
  filteredPriority: false,
  filteredSharing: undefined,
  vesselGroupsIdsDisplayed: [],
  vesselGroupsIdsPinned: []
}
const vesselGroupSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselGroup',
  reducers: {
    setAreVesselsNotInVesselGroupsHidden(state, action: PayloadAction<boolean>) {
      state.areVesselsNotInVesselGroupsHidden = action.payload
    },

    setFilteredGroupType(state, action: PayloadAction<GroupType | undefined>) {
      state.filteredGroupType = action.payload
    },

    setFilteredPriority(state, action: PayloadAction<boolean>) {
      state.filteredPriority = action.payload
    },

    setFilteredSharing(state, action: PayloadAction<Sharing | undefined>) {
      state.filteredSharing = action.payload
    },

    vesselGroupEdited(state, action: PayloadAction<CreateOrUpdateVesselGroup | undefined>) {
      state.editedVesselGroup = action.payload
    },

    vesselGroupIdDisplayed(state, action: PayloadAction<number>) {
      state.vesselGroupsIdsDisplayed = state.vesselGroupsIdsDisplayed.concat(action.payload).sort().reverse()
    },

    vesselGroupIdHidden(state, action: PayloadAction<number>) {
      state.vesselGroupsIdsDisplayed = state.vesselGroupsIdsDisplayed
        .filter(id => id !== action.payload)
        .sort()
        .reverse()
    },

    vesselGroupIdPinned(state, action: PayloadAction<number>) {
      state.vesselGroupsIdsPinned = state.vesselGroupsIdsPinned.concat(action.payload).sort().reverse()
    },

    vesselGroupIdUnpinned(state, action: PayloadAction<number>) {
      state.vesselGroupsIdsPinned = state.vesselGroupsIdsPinned
        .filter(id => id !== action.payload)
        .sort()
        .reverse()
    }
  }
})

export const vesselGroupActions = vesselGroupSlice.actions

export const vesselGroupReducer = vesselGroupSlice.reducer

const selectAllVesselGroupsQuery = vesselGroupApi.endpoints.getAllVesselGroups.select()

export const selectVesselGroupsIdsFiltered = createSelector(
  [
    (state: MainRootState) => selectAllVesselGroupsQuery(state),
    (state: MainRootState) => state.vesselGroup.filteredGroupType,
    (state: MainRootState) => state.vesselGroup.filteredSharing,
    (state: MainRootState) => state.vesselGroup.vesselGroupsIdsPinned,
    (state: MainRootState) => state.vesselGroup.filteredPriority
  ],
  (queryResult, filteredGroupType, filteredSharing, vesselGroupsIdsPinned, filteredPriority) => {
    const { pinnedVesselGroups, priorityVesselGroups, unpinnedVesselGroups } = getFilteredVesselGroups(
      queryResult.data,
      filteredGroupType,
      filteredSharing,
      vesselGroupsIdsPinned,
      filteredPriority
    )

    return pinnedVesselGroups
      .concat(unpinnedVesselGroups)
      .concat(priorityVesselGroups)
      .map(vg => vg.id)
  }
)
