import { createSlice } from '@reduxjs/toolkit'

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: {
    /** @type {RegulatoryText} selectedRegulation */
    selectedRegulation: undefined,
    /** @type {UpcomingRegulation} upcomingRegulation */
    upcomingRegulation: undefined,
    /** @type {boolean} isModalOpen */
    isModalOpen: false,
    /** @type {RegulatoryTextValidity} regulatoryTextListValidityMap */
    regulatoryTextListValidityMap: {},
    regulationSaved: false
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
    addObjectToRegulatoryTextListValidityMap (state, action) {
      const { validity, id } = action.payload
      let mapUpdated = {}
      if (state.regulatoryTextListValidityMap) {
        mapUpdated = { ...state.regulatoryTextListValidityMap }
      }
      if (validity !== false) {
        mapUpdated[id] = true
        const newUpcomingRegulation = { ...state.upcomingRegulation }
        const newRegulationTextList = (newUpcomingRegulation?.regulatoryTextList
          ? [...newUpcomingRegulation.regulatoryTextList]
          : [{}])
        newRegulationTextList[id] = validity
        state.upcomingRegulation = newUpcomingRegulation
        newUpcomingRegulation.regulatoryTextList = newRegulationTextList
      } else {
        mapUpdated[id] = false
      }
      state.regulatoryTextListValidityMap = mapUpdated
    },
    setRegulatoryTextListValidityMap (state, action) {
      state.regulatoryTextListValidityMap = action.payload
    },
    setRegulationSaved (state, action) {
      state.regulationSaved = action.payload
    }

  }
})

export const {
  setSelectedRegulation,
  setIsModalOpen,
  setUpcomingRegulation,
  addObjectToRegulatoryTextListValidityMap,
  setRegulatoryTextListValidityMap,
  setRegulationSaved
} = regulationSlice.actions

export default regulationSlice.reducer
