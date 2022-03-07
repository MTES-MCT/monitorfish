import { createSlice } from '@reduxjs/toolkit'
import { INITIAL_REGULATION, REGULATORY_REFERENCE_KEYS } from '../../domain/entities/regulatory'

const INITIAL_STATE = {
  /** @type {RegulatoryText} */
  processingRegulation: INITIAL_REGULATION,
  /** @type {boolean} isModalOpen */
  isModalOpen: false,
  /** @type {Map<number, RegulatoryText | null>} regulatoryTextCheckedMap */
  regulatoryTextCheckedMap: undefined,
  /** @type {boolean} */
  saveOrUpdateRegulation: false,
  /** @type {boolean} */
  regulationSaved: false,
  /** @type {boolean} */
  regulationDeleted: false,
  /** @type {boolean} */
  regulationModified: false,
  /** @type {boolean} */
  atLeastOneValueIsMissing: undefined,
  /** @type {boolean} */
  isRemoveModalOpen: false,
  /** @type {boolean} */
  isConfirmModalOpen: false,
  /** @type {boolean} */
  selectedRegulatoryZoneId: undefined
}

const regulationSlice = createSlice({
  name: 'regulation',
  initialState: INITIAL_STATE,
  reducers: {
    resetState: () => INITIAL_STATE,
    setSelectedRegulatoryZoneId (state, action) {
      state.selectedRegulatoryZoneId = action.payload
    },
    setRegulationModified (state, action) {
      state.regulationModified = action.payload
    },
    setProcessingRegulationByKey (state, { payload: { key, value } }) {
      state.processingRegulation[key] = value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    },
    setProcessingRegulation (state, { payload }) {
      state.processingRegulation = payload
    },
    setFishingPeriod (state, { payload: { key, value } }) {
      const nextFishingPeriod = {
        ...state.processingRegulation.fishingPeriod,
        [key]: value
      }
      const nextProcessingRegulation = {
        ...state.processingRegulation,
        [REGULATORY_REFERENCE_KEYS.FISHING_PERIOD]: nextFishingPeriod
      }
      state.processingRegulation = nextProcessingRegulation
    },
    setFishingPeriodOtherInfo (state, action) {
      state.processingRegulation[REGULATORY_REFERENCE_KEYS.FISHING_PERIOD].otherInfo = action.payload
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
    setRegulatoryTextCheckedMap (state, action) {
      state.regulatoryTextCheckedMap = { ...action.payload }
    },
    setProcessingRegulationSaved (state, action) {
      state.regulationSaved = action.payload
    },
    setSaveOrUpdateRegulation (state, action) {
      state.saveOrUpdateRegulation = action.payload
    },
    setAtLeastOneValueIsMissing (state, action) {
      state.atLeastOneValueIsMissing = action.payload
    },
    setProcessingRegulationDeleted (state, action) {
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
  setIsModalOpen,
  setProcessingRegulationSaved,
  setRegulatoryTextCheckedMap,
  addObjectToRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setAtLeastOneValueIsMissing,
  setProcessingRegulationDeleted,
  setIsRemoveModalOpen,
  setIsConfirmModalOpen,
  setProcessingRegulationByKey,
  setProcessingRegulation,
  setFishingPeriod,
  setFishingPeriodOtherInfo,
  setSelectedRegulatoryZoneId,
  setRegulationModified
} = regulationSlice.actions

export default regulationSlice.reducer
