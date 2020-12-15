import { createSlice } from '@reduxjs/toolkit'

const gearSlice = createSlice({
    name: 'gear',
    initialState: {
        gears: []
    },
    reducers: {
        setGears(state, action) {
            state.gears = action.payload
        }
    }
})

export const {
    setGears,
} = gearSlice.actions

export default gearSlice.reducer
