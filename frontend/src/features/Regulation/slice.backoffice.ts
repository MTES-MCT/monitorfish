// TODO Reunite this slice with its family.

import { createSlice } from '@reduxjs/toolkit'

import { DEFAULT_REGULATION, getRegulatoryLayersWithoutTerritory, REGULATORY_REFERENCE_KEYS } from './utils'
import { STATUS } from '../BackOffice/constants'

import type { EditedRegulatoryZone, RegulatoryLawTypes, RegulatoryZone, RegulatoryZoneDraft } from './types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ValueOf } from 'type-fest'

export type BackOfficeRegulationState = {
  hasOneOrMoreValuesMissing: boolean | undefined
  isConfirmModalOpen: boolean
  isRemoveModalOpen: boolean
  lawTypeOpened: string | undefined
  layersTopicsByRegTerritory: Record<string, Record<string, EditedRegulatoryZone[]>>
  loadingRegulatoryZoneMetadata: boolean
  processingRegulation: RegulatoryZoneDraft
  regulationDeleted: boolean
  regulationModified: boolean
  regulationSaved: boolean
  regulatoryLayerLawTypes: RegulatoryLawTypes | undefined
  regulatoryTextCheckedMap: Record<number, boolean> | undefined
  regulatoryTopics: string[]
  regulatoryZoneMetadata: RegulatoryZone | undefined
  regulatoryZoneMetadataPanelIsOpen: boolean
  saveOrUpdateRegulation: boolean
  selectedRegulatoryZoneId: string | undefined
  status: ValueOf<typeof STATUS>
}
const INITIAL_STATE: BackOfficeRegulationState = {
  hasOneOrMoreValuesMissing: undefined,
  isConfirmModalOpen: false,
  isRemoveModalOpen: false,
  lawTypeOpened: undefined,
  layersTopicsByRegTerritory: {},
  // TODO Check this prop, it's never updated but used in `features/BackOffice/index.tsx`.
  loadingRegulatoryZoneMetadata: false,
  processingRegulation: DEFAULT_REGULATION,
  regulationDeleted: false,
  regulationModified: false,
  regulationSaved: false,
  regulatoryLayerLawTypes: undefined,
  regulatoryTextCheckedMap: undefined,
  regulatoryTopics: [],
  regulatoryZoneMetadata: undefined,
  regulatoryZoneMetadataPanelIsOpen: false,
  saveOrUpdateRegulation: false,
  selectedRegulatoryZoneId: undefined,
  status: STATUS.IDLE
}

const backOfficeRegulationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulation',
  reducers: {
    addObjectToRegulatoryTextCheckedMap(state, action: PayloadAction<{ complete: boolean; index: number }>) {
      state.regulatoryTextCheckedMap = {
        ...(state.regulatoryTextCheckedMap ?? {}),
        [action.payload.index]: action.payload.complete
      }
    },

    resetState: () => INITIAL_STATE,

    setFishingPeriod(state, { payload: { key, value } }) {
      const nextFishingPeriod = {
        ...state.processingRegulation.fishingPeriod,
        [key]: value
      }

      state.processingRegulation = {
        ...state.processingRegulation,
        [REGULATORY_REFERENCE_KEYS.FISHING_PERIOD]: nextFishingPeriod
      }
    },

    setFishingPeriodOtherInfo(state, action: PayloadAction<string>) {
      state.processingRegulation[REGULATORY_REFERENCE_KEYS.FISHING_PERIOD].otherInfo = action.payload
    },

    setHasOneOrMoreValuesMissing(state, action: PayloadAction<boolean | undefined>) {
      state.hasOneOrMoreValuesMissing = action.payload
    },

    setIsConfirmModalOpen(state, action: PayloadAction<boolean>) {
      state.isConfirmModalOpen = action.payload
    },

    setIsRemoveModalOpen(state, action: PayloadAction<boolean>) {
      state.isRemoveModalOpen = action.payload
    },

    setLayersTopicsByRegTerritory(state, action) {
      if (action.payload) {
        state.layersTopicsByRegTerritory = action.payload
      }
    },

    setProcessingRegulation(state, action: PayloadAction<RegulatoryZoneDraft>) {
      state.status = STATUS.READY
      state.processingRegulation = action.payload
    },

    setProcessingRegulationDeleted(state, action) {
      state.regulationDeleted = action.payload
    },

    setProcessingRegulationSaved(state, action: PayloadAction<boolean>) {
      state.regulationSaved = action.payload
    },

    setRegulationModified(state, action: PayloadAction<boolean>) {
      state.regulationModified = action.payload
    },

    setRegulatoryLayerLawTypes(
      state,
      action: PayloadAction<Record<string, Record<string, Record<string, RegulatoryZone[]>>>>
    ) {
      state.regulatoryLayerLawTypes = getRegulatoryLayersWithoutTerritory(action.payload)
    },

    setRegulatoryTextCheckedMap(state, action: PayloadAction<Record<number, boolean>>) {
      state.regulatoryTextCheckedMap = action.payload
    },

    setRegulatoryZoneMetadata(state, action: PayloadAction<RegulatoryZone | undefined>) {
      state.loadingRegulatoryZoneMetadata = false
      state.regulatoryZoneMetadata = action.payload
    },

    setSaveOrUpdateRegulation(state, action: PayloadAction<boolean>) {
      state.saveOrUpdateRegulation = action.payload
    },

    setSelectedRegulatoryZoneId(state, action) {
      state.selectedRegulatoryZoneId = action.payload
    },

    setStatus(state, action) {
      state.status = action.payload
    },

    updateProcessingRegulationByKey(state, action: PayloadAction<{ key: string; value: any }>) {
      if (state.status !== STATUS.READY && state.status !== STATUS.IDLE) {
        return
      }

      state.processingRegulation[action.payload.key] = action.payload.value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    },

    // TODO Fix these types of find a cleaner way to achieve that.
    updateProcessingRegulationByKeyAndSubKey<
      Key extends keyof BackOfficeRegulationState['processingRegulation'],
      SubKey extends keyof BackOfficeRegulationState['processingRegulation'][Key],
      Value extends BackOfficeRegulationState['processingRegulation'][Key][SubKey]
    >(
      state: BackOfficeRegulationState,
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
  resetState,
  setFishingPeriod,
  setIsConfirmModalOpen,
  setIsRemoveModalOpen,
  setProcessingRegulation,
  setProcessingRegulationSaved,
  setRegulationModified,
  setRegulatoryTextCheckedMap,
  setSaveOrUpdateRegulation,
  setSelectedRegulatoryZoneId,
  setStatus,
  updateProcessingRegulationByKey
} = backOfficeRegulationSlice.actions

export const backOfficeRegulationActions = backOfficeRegulationSlice.actions
export const backOfficeRegulationReducer = backOfficeRegulationSlice.reducer
