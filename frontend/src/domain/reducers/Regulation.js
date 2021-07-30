import { createSlice } from '@reduxjs/toolkit'

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: {
    /** @type {RegulatoryText} selectedRegulation */
    selectedRegulation: null,
    /** @type {number} selectedUpcomingRegulationId */
    selectedUpcomingRegulationId: null,
    /** @type {UpcomingRegulation} selectedUpcomingRegulation */
    selectedUpcomingRegulation: null,
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
    Id (state, action) {
      state.selectedUpcomingRegulationId = action.payload
    },
    setSelectedUpcomingRegulation (state, action) {
      state.selectedUpcomingRegulation = action.payload
    }
  }
})

export const {
  setSelectedRegulation,
  setIsModalOpen,
  setSelectedUpcomingRegulationId,
  setSelectedUpcomingRegulation
} = regulationSlice.actions

export default regulationSlice.reducer
