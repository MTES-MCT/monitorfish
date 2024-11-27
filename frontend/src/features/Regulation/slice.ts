// TODO Rethink Regulatory naming? Regulatory (an adjective rather than an object name), Regulation difference.

import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { createSlice } from '@reduxjs/toolkit'
import { isNotNullish } from '@utils/isNotNullish'
import { fromPairs } from 'lodash/fp'

import { STATUS } from './components/RegulationTables/constants'
import { DEFAULT_REGULATION, getRegulatoryLayersWithoutTerritory, REGULATORY_REFERENCE_KEYS } from './utils'

import type { EditedRegulatoryZone, RegulatoryLawTypes, RegulatoryZone, RegulatoryZoneDraft } from './types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Extent } from 'ol/extent'

// TODO Move that somewhere else.
const pushRegulatoryZoneInTopicList = (selectedRegulatoryLayers, regulatoryZone) => {
  if (Object.keys(selectedRegulatoryLayers).includes(regulatoryZone.topic)) {
    const nextRegZoneTopic = selectedRegulatoryLayers[regulatoryZone.topic]
    nextRegZoneTopic.push(regulatoryZone)
    selectedRegulatoryLayers[regulatoryZone.topic] = nextRegZoneTopic
  } else {
    selectedRegulatoryLayers[regulatoryZone.topic] = [regulatoryZone]
  }
}

// TODO Move that somewhere else.
const updateSelectedRegulatoryLayers = (
  regulatoryLayers: RegulatoryZone[] | EditedRegulatoryZone[],
  regulatoryZoneId: string,
  // TODO This param seems to always be an empty object: remove it with all its related code?
  selectedRegulatoryLayers: {},
  selectedRegulatoryLayerIds: Array<number | string>
) => {
  const nextSelectedRegulatoryLayers = { ...selectedRegulatoryLayers }
  const nextSelectedRegulatoryLayerIds = [...selectedRegulatoryLayerIds]
  const nextRegulatoryZone = regulatoryLayers.find(zone => zone.id === regulatoryZoneId)
  if (nextRegulatoryZone) {
    if (nextRegulatoryZone.id && nextRegulatoryZone.lawType && nextRegulatoryZone.topic) {
      pushRegulatoryZoneInTopicList(nextSelectedRegulatoryLayers, nextRegulatoryZone)
      nextSelectedRegulatoryLayerIds.push(nextRegulatoryZone.id)

      return {
        selectedRegulatoryLayerIds: nextSelectedRegulatoryLayerIds,
        selectedRegulatoryLayers: nextSelectedRegulatoryLayers
      }
    }
    if (nextRegulatoryZone.nextId) {
      return updateSelectedRegulatoryLayers(
        regulatoryLayers,
        nextRegulatoryZone.nextId,
        selectedRegulatoryLayers,
        selectedRegulatoryLayerIds
      )
    }

    return null
  }

  return null
}

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
  simplifiedGeometries: boolean
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
  simplifiedGeometries: true,
  status: STATUS.IDLE
}

const regulationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulatory',
  reducers: {
    addObjectToRegulatoryTextCheckedMap(state, action: PayloadAction<{ complete: boolean; index: number }>) {
      state.regulatoryTextCheckedMap = {
        ...(state.regulatoryTextCheckedMap ?? {}),
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
      // TODO Use Redux Persist.
      const myRegulatoryLayerIds = localStorageManager.get<Array<number | string>>(
        LocalStorageKey.SelectedRegulatoryZoneIds,
        []
      )

      // TODO Make that functional.
      action.payload.forEach(regulatoryZone => {
        const myTopicRegulatoryLayer = myRegulatoryLayers[regulatoryZone.topic]

        if (!myTopicRegulatoryLayer || !myTopicRegulatoryLayer.length) {
          myRegulatoryLayers[regulatoryZone.topic] = [regulatoryZone]
        } else if (myTopicRegulatoryLayer && !myTopicRegulatoryLayer.some(zone => zone.id === regulatoryZone.id)) {
          myRegulatoryLayers[regulatoryZone.topic] = myTopicRegulatoryLayer.concat(regulatoryZone)
        }

        if (regulatoryZone.id) {
          myRegulatoryLayerIds.push(regulatoryZone.id)
        }
      })

      state.selectedRegulatoryLayers = myRegulatoryLayers

      localStorageManager.set(LocalStorageKey.SelectedRegulatoryZoneIds, myRegulatoryLayerIds)
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
      const nextSelectedRegulatoryLayers = fromPairs(nextSelectedRegulatoryLayersAsPairs)
      const nextSelectedRegulatoryLayerIds = nextSelectedRegulatoryLayersAsPairs.reduce<Array<number | string>>(
        (ids, [, regulatoryZones]) => [...ids, ...regulatoryZones.map(({ id }) => id).filter(isNotNullish)],
        []
      )

      state.selectedRegulatoryLayers = nextSelectedRegulatoryLayers

      localStorageManager.set(LocalStorageKey.SelectedRegulatoryZoneIds, nextSelectedRegulatoryLayerIds)
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
      const nextSelectedRegulatoryLayers = fromPairs(nextSelectedRegulatoryLayersAsPairs)
      const nextSelectedRegulatoryLayerIds = nextSelectedRegulatoryLayersAsPairs.reduce<Array<number | string>>(
        (ids, [, regulatoryZones]) => [...ids, ...regulatoryZones.map(({ id }) => id).filter(isNotNullish)],
        []
      )

      state.selectedRegulatoryLayers = nextSelectedRegulatoryLayers

      localStorageManager.set(LocalStorageKey.SelectedRegulatoryZoneIds, nextSelectedRegulatoryLayerIds)
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

    setSelectedRegulatoryZone(state, action: PayloadAction<RegulatoryZone[] | EditedRegulatoryZone[]>) {
      let nextSelectedRegulatoryLayers = {}
      let nextSelectedRegulatoryLayerIds: Array<number | string> = []
      const selectedRegulatoryLayerIds = localStorageManager.get<string[]>(
        LocalStorageKey.SelectedRegulatoryZoneIds,
        []
      )

      selectedRegulatoryLayerIds.forEach(selectedRegulatoryZoneId => {
        const updatedObjects = updateSelectedRegulatoryLayers(
          action.payload,
          selectedRegulatoryZoneId,
          nextSelectedRegulatoryLayers,
          nextSelectedRegulatoryLayerIds
        )
        if (updatedObjects?.selectedRegulatoryLayers && updatedObjects?.selectedRegulatoryLayerIds) {
          nextSelectedRegulatoryLayers = updatedObjects.selectedRegulatoryLayers
          nextSelectedRegulatoryLayerIds = updatedObjects.selectedRegulatoryLayerIds
        }

        return null
      })

      state.selectedRegulatoryLayers = nextSelectedRegulatoryLayers

      localStorageManager.set(LocalStorageKey.SelectedRegulatoryZoneIds, nextSelectedRegulatoryLayerIds)
    },

    setSelectedRegulatoryZoneId(state, action) {
      state.selectedRegulatoryZoneId = action.payload
    },

    setStatus(state, action) {
      state.status = action.payload
    },

    showSimplifiedGeometries(state) {
      state.simplifiedGeometries = true
    },

    showWholeGeometries(state) {
      state.simplifiedGeometries = false
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
