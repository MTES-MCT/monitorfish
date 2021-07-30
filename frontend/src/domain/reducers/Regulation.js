import { createSlice } from '@reduxjs/toolkit'

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: {
    /** @type {RegulatoryText} selectedRegulation */
    selectedRegulation: null,
    /** @type {number} selectedRegulatoryTextToComeId */
    selectedRegulatoryTextToComeId: null,
    /** @type {RegulatoryTextToCome} selectedRegulatoryTextToCome */
    selectedRegulatoryTextToCome: null,
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
    setSelectedRegulatoryTextToComeId (state, action) {
      state.selectedRegulatoryTextToComeId = action.payload
    },
    setSelectedRegulatoryTextToCome (state, action) {
      state.selectedRegulatoryTextToCome = action.payload
    }
  }
})

export const {
  setSelectedRegulation,
  setIsModalOpen,
  setSelectedRegulatoryTextToComeId,
  setSelectedRegulatoryTextToCome
} = regulationSlice.actions

export default regulationSlice.reducer
