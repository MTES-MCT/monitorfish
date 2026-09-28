// TODO Rethink Regulatory naming? Regulatory (an adjective rather than an object name), Regulation difference.

import { createSlice } from '@reduxjs/toolkit'
import { fromPairs, groupBy } from 'lodash-es'

import { STATUS } from './components/RegulationTables/constants'
import {
  DEFAULT_REGULATION,
  findCurrentRegulatoryZones,
  getRegulatoryLayersWithoutTerritory,
  REGULATORY_REFERENCE_KEYS
} from './utils'

import type { EditedRegulatoryZone, RegulatoryLawTypes, RegulatoryZone, RegulatoryZoneDraft } from './types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Extent } from 'ol/extent'

export type RegulationState = {
  hasOneOrMoreValuesMissing: boolean | undefined
  isConfirmModalOpen: boolean
  isRemoveModalOpen: boolean
  lawTypeOpened: string | undefined
  layersTopicsByRegTerritory: Record<string, Record<string, Record<string, RegulatoryZone[]>>>
  loadingRegulatoryZoneMetadata: boolean
  processingRegulation: RegulatoryZoneDraft
  regulationDeleted: boolean
  regulationModified: boolean
  regulationSaved: boolean
  regulationSearchedZoneExtent: Extent
  regulatoryLayerLawTypes: RegulatoryLawTypes | undefined
  regulatoryTextCheckedMap: Record<number, boolean> | undefined
  regulatoryTopics: string[]
  regulatoryTopicsOpened: string[]
  regulatoryZoneMetadata: RegulatoryZone | undefined
  regulatoryZoneMetadataPanelIsOpen: boolean
  regulatoryZones: RegulatoryZone[]
  regulatoryZonesToPreview: Partial<RegulatoryZone>[]
  saveOrUpdateRegulation: boolean
  selectedRegulatoryLayers: Record<string, RegulatoryZone[]> | null
  selectedRegulatoryZoneId: string | undefined
  status: STATUS
}
const INITIAL_STATE: RegulationState = {
  hasOneOrMoreValuesMissing: undefined,
  isConfirmModalOpen: false,
  isRemoveModalOpen: false,
  lawTypeOpened: undefined,
  layersTopicsByRegTerritory: {},
  loadingRegulatoryZoneMetadata: false,
  processingRegulation: DEFAULT_REGULATION,
  regulationDeleted: false,
  regulationModified: false,
  regulationSaved: false,
  regulationSearchedZoneExtent: [],
  regulatoryLayerLawTypes: undefined,
  regulatoryTextCheckedMap: undefined,

  regulatoryTopics: [],
  regulatoryTopicsOpened: [],
  regulatoryZoneMetadata: undefined,
  regulatoryZoneMetadataPanelIsOpen: false,
  regulatoryZones: [],
  regulatoryZonesToPreview: [],
  saveOrUpdateRegulation: false,
  selectedRegulatoryLayers: null,
  selectedRegulatoryZoneId: undefined,
  status: STATUS.IDLE
}

const regulationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulation',
  reducers: {
    addObjectToRegulatoryTextCheckedMap(state, action: PayloadAction<{ complete: boolean; index: number }>) {
      state.regulatoryTextCheckedMap = {
        ...state.regulatoryTextCheckedMap,
        [action.payload.index]: action.payload.complete
      }
    },

    addRegulatoryTopicOpened(state, action: PayloadAction<string>) {
      state.regulatoryTopicsOpened = [...state.regulatoryTopicsOpened, action.payload]
    },

    /**
     * Add regulatory zones to "My Zones" regulatory selection
     */
    addRegulatoryZonesToMyLayers(state, action: PayloadAction<RegulatoryZone[]>) {
      const myRegulatoryLayers = { ...state.selectedRegulatoryLayers }

      // TODO Make that functional.
      action.payload.forEach(regulatoryZone => {
        const myTopicRegulatoryLayer = myRegulatoryLayers[regulatoryZone.topic]

        if (!myTopicRegulatoryLayer || !myTopicRegulatoryLayer.length) {
          myRegulatoryLayers[regulatoryZone.topic] = [regulatoryZone]
        } else if (myTopicRegulatoryLayer && !myTopicRegulatoryLayer.some(zone => zone.id === regulatoryZone.id)) {
          myRegulatoryLayers[regulatoryZone.topic] = myTopicRegulatoryLayer.concat(regulatoryZone)
        }
      })

      state.selectedRegulatoryLayers = myRegulatoryLayers
    },

    closeRegulatoryZoneMetadataPanel(state) {
      state.regulatoryZoneMetadataPanelIsOpen = false
      state.regulatoryZoneMetadata = undefined
    },

    removeRegulatoryTopicOpened(state, action: PayloadAction<string>) {
      state.regulatoryTopicsOpened = state.regulatoryTopicsOpened.filter(
        regulatoryTopicOpened => regulatoryTopicOpened !== action.payload
      )
    },

    /**
     * Remove a selected regulatory zone by its ID.
     */
    removeSelectedZoneById(state, action: PayloadAction<number | string>) {
      if (!state.selectedRegulatoryLayers) {
        throw new Error('`state.selectedRegulatoryLayers` is null.')
      }

      const selectedRegulatoryLayersAsPairs = Object.entries(state.selectedRegulatoryLayers)
      const nextSelectedRegulatoryLayersAsPairs = selectedRegulatoryLayersAsPairs
        // Remove layer from the group
        .map(([topic, regulatoryZones]): [string, RegulatoryZone[]] => [
          topic,
          regulatoryZones.filter(regulatoryZone => regulatoryZone.id !== action.payload)
        ])
        // Remove layer group if it's empty
        .filter(([, regulatoryZones]) => regulatoryZones.length > 0)
      state.selectedRegulatoryLayers = fromPairs(nextSelectedRegulatoryLayersAsPairs)
    },

    /**
     * Remove a group of selected regulatory zones by their common topic.
     */
    removeSelectedZonesByTopic(state, action: PayloadAction<string>) {
      if (!state.selectedRegulatoryLayers) {
        throw new Error('`state.selectedRegulatoryLayers` is null.')
      }

      const selectedRegulatoryLayersAsPairs = Object.entries(state.selectedRegulatoryLayers)
      const nextSelectedRegulatoryLayersAsPairs = selectedRegulatoryLayersAsPairs.filter(
        ([topic]) => topic !== action.payload
      )
      state.selectedRegulatoryLayers = fromPairs(nextSelectedRegulatoryLayersAsPairs)
    },

    resetLoadingRegulatoryZoneMetadata(state) {
      state.loadingRegulatoryZoneMetadata = false
    },

    resetRegulatoryGeometriesToPreview(state) {
      state.regulatoryZonesToPreview = []
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

    setLawTypeOpened(state, action) {
      state.lawTypeOpened = action.payload
    },

    setLayersTopicsByRegTerritory(
      state,
      action: PayloadAction<Record<string, Record<string, Record<string, RegulatoryZone[]>>>>
    ) {
      state.layersTopicsByRegTerritory = action.payload
    },

    setLoadingRegulatoryZoneMetadata(state) {
      state.loadingRegulatoryZoneMetadata = true
      state.regulatoryZoneMetadata = undefined
      state.regulatoryZoneMetadataPanelIsOpen = true
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

    setRegulatoryGeometriesToPreview(state, action: PayloadAction<Partial<RegulatoryZone>[]>) {
      state.regulatoryZonesToPreview = action.payload
    },

    setRegulatoryLayerLawTypes(
      state,
      action: PayloadAction<Record<string, Record<string, Record<string, RegulatoryZone[]>>>>
    ) {
      state.regulatoryLayerLawTypes = action.payload ? getRegulatoryLayersWithoutTerritory(action.payload) : undefined
    },

    setRegulatoryTextCheckedMap(state, action: PayloadAction<Record<number, boolean>>) {
      state.regulatoryTextCheckedMap = action.payload
    },

    setRegulatoryTopics(state, action) {
      state.regulatoryTopics = action.payload
    },

    setRegulatoryTopicsOpened(state, action) {
      state.regulatoryTopicsOpened = action.payload
    },

    setRegulatoryZoneMetadata(state, action: PayloadAction<RegulatoryZone | undefined>) {
      state.loadingRegulatoryZoneMetadata = false
      state.regulatoryZoneMetadata = action.payload
    },

    setRegulatoryZones(state, action: PayloadAction<RegulatoryZone[]>) {
      state.regulatoryZones = action.payload
    },

    setSaveOrUpdateRegulation(state, action: PayloadAction<boolean>) {
      state.saveOrUpdateRegulation = action.payload
    },

    /**
     * Set the regulation searched zone extent - used to fit the extent into the OpenLayers view
     */
    setSearchedRegulationZoneExtent(state, action: PayloadAction<Extent>) {
      state.regulationSearchedZoneExtent = action.payload
    },

    setSelectedRegulatoryZone(
      state,
      action: PayloadAction<{
        regulatoryZones: RegulatoryZone[] | EditedRegulatoryZone[]
        selectedRegulatoryZoneIds: Array<number | string>
      }>
    ) {
      const { regulatoryZones, selectedRegulatoryZoneIds } = action.payload

      state.selectedRegulatoryLayers = groupBy(
        findCurrentRegulatoryZones<RegulatoryZone | EditedRegulatoryZone>(regulatoryZones, selectedRegulatoryZoneIds),
        regulatoryZone => regulatoryZone.topic
      ) as Record<string, RegulatoryZone[]>
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

    // TODO Fix these types and find a cleaner way to achieve that. Proposal: pass a partial `RegulatoryZoneDraft` as param and use a "deepMerge" function.
    updateProcessingRegulationByKeyAndSubKey(
      state,
      action: PayloadAction<{
        key: string
        subKey: string
        value: any
      }>
    ) {
      const {
        payload: { key, subKey, value }
      } = action

      if (state.status !== STATUS.READY && state.status !== STATUS.IDLE) {
        return
      }

      state.processingRegulation[key][subKey] = value
      if (!state.regulationModified) {
        state.regulationModified = true
      }
    }
  }
})

export const regulationActions = regulationSlice.actions
export const regulationReducer = regulationSlice.reducer
