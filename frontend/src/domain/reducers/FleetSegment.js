import { createSlice } from '@reduxjs/toolkit'

const fleetSegmentSlice = createSlice({
    name: 'fleetSegment',
    initialState: {
        fleetSegments: [],
    },
    reducers: {
        setFleetSegments(state, action) {
            state.fleetSegments = action.payload
        },
    }
})

export const {
    setFleetSegments,
} = fleetSegmentSlice.actions

export default fleetSegmentSlice.reducer
