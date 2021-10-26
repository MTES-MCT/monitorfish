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
  saveOrUpdateRegulation: false,
  /** @type {boolean} regulatorySaved */
  regulationSaved: false,
  atLeastOneValueIsMissing: undefined
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
      state.upcomingRegulatoryTextCheckedMap = {
        ...(state.upcomingRegulatoryTextCheckedMap || {}),
        [id]: regulatoryText ? { ...regulatoryText } : null
      }
    },
    setUpcomingRegulatoryTextListCheckedMap (state, action) {
      state.upcomingRegulatoryTextCheckedMap = action.payload
    },
    setRegulatoryTextCheckedMap (state, action) {
      state.regulatoryTextCheckedMap = { ...action.payload }
    },
    setRegulationSaved (state, action) {
      state.regulationSaved = action.payload
    },
    setSaveOrUpdateRegulation (state, action) {
      state.saveOrUpdateRegulation = action.payload
    },
    setAtLeastOneValueIsMissing (state, action) {
      state.atLeastOneValueIsMissing = action.payload
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
  addObjectToRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setAtLeastOneValueIsMissing
} = regulationSlice.actions

export default regulationSlice.reducer
