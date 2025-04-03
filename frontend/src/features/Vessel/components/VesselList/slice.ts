import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type VesselListState = {
  areMoreFiltersDisplayed: boolean
}
const INITIAL_STATE: VesselListState = {
  areMoreFiltersDisplayed: false
}

const vesselListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselList',
  reducers: {
    setAreMoreFiltersDisplayed(state, action: PayloadAction<boolean>) {
      state.areMoreFiltersDisplayed = action.payload
    }
  }
})

export const vesselListActions = vesselListSlice.actions
export const vesselListReducer = vesselListSlice.reducer
