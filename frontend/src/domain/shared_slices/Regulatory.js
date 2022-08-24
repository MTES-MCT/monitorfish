import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY, SELECTED_REG_ZONES_LOCAL_STORAGE_KEY } from '../entities/layers'
import { getRegulatoryLayersWithoutTerritory } from '../entities/regulatory'

/* eslint-disable */
/** @namespace RegulatoryReducer */
const RegulatoryReducer = null
/* eslint-enable */

const pushRegulatoryZoneInTopicList = (selectedRegulatoryLayers, regulatoryZone) => {
  if (Object.keys(selectedRegulatoryLayers).includes(regulatoryZone.topic)) {
    const nextRegZoneTopic = selectedRegulatoryLayers[regulatoryZone.topic]
    nextRegZoneTopic.push(regulatoryZone)
    selectedRegulatoryLayers[regulatoryZone.topic] = nextRegZoneTopic
  } else {
    selectedRegulatoryLayers[regulatoryZone.topic] = [regulatoryZone]
  }
}

const updateSelectedRegulatoryLayers = (
  regulatoryLayers,
  regulatoryZoneId,
  selectedRegulatoryLayers,
  selectedRegulatoryLayerIds,
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
        selectedRegulatoryLayers: nextSelectedRegulatoryLayers,
      }
    }
    if (nextRegulatoryZone.nextId) {
      return updateSelectedRegulatoryLayers(
        regulatoryLayers,
        nextRegulatoryZone.nextId,
        selectedRegulatoryLayers,
        selectedRegulatoryLayerIds,
      )
    }

    return null
  }

  return null
}

const regulatorySlice = createSlice({
  initialState: {
    isReadyToShowRegulatoryLayers: false,

    lawTypeOpened: null,

    loadingRegulatoryZoneMetadata: false,

    
    layersTopicsByRegTerritory: {},

    /** @type RegulatoryLawTypes regulatoryLayerLawTypes */
regulatoryLayerLawTypes: [],

    regulationSearchedZoneExtent: [],

    regulatoryZoneMetadata: null,

    /** @type ol.geom.Geometry[] */
    regulatoryGeometriesToPreview: null,

    
regulatoryTopics: [],

    /** @type {Object.<string, RegulatoryZone[]>} selectedRegulatoryLayers */
selectedRegulatoryLayers: null,

    regulatoryTopicsOpened: [],

    regulatoryZoneMetadataPanelIsOpen: false,
    simplifiedGeometries: true,
  },
  name: 'regulatory',
  reducers: {
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
        if (!myRegulatoryLayers[regulatoryZone.topic] || !myRegulatoryLayers[regulatoryZone.topic].length) {
          myRegulatoryLayers[regulatoryZone.topic] = [regulatoryZone]
        } else if (!myRegulatoryLayers[regulatoryZone.topic].some(zone => zone.id === regulatoryZone.id)) {
          myRegulatoryLayers[regulatoryZone.topic] = myRegulatoryLayers[regulatoryZone.topic].concat(regulatoryZone)
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
    removeRegulatoryZonesFromMyLayers(state, action) {
      const { id, topic } = action.payload
      let nextSelectedRegulatoryLayerIds = getLocalStorageState([], SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY)

      if (topic && !id) {
        state.selectedRegulatoryLayers[topic].forEach(selectedRegulatoryLayer => {
          nextSelectedRegulatoryLayerIds = nextSelectedRegulatoryLayerIds.filter(
            selectedRegulatoryLayerId => selectedRegulatoryLayerId !== selectedRegulatoryLayer.id,
          )
        })
        delete state.selectedRegulatoryLayers[topic]
      } else if (id) {
        state.selectedRegulatoryLayers[topic] = state.selectedRegulatoryLayers[topic].filter(
          subZone => !subZone.id === id,
        )
        nextSelectedRegulatoryLayerIds = nextSelectedRegulatoryLayerIds.filter(
          selectedRegulatoryLayerId => !selectedRegulatoryLayerId === id,
        )
      }

      if (!state.selectedRegulatoryLayers[topic]?.length) {
        delete state.selectedRegulatoryLayers[topic]
      }

      window.localStorage.setItem(
        SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY,
        JSON.stringify(nextSelectedRegulatoryLayerIds),
      )
    },

    addRegulatoryTopicOpened(state, action) {
      state.regulatoryTopicsOpened.push(action.payload)
    },
    resetLoadingRegulatoryZoneMetadata(state) {
      state.loadingRegulatoryZoneMetadata = false
    },
    removeRegulatoryTopicOpened(state, action) {
      state.regulatoryTopicsOpened = state.regulatoryTopicsOpened.filter(e => e !== action.payload)
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
    setRegulatoryGeometriesToPreview (state, action) {
      state.regulatoryGeometriesToPreview = action.payload
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
            nextSelectedRegulatoryLayerIds,
          )
          if (updatedObjects?.selectedRegulatoryLayers && updatedObjects?.selectedRegulatoryLayerIds) {
            nextSelectedRegulatoryLayers = updatedObjects.selectedRegulatoryLayers
            nextSelectedRegulatoryLayerIds = updatedObjects.selectedRegulatoryLayerIds
          }

          return null
        })
        window.localStorage.setItem(
          SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY,
          JSON.stringify(nextSelectedRegulatoryLayerIds),
        )
        state.selectedRegulatoryLayers = nextSelectedRegulatoryLayers
      }
    },

    showSimplifiedGeometries(state) {
      state.simplifiedGeometries = true
    },

    showWholeGeometries(state) {
      state.simplifiedGeometries = false
    },
  },
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
  setRegulationSearchedZoneExtent,
  setRegulatoryGeometriesToPreview,
  setRegulatoryLayerLawTypes,
  setRegulatoryTopics,
  setRegulatoryTopicsOpened,
  setRegulatoryZoneMetadata,
  setSelectedRegulatoryZone,
  showSimplifiedGeometries,
  showWholeGeometries,
} = regulatorySlice.actions

export default regulatorySlice.reducer
