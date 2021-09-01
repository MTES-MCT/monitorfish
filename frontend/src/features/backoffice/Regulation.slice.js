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
    regulatoryTextSectionHasMissingValue: undefined,
    regulatoryTextListValidityMap: {}
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
    setRegulatoryTextSectionHasMissingValue (state, action) {
      state.regulatoryTextSectionHasMissingValue = action.payload
    },
    addObjectToRegulatoryTextListValidityMap (state, action) {
      console.log('addObjectToRegulatoryTextListValidityMap')
      console.log(action.payload)
      let mapUpdated = {}
      if (state.regulatoryTextListValidityMap) {
        mapUpdated = { ...state.regulatoryTextListValidityMap }
      }
      if (action.payload.validity !== false) {
        mapUpdated[action.payload.id] = true
        const newUpcomingRegulation = { ...state.upcomingRegulation }
        const newRegulationTextList = (newUpcomingRegulation?.regulatoryTextList
          ? [...newUpcomingRegulation.regulatoryTextList]
          : [{}])
        newRegulationTextList[action.payload.id] = action.payload.validity
        state.upcomingRegulation = newUpcomingRegulation
        newUpcomingRegulation.regulatoryTextList = newRegulationTextList
        state.upcomingRegulation.regulationText = action.payload.validity
      } else {
        mapUpdated[action.payload.id] = false
      }
      state.regulatoryTextListValidityMap = mapUpdated
      console.log(mapUpdated)
    },
    setRegulatoryTextListValidityMap (state, action) {
      console.log('setRegulatoryTextListValidityMap')
      state.regulatoryTextListValidityMap = action.payload
    }
  }
})

export const {
  setSelectedRegulation,
  setIsModalOpen,
  setUpcomingRegulation,
  setRegulatoryTextSectionHasMissingValue,
  addObjectToRegulatoryTextListValidityMap,
  setRegulatoryTextListValidityMap
} = regulationSlice.actions

export default regulationSlice.reducer
