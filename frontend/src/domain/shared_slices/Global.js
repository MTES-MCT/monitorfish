import { createSlice } from '@reduxjs/toolkit'

const globalSlice = createSlice({
  name: 'global',
  initialState: {
    error: null,
    isUpdatingVessels: false,
    rightMenuIsOpen: false,
    /** @type {string | null} healthcheckTextWarning */
    healthcheckTextWarning: null
  },
  reducers: {
    expandRightMenu (state) {
      state.rightMenuIsOpen = true
    },
    contractRightMenu (state) {
      state.rightMenuIsOpen = false
    },
    setIsUpdatingVessels (state) {
      state.isUpdatingVessels = true
    },
    resetIsUpdatingVessels (state) {
      state.isUpdatingVessels = false
    },
    setError (state, action) {
      state.error = action.payload
    },
    removeError (state) {
      state.error = null
    },
    /**
     * Set warning to show on application header
     * @param {Object=} state
     * @param {{payload: string | null}} action - the warning(s) or null if no warning are found
     */
    setHealthcheckTextWarning (state, action) {
      state.healthcheckTextWarning = action.payload
    }
  }
})

export const {
  setError,
  removeError,
  setIsUpdatingVessels,
  resetIsUpdatingVessels,
  expandRightMenu,
  contractRightMenu,
  setHealthcheckTextWarning
} = globalSlice.actions

export default globalSlice.reducer
