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
    /** @type {RegulatoryTextValidity} upcomingRegulatoryTextListValidityMap */
    upcomingRegulatoryTextListValidityMap: undefined,
    /** @type {RegulatoryTextValidity} regulatoryTextListValidityMap */
    regulatoryTextListValidityMap: undefined,
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
        mapUpdated[id] = validity
      } else {
        mapUpdated[id] = false
      }
      state.regulatoryTextListValidityMap = mapUpdated
    },
    addObjectToUpcomingRegulatoryTextListValidityMap (state, action) {
      const { validity, id } = action.payload
      let mapUpdated = {}
      if (state.upcomingRegulatoryTextListValidityMap) {
        mapUpdated = { ...state.upcomingRegulatoryTextListValidityMap }
      }
      if (validity !== false) {
        mapUpdated[id] = true
        const newUpcomingRegulation = { ...state.upcomingRegulation }
        const newRegulationTextList = (newUpcomingRegulation?.regulatoryTextList
          ? [...newUpcomingRegulation.regulatoryTextList]
          : [{}])
        newRegulationTextList[id] = validity
        newUpcomingRegulation.regulatoryTextList = newRegulationTextList
        state.upcomingRegulation = newUpcomingRegulation
      } else {
        mapUpdated[id] = false
      }
      state.upcomingRegulatoryTextListValidityMap = mapUpdated
    },
    setUpcomingRegulatoryTextListValidityMap (state, action) {
      state.upcomingRegulatoryTextListValidityMap = action.payload
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
  addObjectToUpcomingRegulatoryTextListValidityMap,
  setUpcomingRegulatoryTextListValidityMap,
  setRegulationSaved,
  setRegulatoryTextListValidityMap,
  addObjectToRegulatoryTextListValidityMap
} = regulationSlice.actions

export default regulationSlice.reducer
