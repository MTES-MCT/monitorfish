import { createSlice } from '@reduxjs/toolkit'

import type { FleetSegment } from '../types/fleetSegment'

export type FleetSegmentState = {
  fleetSegments: FleetSegment[]
}
const INITIAL_STATE: FleetSegmentState = {
  fleetSegments: []
}

const fleetSegmentSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'fleetSegment',
  reducers: {
    setFleetSegments(state, action) {
      state.fleetSegments = action.payload
    }
  }
})

export const { setFleetSegments } = fleetSegmentSlice.actions

export const fleetSegmentReducer = fleetSegmentSlice.reducer
