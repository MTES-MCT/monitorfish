// TODO Reunite this slice with its family.

import { createSlice } from '@reduxjs/toolkit'

import { STATUS } from './constants'
import { DEFAULT_REGULATION, REGULATORY_REFERENCE_KEYS } from '../../domain/entities/regulation'

import type { RegulatoryText } from '../../domain/types/regulation'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ValueOf } from 'type-fest'

export type RegulationState = {
  hasOneOrMoreValuesMissing: boolean | undefined
  isConfirmModalOpen: boolean
  isRemoveModalOpen: boolean
  // TODO Convert that to a real type.
  processingRegulation: typeof DEFAULT_REGULATION
  regulationDeleted: boolean
  regulationModified: boolean
  regulationSaved: boolean
  regulatoryTextCheckedMap: Map<number, RegulatoryText | null> | undefined
  saveOrUpdateRegulation: boolean
  selectedRegulatoryZoneId: boolean | undefined
  // TODO Convert that to an emum.
  status: ValueOf<typeof STATUS>
}
const INITIAL_STATE: RegulationState = {
  hasOneOrMoreValuesMissing: undefined,
  isConfirmModalOpen: false,
  isRemoveModalOpen: false,
  processingRegulation: DEFAULT_REGULATION,
  regulationDeleted: false,
  regulationModified: false,
  regulationSaved: false,
  regulatoryTextCheckedMap: undefined,
  saveOrUpdateRegulation: false,
  selectedRegulatoryZoneId: undefined,
  status: STATUS.IDLE
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
        id
      } = action.payload

      // TODO Clean this type.
      ;(state as any).regulatoryTextCheckedMap = {
        ...(state.regulatoryTextCheckedMap || {}),
        [id]: complete
      }
    },

    resetState: () => INITIAL_STATE,

    setFishingPeriod(state, { payload: { key, value } }) {
      const nextFishingPeriod = {
        ...state.processingRegulation.fishingPeriod,
        [key]: value
      }

      // TODO Clean this type.
      ;(state as any).processingRegulation = {
        ...state.processingRegulation,
        [REGULATORY_REFERENCE_KEYS.FISHING_PERIOD]: nextFishingPeriod
      }
    },

    setFishingPeriodOtherInfo(state, action) {
      // TODO Clean this type.
      ;(state as any).processingRegulation[REGULATORY_REFERENCE_KEYS.FISHING_PERIOD].otherInfo = action.payload
    },

    setHasOneOrMoreValuesMissing(state, action) {
      state.hasOneOrMoreValuesMissing = action.payload
    },

    setIsConfirmModalOpen(state, action) {
      state.isConfirmModalOpen = action.payload
    },

    setIsRemoveModalOpen(state, action) {
      state.isRemoveModalOpen = action.payload
    },

    setProcessingRegulation(state, { payload }) {
      state.status = STATUS.READY
      state.processingRegulation = payload
    },
    setProcessingRegulationDeleted(state, action) {
      state.regulationDeleted = action.payload
    },

    setProcessingRegulationSaved(state, action) {
      state.regulationSaved = action.payload
    },

    setRegulationModified(state, action) {
      state.regulationModified = action.payload
    },

    setRegulatoryTextCheckedMap(state, action) {
      state.regulatoryTextCheckedMap = { ...action.payload }
    },

    setSaveOrUpdateRegulation(state, action) {
      state.saveOrUpdateRegulation = action.payload
    },

    setSelectedRegulatoryZoneId(state, action) {
      state.selectedRegulatoryZoneId = action.payload
    },

    setStatus(state, action) {
      state.status = action.payload
    },

    updateProcessingRegulationByKey(state, { payload: { key, value } }) {
      if (state.status !== STATUS.READY && state.status !== STATUS.IDLE) {
        return
      }

      state.processingRegulation[key] = value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    },

    // TODO Fix these types of find a cleaner way to achieve that.
    updateProcessingRegulationByKeyAndSubKey<
      Key extends keyof RegulationState['processingRegulation'],
      SubKey extends keyof RegulationState['processingRegulation'][Key],
      Value extends RegulationState['processingRegulation'][Key][SubKey]
    >(
      state: RegulationState,
      action: PayloadAction<{
        key: Key
        subKey: SubKey
        value: Value
      }>
    ) {
      const {
        payload: { key, subKey, value }
      } = action

      if (state.status !== STATUS.READY && state.status !== STATUS.IDLE) {
        return
      }

      ;(state as any).processingRegulation[key][subKey] = value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    }
  }
})

export const {
  addObjectToRegulatoryTextCheckedMap,
  resetState,
  setFishingPeriod,
  setFishingPeriodOtherInfo,
  setHasOneOrMoreValuesMissing,
  setIsConfirmModalOpen,
  setIsRemoveModalOpen,
  setProcessingRegulation,
  setProcessingRegulationDeleted,
  setProcessingRegulationSaved,
  setRegulationModified,
  setRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setSelectedRegulatoryZoneId,
  setStatus,
  updateProcessingRegulationByKey,
  updateProcessingRegulationByKeyAndSubKey
} = regulationSlice.actions

export const regulationSliceActions = regulationSlice.actions

export const regulationReducer = regulationSlice.reducer
