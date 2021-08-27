import { createSlice } from '@reduxjs/toolkit'

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: {
    /** @type {RegulatoryText} selectedRegulation */
    selectedRegulation: undefined,
    /** @type {UpcomingRegulation} selectedUpcomingRegulation */
    upcomingRegulation: undefined,
    /** @type {boolean} isModalOpen */
    isModalOpen: false,
    /** @type {boolean} regulatoryTextHasMissingValue */
    regulatoryTextHasMissingValue: false
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
    setRegulatoryTextHasValueMissing (state, action) {
      state.regulatoryTextHasMissingValue = action.payload
    }
  }
})

export const {
  setSelectedRegulation,
  setIsModalOpen,
  setUpcomingRegulation,
  setRegulatoryTextHasValueMissing
} = regulationSlice.actions

export default regulationSlice.reducer
