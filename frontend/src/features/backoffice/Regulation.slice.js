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
  saveUpcomingRegulation: false,
  /** @type {boolean} regulatorySaved */
  regulationSaved: false,
  regulationDeleted: false,
  atLeastOneValueIsMissing: undefined,
  isRemoveModalOpen: false,
  isConfirmModalOpen: false,
  selectedGeometryId: undefined
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
        /** @type {boolean} */
        complete,
        /** @type {number} */
        id
      } = action.payload
      state.regulatoryTextCheckedMap = {
        ...(state.regulatoryTextCheckedMap || {}),
        [id]: complete
      }
    },
    addObjectToUpcomingRegulatoryTextCheckedMap (state, action) {
      const {
        /** @type {boolean} */
        complete,
        /** @type {number} */
        id
      } = action.payload
      state.upcomingRegulatoryTextCheckedMap = {
        ...(state.upcomingRegulatoryTextCheckedMap || {}),
        [id]: complete
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
    },
    setSaveUpcomingRegulation (state, action) {
      state.saveUpcomingRegulation = action.payload
    },
    setRegulationDeleted (state, action) {
      state.regulationDeleted = action.payload
    },
    setIsRemoveModalOpen (state, action) {
      state.isRemoveModalOpen = action.payload
    },
    setIsConfirmModalOpen (state, action) {
      state.isConfirmModalOpen = action.payload
    },
    setSelectedGeometryId (state, action) {
      state.selectedGeometryId = action.payload
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
  setAtLeastOneValueIsMissing,
  setSaveUpcomingRegulation,
  setRegulationDeleted,
  setIsRemoveModalOpen,
  setIsConfirmModalOpen,
  setSelectedGeometryId
} = regulationSlice.actions

export default regulationSlice.reducer
