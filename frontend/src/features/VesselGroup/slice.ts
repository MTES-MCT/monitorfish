import { createSlice } from '@reduxjs/toolkit'

import type { DynamicVesselGroup } from '@features/VesselGroup/types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type VesselGroupState = {
  areVesselsNotInVesselGroupsHidden: boolean
  editedVesselGroup: DynamicVesselGroup | undefined
  vesselGroupsIdsDisplayed: number[]
}
export const INITIAL_STATE: VesselGroupState = {
  areVesselsNotInVesselGroupsHidden: false,
  editedVesselGroup: undefined,
  vesselGroupsIdsDisplayed: []
}
const vesselGroupSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselGroup',
  reducers: {
    setAreVesselsNotInVesselGroupsHidden(state, action: PayloadAction<boolean>) {
      state.areVesselsNotInVesselGroupsHidden = action.payload
    },

    vesselGroupEdited(state, action: PayloadAction<DynamicVesselGroup | undefined>) {
      state.editedVesselGroup = action.payload
    },

    vesselGroupIdDisplayed(state, action: PayloadAction<number>) {
      state.vesselGroupsIdsDisplayed = state.vesselGroupsIdsDisplayed.concat(action.payload)
    },

    vesselGroupIdHidden(state, action: PayloadAction<number>) {
      state.vesselGroupsIdsDisplayed = state.vesselGroupsIdsDisplayed.filter(id => id !== action.payload)
    }
  }
})

export const vesselGroupActions = vesselGroupSlice.actions

export const vesselGroupReducer = vesselGroupSlice.reducer
