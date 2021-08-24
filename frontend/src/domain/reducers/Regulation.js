import { createSlice } from '@reduxjs/toolkit'

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: {
    /** @type {RegulatoryText} selectedRegulation */
    selectedRegulation: null,
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
    setSelectedUpcomingRegulation (state, action) {
      state.selectedUpcomingRegulation = action.payload
    },
    resetModal (state) {
      state.isModalOpen = false
      state.selectedUpcomingRegulation = null
    },
    openModal (state, action) {
      console.log('action.payload')
      console.log(action.payload)
      state.isModalOpen = true
      state.selectedUpcomingRegulation = action.payload
    }
  }
})

export const {
  setSelectedRegulation,
  setIsModalOpen,
  setSelectedUpcomingRegulation,
  resetModal,
  openModal
} = regulationSlice.actions

export default regulationSlice.reducer
