import { createSlice } from '@reduxjs/toolkit'

const fleetSegmentSlice = createSlice({
  initialState: {
    fleetSegments: [],
  },
  name: 'fleetSegment',
  reducers: {
    setFleetSegments(state, action) {
      state.fleetSegments = action.payload
    },
  },
})

export const { setFleetSegments } = fleetSegmentSlice.actions

export default fleetSegmentSlice.reducer
