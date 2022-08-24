import { createSlice } from '@reduxjs/toolkit'

import { DEFAULT_REGULATION, REGULATORY_REFERENCE_KEYS } from '../../domain/entities/regulatory'

const INITIAL_STATE = {
  /** @type {boolean} */
  atLeastOneValueIsMissing: undefined,

  /** @type {Object} */
  processingRegulation: DEFAULT_REGULATION,

  
  /** @type {boolean} */
isConfirmModalOpen: false,

  
  
/** @type {boolean} */
regulationDeleted: false,

  /** @type {boolean} */
  regulationSaved: false,

  /** @type {boolean} */
  isRemoveModalOpen: false,

  
  /** @type {boolean} */
regulationModified: false,

  
  /** @type {Map<number, RegulatoryText | null>} regulatoryTextCheckedMap */
regulatoryTextCheckedMap: undefined,

  /** @type {boolean} */
  saveOrUpdateRegulation: false,
  /** @type {boolean} */
  selectedRegulatoryZoneId: undefined,
}

const regulationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulation',
  reducers: {
    addObjectToRegulatoryTextCheckedMap(state, action) {
      const {
        /** @type {boolean} */
        complete,
        /** @type {number} */
        id,
      } = action.payload
      state.regulatoryTextCheckedMap = {
        ...(state.regulatoryTextCheckedMap || {}),
        [id]: complete,
      }
    },
    resetState: () => INITIAL_STATE,
    setFishingPeriod(state, { payload: { key, value } }) {
      const nextFishingPeriod = {
        ...state.processingRegulation.fishingPeriod,
        [key]: value,
      }
      state.processingRegulation = {
        ...state.processingRegulation,
        [REGULATORY_REFERENCE_KEYS.FISHING_PERIOD]: nextFishingPeriod,
      }
    },
    setAtLeastOneValueIsMissing (state, action) {
      state.atLeastOneValueIsMissing = action.payload
    },
    setFishingPeriodOtherInfo(state, action) {
      state.processingRegulation[REGULATORY_REFERENCE_KEYS.FISHING_PERIOD].otherInfo = action.payload
    },
    setIsRemoveModalOpen (state, action) {
      state.isRemoveModalOpen = action.payload
    },
    setProcessingRegulation(state, { payload }) {
      state.processingRegulation = payload
    },
    setIsConfirmModalOpen(state, action) {
      state.isConfirmModalOpen = action.payload
    },
    setRegulationModified(state, action) {
      state.regulationModified = action.payload
    },
    setProcessingRegulationDeleted(state, action) {
      state.regulationDeleted = action.payload
    },
    setSelectedRegulatoryZoneId(state, action) {
      state.selectedRegulatoryZoneId = action.payload
    },
    setProcessingRegulationSaved(state, action) {
      state.regulationSaved = action.payload
    },
    updateProcessingRegulationByKey(state, { payload: { key, value } }) {
      state.processingRegulation[key] = value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    },
    setRegulatoryTextCheckedMap(state, action) {
      state.regulatoryTextCheckedMap = { ...action.payload }
    },
    updateProcessingRegulationByKeyAndSubKey (state, { payload: { key, subKey, value } }) {
      state.processingRegulation[key][subKey] = value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    },
    setSaveOrUpdateRegulation(state, action) {
      state.saveOrUpdateRegulation = action.payload
    },
    setSelectedRegulation(state, action) {
      state.selectedRegulation = action.payload
    },
  },
})

export const {
  addObjectToRegulatoryTextCheckedMap,
  resetState,
  setAtLeastOneValueIsMissing,
  setFishingPeriod,
  setFishingPeriodOtherInfo,
  setIsConfirmModalOpen,
  setIsRemoveModalOpen,
  setProcessingRegulation,
  setProcessingRegulationDeleted,
  setProcessingRegulationSaved,
  setRegulationModified,
  setRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setSelectedRegulatoryZoneId,
  updateProcessingRegulationByKey,
  updateProcessingRegulationByKeyAndSubKey,
} = regulationSlice.actions

export default regulationSlice.reducer
