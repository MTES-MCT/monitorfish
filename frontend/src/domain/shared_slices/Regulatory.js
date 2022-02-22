import { createSlice } from '@reduxjs/toolkit'
import { SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY, SELECTED_REG_ZONES_LOCAL_STORAGE_KEY } from '../entities/layers'
import { getLocalStorageState } from '../../utils'
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

const updateSelectedRegulatoryLayers = (regulatoryLayers, regulatoryZoneId, selectedRegulatoryLayers, selectedRegulatoryLayerIds) => {
  const nextSelectedRegulatoryLayers = { ...selectedRegulatoryLayers }
  const nextSelectedRegulatoryLayerIds = [...selectedRegulatoryLayerIds]
  const nextRegulatoryZone = regulatoryLayers.find(zone => zone.id === regulatoryZoneId)
  if (nextRegulatoryZone) {
    if (nextRegulatoryZone.lawType && nextRegulatoryZone.topic) {
      pushRegulatoryZoneInTopicList(nextSelectedRegulatoryLayers, nextRegulatoryZone)
      nextSelectedRegulatoryLayerIds.push(nextRegulatoryZone.id)
      return { selectedRegulatoryLayers: nextSelectedRegulatoryLayers, selectedRegulatoryLayerIds: nextSelectedRegulatoryLayerIds }
    } else if (nextRegulatoryZone.nextId) {
      return updateSelectedRegulatoryLayers(regulatoryLayers, nextRegulatoryZone.nextId, selectedRegulatoryLayers, selectedRegulatoryLayerIds)
    }
    return null
  } else {
    return null
  }
}

const regulatorySlice = createSlice({
  name: 'regulatory',
  initialState: {
    isReadyToShowRegulatoryLayers: false,
    /** @type {Object.<string, RegulatoryZone[]>} selectedRegulatoryLayers */
    selectedRegulatoryLayers: null,
    regulatoryZoneMetadata: null,
    /** @type RegulatoryLawTypes regulatoryLayerLawTypes */
    regulatoryLayerLawTypes: [],
    loadingRegulatoryZoneMetadata: false,
    regulatoryZoneMetadataPanelIsOpen: false,
    lawTypeOpened: null,
    regulatoryTopicsOpened: [],
    regulatoryTopics: [],
    layersTopicsByRegTerritory: {},
    /** @type ol.geom.Geometry[] */
    regulatoryGeometriesToPreview: null,
    simplifiedGeometries: true,
    regulationSearchedZoneExtent: []
  },
  reducers: {
    setRegulatoryGeometriesToPreview (state, action) {
      state.regulatoryGeometriesToPreview = action.payload
    },
    resetRegulatoryGeometriesToPreview (state) {
      state.regulatoryGeometriesToPreview = null
    },
    /**
     * Add regulatory zones to "My Zones" regulatory selection
     * @memberOf RegulatoryReducer
     * @param {Object=} state
     * @param {RegulatoryZone[]} action - The regulatory zones
     */
    addRegulatoryZonesToMyLayers (state, action) {
      const myRegulatoryLayers = { ...state.selectedRegulatoryLayers }
      const myRegulatoryLayerIds = getLocalStorageState([], SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY)

      action.payload.forEach(regulatoryZone => {
        if (!myRegulatoryLayers[regulatoryZone.topic] || !myRegulatoryLayers[regulatoryZone.topic].length) {
          myRegulatoryLayers[regulatoryZone.topic] = [regulatoryZone]
        } else {
          if (!myRegulatoryLayers[regulatoryZone.topic].some(zone => zone.id === regulatoryZone.id)) {
            myRegulatoryLayers[regulatoryZone.topic] = myRegulatoryLayers[regulatoryZone.topic].concat(regulatoryZone)
          }
        }
        myRegulatoryLayerIds.push(regulatoryZone.id)
      })

      state.selectedRegulatoryLayers = myRegulatoryLayers
      window.localStorage.setItem(SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY, JSON.stringify(myRegulatoryLayerIds))
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
    removeRegulatoryZonesFromMyLayers (state, action) {
      const { topic, id } = action.payload
      if (topic) {
        state.selectedRegulatoryLayers[topic] = state.selectedRegulatoryLayers[topic]
          .filter(subZone => !subZone.id === id)
      }

      if (!state.selectedRegulatoryLayers[action.payload.topic].length) {
        delete state.selectedRegulatoryLayers[action.payload.topic]
      }

      let nextSelectedRegulatoryLayerIds = getLocalStorageState([], SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY)
      nextSelectedRegulatoryLayerIds = nextSelectedRegulatoryLayerIds
        .filter(selectedRegulatoryLayerId => !selectedRegulatoryLayerId === id)
      window.localStorage.setItem(SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY, JSON.stringify(nextSelectedRegulatoryLayerIds))
    },
    setIsReadyToShowRegulatoryZones (state) {
      state.isReadyToShowRegulatoryLayers = true
    },
    setLoadingRegulatoryZoneMetadata (state) {
      state.loadingRegulatoryZoneMetadata = true
      state.regulatoryZoneMetadata = null
      state.regulatoryZoneMetadataPanelIsOpen = true
    },
    resetLoadingRegulatoryZoneMetadata (state) {
      state.loadingRegulatoryZoneMetadata = false
    },
    setRegulatoryZoneMetadata (state, action) {
      state.loadingRegulatoryZoneMetadata = false
      state.regulatoryZoneMetadata = action.payload
    },
    closeRegulatoryZoneMetadataPanel (state) {
      state.regulatoryZoneMetadataPanelIsOpen = false
      state.regulatoryZoneMetadata = null
    },
    setLawTypeOpened (state, action) {
      state.lawTypeOpened = action.payload
    },
    setRegulatoryTopicsOpened (state, action) {
      state.regulatoryTopicsOpened = action.payload
    },
    addRegulatoryTopicOpened (state, action) {
      state.regulatoryTopicsOpened.push(action.payload)
    },
    removeRegulatoryTopicOpened (state, action) {
      state.regulatoryTopicsOpened = state.regulatoryTopicsOpened.filter(e => e !== action.payload)
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
     *      regulatoryGears: Object { authorized: undefined, allGears: undefined, allTowedGears: undefined, … },
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
    setRegulatoryLayerLawTypes (state, action) {
      state.regulatoryLayerLawTypes = getRegulatoryLayersWithoutTerritory(action.payload)
    },
    setLayersTopicsByRegTerritory (state, action) {
      if (action.payload) {
        state.layersTopicsByRegTerritory = action.payload
      }
    },
    setSelectedRegulatoryZone (state, action) {
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
          }
          // remove SELECTED_REG_ZONES_LOCAL_STORAGE_KEY item in localstorage
        }
        selectedRegulatoryLayerIds
          .forEach(selectedRegulatoryZoneId => {
            const updatedObjects = updateSelectedRegulatoryLayers(regulatoryLayers, selectedRegulatoryZoneId, nextSelectedRegulatoryLayers, nextSelectedRegulatoryLayerIds)
            if (updatedObjects.selectedRegulatoryLayers && updatedObjects.selectedRegulatoryLayerIds) {
              nextSelectedRegulatoryLayers = updatedObjects.selectedRegulatoryLayers
              nextSelectedRegulatoryLayerIds = updatedObjects.selectedRegulatoryLayerIds
            }
            return null
          })
        window.localStorage.setItem(SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY, JSON.stringify(nextSelectedRegulatoryLayerIds))
        state.selectedRegulatoryLayers = nextSelectedRegulatoryLayers
      }
    },
    setRegulatoryTopics (state, action) {
      state.regulatoryTopics = action.payload
    },
    showSimplifiedGeometries (state) {
      state.simplifiedGeometries = true
    },
    showWholeGeometries (state) {
      state.simplifiedGeometries = false
    },
    /**
     * Set the regulation searched zone extent - used to fit the extent into the OpenLayers view
     * @function setProcessingRegulationSearchedZoneExtent
     * @memberOf RegulatoryReducer
     * @param {Object=} state
     * @param {{payload: number[]}} action - the extent
     */
    setProcessingRegulationSearchedZoneExtent (state, action) {
      state.regulationSearchedZoneExtent = action.payload
    }
  }
})

export const {
  addRegulatoryZonesToMyLayers,
  removeRegulatoryZonesFromMyLayers,
  setIsReadyToShowRegulatoryZones,
  setLoadingRegulatoryZoneMetadata,
  resetLoadingRegulatoryZoneMetadata,
  setRegulatoryZoneMetadata,
  closeRegulatoryZoneMetadataPanel,
  setRegulatoryLayerLawTypes,
  setLawTypeOpened,
  addRegulatoryTopicOpened,
  removeRegulatoryTopicOpened,
  setRegulatoryTopicsOpened,
  setRegulatoryTopics,
  setLayersTopicsByRegTerritory,
  setRegulatoryGeometriesToPreview,
  resetRegulatoryGeometriesToPreview,
  showSimplifiedGeometries,
  showWholeGeometries,
  setProcessingRegulationSearchedZoneExtent,
  setSelectedRegulatoryZone
} = regulatorySlice.actions

export default regulatorySlice.reducer
