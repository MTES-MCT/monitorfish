// TODO Rethink Regulatory naming? Regulatory (an adjective rather than an object name), Regulation difference.

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import {
  SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY,
  SELECTED_REG_ZONES_LOCAL_STORAGE_KEY
} from '../entities/layers/constants'
import { getRegulatoryLayersWithoutTerritory } from '../entities/regulatory'

import type { RegulatoryLawTypes, RegulatoryZone } from '../types/regulation'
import type { Geometry } from 'ol/geom'

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
  regulatoryLayers,
  regulatoryZoneId,
  selectedRegulatoryLayers,
  selectedRegulatoryLayerIds
) => {
  const nextSelectedRegulatoryLayers = { ...selectedRegulatoryLayers }
  const nextSelectedRegulatoryLayerIds = [...selectedRegulatoryLayerIds]
  const nextRegulatoryZone = regulatoryLayers.find(zone => zone.id === regulatoryZoneId)
  if (nextRegulatoryZone) {
    if (nextRegulatoryZone.lawType && nextRegulatoryZone.topic) {
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

export type RegulatoryState = {
  isReadyToShowRegulatoryLayers: boolean
  // TODO Type this prop.
  lawTypeOpened: Record<string, any> | null
  // TODO Type this prop.
  layersTopicsByRegTerritory: Record<string, any>
  loadingRegulatoryZoneMetadata: boolean
  // TODO Type this prop.
  regulationSearchedZoneExtent: Record<string, any>[]
  regulatoryGeometriesToPreview: Geometry[] | null
  regulatoryLayerLawTypes: RegulatoryLawTypes | undefined
  // TODO Type this prop.
  regulatoryTopics: Record<string, any>[]
  // TODO Type this prop.
  regulatoryTopicsOpened: Record<string, any>[]
  // TODO Type this prop.
  regulatoryZoneMetadata: Record<string, any> | null
  regulatoryZoneMetadataPanelIsOpen: boolean
  // TODO Type this prop.
  selectedRegulatoryLayers: Record<string, RegulatoryZone[]> | null
  simplifiedGeometries: boolean
}
const INITIAL_STATE: RegulatoryState = {
  isReadyToShowRegulatoryLayers: false,
  lawTypeOpened: null,
  layersTopicsByRegTerritory: {},
  loadingRegulatoryZoneMetadata: false,
  regulationSearchedZoneExtent: [],
  regulatoryGeometriesToPreview: null,
  regulatoryLayerLawTypes: undefined,
  regulatoryTopics: [],
  regulatoryTopicsOpened: [],
  regulatoryZoneMetadata: null,
  regulatoryZoneMetadataPanelIsOpen: false,
  selectedRegulatoryLayers: null,
  simplifiedGeometries: true
}

const regulatorySlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulatory',
  reducers: {
    // TODO Type these params.
    addRegulatoryTopicOpened(state, action: PayloadAction<Record<string, any>>) {
      state.regulatoryTopicsOpened = [...state.regulatoryTopicsOpened, action.payload]
    },

    /**
     * Add regulatory zones to "My Zones" regulatory selection
     * @memberOf RegulatoryReducer
     * @param {Object=} state
     * @param {RegulatoryZone[]} action - The regulatory zones
     */
    addRegulatoryZonesToMyLayers(state, action) {
      const myRegulatoryLayers = { ...state.selectedRegulatoryLayers }
      const myRegulatoryLayerIds = getLocalStorageState([], SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY)

      action.payload.forEach(regulatoryZone => {
        const myTopicRegulatoryLayer = myRegulatoryLayers[regulatoryZone.topic]

        if (!myTopicRegulatoryLayer || !myTopicRegulatoryLayer.length) {
          // TODO Make that functional.
          myRegulatoryLayers[regulatoryZone.topic] = [regulatoryZone]
        } else if (myTopicRegulatoryLayer && !myTopicRegulatoryLayer.some(zone => zone.id === regulatoryZone.id)) {
          // TODO Make that functional.
          myRegulatoryLayers[regulatoryZone.topic] = myTopicRegulatoryLayer.concat(regulatoryZone)
        }

        myRegulatoryLayerIds.push(regulatoryZone.id)
      })

      state.selectedRegulatoryLayers = myRegulatoryLayers
      window.localStorage.setItem(SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY, JSON.stringify(myRegulatoryLayerIds))
    },

    closeRegulatoryZoneMetadataPanel(state) {
      state.regulatoryZoneMetadataPanelIsOpen = false
      state.regulatoryZoneMetadata = null
    },

    removeRegulatoryTopicOpened(state, action) {
      state.regulatoryTopicsOpened = state.regulatoryTopicsOpened.filter(e => e !== action.payload)
    },
    /**
     * Remove regulatory zone(s) from "My Zones" regulatory selection, by providing a topic name to remove multiple zones
     * or simply the zone name to remove a specified zone
     * @memberOf RegulatoryReducer
     * @param {Object=} state
     * @param {{
     *          topic: string=,
     *          zone: string=
     *          }} action - The regulatory zone(s) to remove
     */
    // TODO Refactor entirely this reducer with functional immutable logic.
    removeRegulatoryZonesFromMyLayers(state, action) {
      const { id, topic } = action.payload
      let nextSelectedRegulatoryLayerIds = getLocalStorageState([], SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY)

      if (topic && !id) {
        ;(state.selectedRegulatoryLayers as any)[topic].forEach(selectedRegulatoryLayer => {
          nextSelectedRegulatoryLayerIds = nextSelectedRegulatoryLayerIds.filter(
            selectedRegulatoryLayerId => selectedRegulatoryLayerId !== selectedRegulatoryLayer.id
          )
        })
        delete (state.selectedRegulatoryLayers as any)[topic]
      } else if (id) {
        ;(state.selectedRegulatoryLayers as any)[topic] = (state.selectedRegulatoryLayers as any)[topic].filter(
          subZone => !subZone.id === id
        )
        nextSelectedRegulatoryLayerIds = nextSelectedRegulatoryLayerIds.filter(
          selectedRegulatoryLayerId => !selectedRegulatoryLayerId === id
        )
      }

      if (!(state.selectedRegulatoryLayers as any)[topic]?.length) {
        delete (state.selectedRegulatoryLayers as any)[topic]
      }

      window.localStorage.setItem(
        SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY,
        JSON.stringify(nextSelectedRegulatoryLayerIds)
      )
    },
    resetLoadingRegulatoryZoneMetadata(state) {
      state.loadingRegulatoryZoneMetadata = false
    },
    resetRegulatoryGeometriesToPreview(state) {
      state.regulatoryGeometriesToPreview = null
    },
    setIsReadyToShowRegulatoryZones(state) {
      state.isReadyToShowRegulatoryLayers = true
    },
    setLawTypeOpened(state, action) {
      state.lawTypeOpened = action.payload
    },
    setLayersTopicsByRegTerritory(state, action) {
      if (action.payload) {
        state.layersTopicsByRegTerritory = action.payload
      }
    },
    setLoadingRegulatoryZoneMetadata(state) {
      state.loadingRegulatoryZoneMetadata = true
      state.regulatoryZoneMetadata = null
      state.regulatoryZoneMetadataPanelIsOpen = true
    },
    /**
     * Set the regulation searched zone extent - used to fit the extent into the OpenLayers view
     * @function setProcessingRegulationSearchedZoneExtent
     * @memberOf RegulatoryReducer
     * @param {Object=} state
     * @param {{payload: number[]}} action - the extent
     */
    setProcessingRegulationSearchedZoneExtent(state, action) {
      state.regulationSearchedZoneExtent = action.payload
    },

    setRegulatoryGeometriesToPreview(state, action) {
      state.regulatoryGeometriesToPreview = action.payload
    },

    /**
     * Set regulatory data structured as
     * LawType: {
     *   Topic: Zone[]
     * }
     * (see example)
     * @param {Object=} state
     * @param {{payload: RegulatoryLawTypes}} action - The regulatory data
     * @memberOf RegulatoryReducer
     * @example
     * {
     *  "Reg locale / NAMO": {
     *   "Armor_CSJ_Dragues": [
     *     {
     *      bycatch: undefined,
     *      closingDate: undefined,
     *      deposit: undefined,
     *      fishingPeriod: Object { authorized: undefined, annualRecurrence: undefined, dateRanges: [], … },
     *      gears: "DHB, DRH, DHS",
     *      geometry: null,
     *      id: 3012,
     *      lawType: "Reg. MED",
     *      mandatoryDocuments: undefined,
     *      obligations: undefined,
     *      openingDate: undefined,
     *      period: undefined,
     *      permissions: undefined,
     *      prohibitedGears: null,
     *      prohibitedSpecies: null,
     *      prohibitions: undefined,
     *      quantity: undefined,
     *      region: "Occitanie, Languedoc-Roussillon",
     *      gearRegulation: Object { authorized: undefined, allGears: undefined, allTowedGears: undefined, … },
     *      regulatoryReferences: Array [ {…} ],
     *      regulatorySpecies: Object { authorized: undefined, allSpecies: undefined, otherInfo: undefined, … },
     *      rejections: undefined,
     *      size: undefined,
     *      species: "coquillages et appâts\n",
     *      state: undefined,
     *      technicalMeasurements: undefined,
     *      topic: "Etang de Thau-Ingril Mèze",
     *      upcomingRegulatoryReferences: undefined,
     *      zone: "Etang de Thau-Ingrill_Drague-à-main",
     *      next_id: undefined
     *     }
     *   ]
     *   "GlÃ©nan_CSJ_Dragues": (1) […],
     *   "Bretagne_Laminaria_Hyperborea_Scoubidous - 2019": (1) […],
     *  },
     *  "Reg locale / Sud-Atlantique, SA": {
     *   "Embouchure_Gironde": (1) […],
     *   "Pertuis_CSJ_Dragues": (6) […],
     *   "SA_Chaluts_Pelagiques": (5) […]
     *  }
     * }
     */
    setRegulatoryLayerLawTypes(state, action) {
      state.regulatoryLayerLawTypes = getRegulatoryLayersWithoutTerritory(action.payload)
    },

    setRegulatoryTopics(state, action) {
      state.regulatoryTopics = action.payload
    },

    setRegulatoryTopicsOpened(state, action) {
      state.regulatoryTopicsOpened = action.payload
    },

    setRegulatoryZoneMetadata(state, action) {
      state.loadingRegulatoryZoneMetadata = false
      state.regulatoryZoneMetadata = action.payload
    },

    setSelectedRegulatoryZone(state, action) {
      if (action.payload?.length) {
        const regulatoryLayers = action.payload
        let nextSelectedRegulatoryLayers = {}
        let nextSelectedRegulatoryLayerIds = []
        let selectedRegulatoryLayerIds = getLocalStorageState([], SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY)
        if (!selectedRegulatoryLayerIds.length) {
          const selectedRegulatoryLayers = getLocalStorageState([], SELECTED_REG_ZONES_LOCAL_STORAGE_KEY)
          if (Object.keys(selectedRegulatoryLayers).length) {
            selectedRegulatoryLayerIds = []
            Object.keys(selectedRegulatoryLayers).forEach(selectedRegulatoryTopic => {
              selectedRegulatoryLayers[selectedRegulatoryTopic].forEach(selectedRegulatoryLayerId => {
                selectedRegulatoryLayerIds.push(selectedRegulatoryLayerId.id)
              })
            })
            window.localStorage.removeItem(SELECTED_REG_ZONES_LOCAL_STORAGE_KEY)
          }
        }
        selectedRegulatoryLayerIds.forEach(selectedRegulatoryZoneId => {
          const updatedObjects = updateSelectedRegulatoryLayers(
            regulatoryLayers,
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
        window.localStorage.setItem(
          SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY,
          JSON.stringify(nextSelectedRegulatoryLayerIds)
        )
        state.selectedRegulatoryLayers = nextSelectedRegulatoryLayers
      }
    },

    showSimplifiedGeometries(state) {
      state.simplifiedGeometries = true
    },

    showWholeGeometries(state) {
      state.simplifiedGeometries = false
    }
  }
})

export const {
  addRegulatoryTopicOpened,
  addRegulatoryZonesToMyLayers,
  closeRegulatoryZoneMetadataPanel,
  removeRegulatoryTopicOpened,
  removeRegulatoryZonesFromMyLayers,
  resetLoadingRegulatoryZoneMetadata,
  resetRegulatoryGeometriesToPreview,
  setIsReadyToShowRegulatoryZones,
  setLawTypeOpened,
  setLayersTopicsByRegTerritory,
  setLoadingRegulatoryZoneMetadata,
  setProcessingRegulationSearchedZoneExtent,
  setRegulatoryGeometriesToPreview,
  setRegulatoryLayerLawTypes,
  setRegulatoryTopics,
  setRegulatoryTopicsOpened,
  setRegulatoryZoneMetadata,
  setSelectedRegulatoryZone,
  showSimplifiedGeometries,
  showWholeGeometries
} = regulatorySlice.actions

export const regulatoryReducer = regulatorySlice.reducer
