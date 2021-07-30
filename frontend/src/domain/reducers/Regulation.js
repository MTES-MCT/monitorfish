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
    setSelectedUpcomingRegulationId (state, action) {
      state.selectedUpcomingRegulationId = action.payload
    },
    setSelectedUpcomingRegulation (state, action) {
      state.selectedUpcomingRegulation = action.payload
    },
    resetModal (state) {
      state.isModalOpen = false
      state.selectedUpcomingRegulation = null
      state.selectedUpcomingRegulationId = null
    },
    openModal (state, action) {
      state.isModalOpen = true
      state.selectedUpcomingRegulation = action.id > -1 ? { ...state.selectedRegulation[action.id] } : {}
      state.selectedUpcomingRegulationId = action.id
    }
  }
})

export const {
  setSelectedRegulation,
  setIsModalOpen,
  setSelectedUpcomingRegulationId,
  setSelectedUpcomingRegulation,
  resetModal,
  openModal
} = regulationSlice.actions

export default regulationSlice.reducer
