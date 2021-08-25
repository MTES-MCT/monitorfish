import { createSlice } from '@reduxjs/toolkit'

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: {
    /** @type {RegulatoryText} selectedRegulation */
    selectedRegulation: undefined,
    /** @type {UpcomingRegulation} selectedUpcomingRegulation */
    upcomingRegulation: undefined,
    /** @type {boolean} isModalOpen */
    isModalOpen: false
  },
  reducers: {
    setSelectedRegulation (state, action) {
      state.selectedRegulation = action.payload
    },
    setIsModalOpen (state, action) {
      state.isModalOpen = action.payload
    },
    setUpcomingRegulation (state, action) {
      state.upcomingRegulation = action.payload
    },
    resetModal (state) {
      state.isModalOpen = false
    },
    openModal (state, action) {
      state.isModalOpen = true
    }
  }
})

export const {
  setSelectedRegulation,
  setIsModalOpen,
  setUpcomingRegulation,
  resetModal,
  openModal
} = regulationSlice.actions

export default regulationSlice.reducer
