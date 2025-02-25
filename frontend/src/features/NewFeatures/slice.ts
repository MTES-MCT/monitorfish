import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export type NewFeaturesState = {
  checkedFeatures: string[]
}
const INITIAL_STATE: NewFeaturesState = {
  checkedFeatures: []
}

const newFeaturesSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'newFeatures',
  reducers: {
    checkFeature(state, action: PayloadAction<string>) {
      if (state.checkedFeatures.indexOf(action.payload) !== -1) {
        return
      }

      state.checkedFeatures = state.checkedFeatures.concat(action.payload)
    }
  }
})

export const { checkFeature } = newFeaturesSlice.actions

export const newFeaturesReducer = newFeaturesSlice.reducer
