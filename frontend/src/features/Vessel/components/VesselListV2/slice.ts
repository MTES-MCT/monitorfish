import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type VesselListState = {
  areMoreFiltersDisplayed: boolean
}
const INITIAL_STATE: VesselListState = {
  areMoreFiltersDisplayed: false
}

const vesselListV2Slice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselListV2',
  reducers: {
    setAreMoreFiltersDisplayed(state, action: PayloadAction<boolean>) {
      state.areMoreFiltersDisplayed = action.payload
    }
  }
})

export const vesselListV2Actions = vesselListV2Slice.actions
export const vesselListV2Reducer = vesselListV2Slice.reducer
