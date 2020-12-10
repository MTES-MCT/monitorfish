import { createSlice } from '@reduxjs/toolkit'

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        error: null,
    },
    reducers: {
        setError(state, action) {
            state.error = action.payload
        }
    }
})

export const {
    setError,
} = globalSlice.actions

export default globalSlice.reducer
