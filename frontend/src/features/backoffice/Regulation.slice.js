import { createSlice } from '@reduxjs/toolkit'
import { INITIAL_REGULATION, INITIAL_UPCOMING_REG_REFERENCE } from '../../domain/entities/regulatory'

const INITIAL_STATE = {
  /** @type {RegulatoryText} */
  selectedRegulation: undefined,
  /** @type {UpcomingRegulation} */
  upcomingRegulation: undefined,
  /** @type {RegulatoryText} */
  currentRegulation: INITIAL_REGULATION,
  /** @type {UpcomingRegulation} upcomingRegulation */
  // upcomingRegulation: undefined,
  /** @type {boolean} isModalOpen */
  isModalOpen: false,
  /** @type {Map<number, RegulatoryText | null>} */
  upcomingRegulatoryTextCheckedMap: undefined,
  /** @type {Map<number, RegulatoryText | null>} */
  upcomingRegulatoryText: INITIAL_UPCOMING_REG_REFERENCE,
  /** @type {Map<number, RegulatoryText | null>} regulatoryTextCheckedMap */
  regulatoryTextCheckedMap: undefined,
  /** @type {boolean} */
  saveOrUpdateRegulation: false,
  /** @type {boolean} */
  saveUpcomingRegulation: false,
  /** @type {boolean} */
  regulationSaved: false,
  /** @type {boolean} */
  regulationDeleted: false,
  /** @type {boolean} */
  atLeastOneValueIsMissing: undefined,
  /** @type {boolean} */
  isRemoveModalOpen: false,
  /** @type {boolean} */
  isConfirmModalOpen: false,
  /** @type {boolean} */
  selectedGeometryId: undefined
}

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: INITIAL_STATE,
  reducers: {
    resetState: () => INITIAL_STATE,
    setRegulationByKey (state, { payload: { key, value } }) {
      state.currentRegulation[key] = value
    },
    setRegulation (state, { payload }) {
      state.currentRegulation = payload
    },
    setUpcomingRegulatoryText (state, action) {
      state.upcomingRegulatoryText = action.payload
    },
    setSelectedRegulation (state, action) {
      state.selectedRegulation = action.payload
    },
    setIsModalOpen (state, action) {
      state.isModalOpen = action.payload
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
    }
  }
})

export const {
  resetState,
  setSelectedRegulation,
  setUpcomingRegulatoryText,
  setIsModalOpen,
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
  setRegulationByKey,
  setRegulation
} = regulationSlice.actions

export default regulationSlice.reducer
