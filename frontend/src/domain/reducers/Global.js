import { createSlice } from '@reduxjs/toolkit'

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        error: null,
        isUpdatingVessels: false
    },
    reducers: {
        setIsUpdatingVessels(state) {
            state.isUpdatingVessels = true
        },
        resetIsUpdatingVessels(state) {
            state.isUpdatingVessels = false
        },
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
    removeError,
    setIsUpdatingVessels,
    resetIsUpdatingVessels
} = globalSlice.actions

export default globalSlice.reducer
