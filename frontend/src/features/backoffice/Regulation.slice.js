import { createSlice } from '@reduxjs/toolkit'
import { DEFAULT_REGULATION, REGULATORY_REFERENCE_KEYS } from '../../domain/entities/regulation'
import { STATUS } from './constants'

const INITIAL_STATE = {
  status: STATUS.IDLE,
  /** @type {Object} */
  processingRegulation: DEFAULT_REGULATION,
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
    updateProcessingRegulationByKey (state, { payload: { key, value } }) {
      if (state.status !== STATUS.READY && state.status !== STATUS.IDLE) {
        return
      }

      state.processingRegulation[key] = value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    },
    updateProcessingRegulationByKeyAndSubKey (state, { payload: { key, subKey, value } }) {
      if (state.status !== STATUS.READY && state.status !== STATUS.IDLE) {
        return
      }

      state.processingRegulation[key][subKey] = value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    },
    setProcessingRegulation (state, { payload }) {
      state.status = STATUS.READY
      state.processingRegulation = payload
    },
    setFishingPeriod (state, { payload: { key, value } }) {
      const nextFishingPeriod = {
        ...state.processingRegulation.fishingPeriod,
        [key]: value
      }
      state.processingRegulation = {
        ...state.processingRegulation,
        [REGULATORY_REFERENCE_KEYS.FISHING_PERIOD]: nextFishingPeriod
      }
    },
    setFishingPeriodOtherInfo (state, action) {
      state.processingRegulation[REGULATORY_REFERENCE_KEYS.FISHING_PERIOD].otherInfo = action.payload
    },
    setSelectedRegulation (state, action) {
      state.selectedRegulation = action.payload
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
    },
    setStatus (state, action) {
      state.status = action.payload
    }
  }
})

export const {
  resetState,
  setProcessingRegulationSaved,
  setRegulatoryTextCheckedMap,
  addObjectToRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setAtLeastOneValueIsMissing,
  setProcessingRegulationDeleted,
  setIsRemoveModalOpen,
  setIsConfirmModalOpen,
  updateProcessingRegulationByKey,
  updateProcessingRegulationByKeyAndSubKey,
  setProcessingRegulation,
  setFishingPeriod,
  setFishingPeriodOtherInfo,
  setSelectedRegulatoryZoneId,
  setRegulationModified,
  setStatus
} = regulationSlice.actions

export default regulationSlice.reducer
