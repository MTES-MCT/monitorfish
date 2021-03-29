import { createSlice } from '@reduxjs/toolkit'

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        error: null,
        isUpdatingVessels: false,
        rightMenuIsOpen: false
    },
    reducers: {
        expandRightMenu(state) {
            state.rightMenuIsOpen = true
        },
        contractRightMenu(state) {
            state.rightMenuIsOpen = false
        },
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
    resetIsUpdatingVessels,
    expandRightMenu,
    contractRightMenu
} = globalSlice.actions

export default globalSlice.reducer
