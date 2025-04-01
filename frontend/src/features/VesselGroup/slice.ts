import { createSlice } from '@reduxjs/toolkit'

import type { CreateOrUpdateDynamicVesselGroup } from '@features/VesselGroup/types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type VesselGroupState = {
  areVesselsNotInVesselGroupsHidden: boolean
  editedVesselGroup: CreateOrUpdateDynamicVesselGroup | undefined
  vesselGroupsIdsDisplayed: number[]
  vesselGroupsIdsPinned: number[]
}
export const INITIAL_STATE: VesselGroupState = {
  areVesselsNotInVesselGroupsHidden: false,
  editedVesselGroup: undefined,
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

    vesselGroupEdited(state, action: PayloadAction<CreateOrUpdateDynamicVesselGroup | undefined>) {
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
