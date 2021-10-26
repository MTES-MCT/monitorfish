import { createSlice } from '@reduxjs/toolkit'

const INITIAL_STATE = {
  /** @type {RegulatoryText} selectedRegulation */
  selectedRegulation: undefined,
  /** @type {UpcomingRegulation} upcomingRegulation */
  upcomingRegulation: undefined,
  /** @type {boolean} isModalOpen */
  isModalOpen: false,
  /** @type {Map<number, RegulatoryText | null>} upcomingRegulatoryTextCheckedMap */
  upcomingRegulatoryTextCheckedMap: undefined,
  /** @type {Map<number, RegulatoryText | null>} regulatoryTextCheckedMap */
  regulatoryTextCheckedMap: undefined,
  /** @type {boolean} regulatorySaved */
  regulationSaved: false
}

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: INITIAL_STATE,
  reducers: {
    resetState: () => INITIAL_STATE,
    setSelectedRegulation (state, action) {
      state.selectedRegulation = action.payload
    },
    setIsModalOpen (state, action) {
      state.isModalOpen = action.payload
    },
    setUpcomingRegulation (state, action) {
      state.upcomingRegulation = action.payload
    },
    addObjectToRegulatoryTextCheckedMap (state, action) {
      const {
        /** @type {RegulatoryText | null} */
        regulatoryText,
        /** @type {number} */
        id
      } = action.payload
      state.regulatoryTextCheckedMap = {
        ...(state.regulatoryTextCheckedMap || {}),
        [id]: regulatoryText ? { ...regulatoryText } : null
      }
    },
    addObjectToUpcomingRegulatoryTextCheckedMap (state, action) {
      const {
        /** @type {RegulatoryText | null} */
        regulatoryText,
        /** @type {number} */
        id
      } = action.payload
      let newUpcomingRegulatoryTextCheckedMap = {}
      if (state.upcomingRegulatoryTextCheckedMap) {
        newUpcomingRegulatoryTextCheckedMap = { ...state.upcomingRegulatoryTextCheckedMap }
      }
      if (regulatoryText !== false) {
        newUpcomingRegulatoryTextCheckedMap[id] = true
        const newUpcomingRegulation = state.upcomingRegulation
          ? { ...state.upcomingRegulation }
          : { regulatoryTextList: [{}] }
        const newRegulatoryTextList = [...newUpcomingRegulation.regulatoryTextList]
        newRegulatoryTextList[id] = { ...regulatoryText }
        newUpcomingRegulation.regulatoryTextList = newRegulatoryTextList
        state.upcomingRegulation = newUpcomingRegulation
      } else {
        newUpcomingRegulatoryTextCheckedMap[id] = false
      }
      state.upcomingRegulatoryTextCheckedMap = newUpcomingRegulatoryTextCheckedMap
    },
    setUpcomingRegulatoryTextListCheckedMap (state, action) {
      state.upcomingRegulatoryTextCheckedMap = action.payload
    },
    setRegulatoryTextCheckedMap (state, action) {
      state.regulatoryTextCheckedMap = { ...action.payload }
    },
    setRegulationSaved (state, action) {
      state.regulationSaved = action.payload
    }
  }
})

export const {
  resetState,
  setSelectedRegulation,
  setIsModalOpen,
  setUpcomingRegulation,
  addObjectToUpcomingRegulatoryTextCheckedMap,
  setUpcomingRegulatoryTextListCheckedMap,
  setRegulationSaved,
  setRegulatoryTextCheckedMap,
  addObjectToRegulatoryTextCheckedMap
} = regulationSlice.actions

export default regulationSlice.reducer
