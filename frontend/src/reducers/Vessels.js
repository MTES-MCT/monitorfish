import { createSlice } from '@reduxjs/toolkit'

const vesselsSlice = createSlice({
    name: 'vessels',
    initialState: {
        vessels: []
    },
    reducers: {
        setVessels(state, action) {
            state.vessels = action.payload
        },
    }
})

export const { setVessels } = vesselsSlice.actions

export default vesselsSlice.reducer
