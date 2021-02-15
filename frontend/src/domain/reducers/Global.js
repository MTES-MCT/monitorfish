import { createSlice } from '@reduxjs/toolkit'

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        error: null,
    },
    reducers: {
        setError(state, action) {
            state.error = action.payload
        },
        removeError(state) {
            state.error = null
        }
    }
})

export const {
    setError,
    removeError
} = globalSlice.actions

export default globalSlice.reducer
