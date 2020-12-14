import { createSlice } from '@reduxjs/toolkit'

const gearSlice = createSlice({
    name: 'gear',
    initialState: [],
    reducers: {
        setGears(state, action) {
            state = action.payload
        }
    }
})

export const {
    setGears,
} = gearSlice.actions

export default gearSlice.reducer
