import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type VesselListState = {
  areFiltersDisplayed: boolean
}
const INITIAL_STATE: VesselListState = {
  areFiltersDisplayed: true
}

const vesselListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselList',
  reducers: {
    setAreFiltersDisplayed(state, action: PayloadAction<boolean>) {
      state.areFiltersDisplayed = action.payload
    }
  }
})

export const vesselListActions = vesselListSlice.actions
export const vesselListReducer = vesselListSlice.reducer
