import { createSlice } from '@reduxjs/toolkit'
import { SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY } from '../entities/layers'
import { getLocalStorageState } from '../../utils'

/* eslint-disable */
/** @namespace RegulatoryReducer */
const RegulatoryReducer = null
/* eslint-enable */

const regulatorySlice = createSlice({
  name: 'regulatory',
  initialState: {
    isReadyToShowRegulatoryLayers: false,
    /** @type {Object.<string, RegulatoryZone[]>} selectedRegulatoryLayers */
    selectedRegulatoryLayers: null,
    regulatoryZoneMetadata: null,
    /** @type RegulatoryLawTypes regulatoryLayerLawTypes */
    regulatoryLayerLawTypes: [],
    /** @type RegulatoryZone[] regulatoryLayers */
    regulatoryLayers: [],
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
     *      zone: "Etang de Thau-Ingrill_Drague-à-main"
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
      state.regulatoryLayerLawTypes = action.payload
      if (state.regulatoryLayers && state.regulatoryLayers.length) {
        const selectedRegulatoryLayers = getLocalStorageState([], SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY)
        const nextSelectedRegulatoryLayers = {}
        const nextSelectedRegulatoryLayerIds = []
        selectedRegulatoryLayers
          .map(selectedRegulatoryZoneId => {
            let nextRegulatoryZone = state.regulatoryLayers.find(zone => zone.id === selectedRegulatoryZoneId)
            if (nextRegulatoryZone && nextRegulatoryZone.lawType && nextRegulatoryZone.topic) {
              if (Object.keys(nextSelectedRegulatoryLayers).includes(nextRegulatoryZone.topic)) {
                const nextRegZoneTopic = nextSelectedRegulatoryLayers[nextRegulatoryZone.topic]
                nextRegZoneTopic.push(nextRegulatoryZone)
                nextSelectedRegulatoryLayers[nextRegulatoryZone.topic] = nextRegZoneTopic
              } else {
                nextSelectedRegulatoryLayers[nextRegulatoryZone.topic] = [nextRegulatoryZone]
              }
              nextSelectedRegulatoryLayerIds.push(nextRegulatoryZone.id)
              return null
            } else if (nextRegulatoryZone && nextRegulatoryZone.nextId) {
              nextRegulatoryZone = state.regulatoryLayers.find(zone => zone.id === nextRegulatoryZone.nextId)
              if (nextRegulatoryZone && nextRegulatoryZone.lawType && nextRegulatoryZone.topic) {
                if (Object.keys(nextSelectedRegulatoryLayers).includes(nextRegulatoryZone.topic)) {
                  const nextRegZoneTopic = nextSelectedRegulatoryLayers[nextRegulatoryZone.topic]
                  nextRegZoneTopic.push(nextRegulatoryZone)
                  nextSelectedRegulatoryLayers[nextRegulatoryZone.topic] = nextRegZoneTopic
                } else {
                  nextSelectedRegulatoryLayers[nextRegulatoryZone.topic] = [nextRegulatoryZone]
                }
                nextSelectedRegulatoryLayerIds.push(nextRegulatoryZone.id)
                return null
              }
            }
            return null
          })
        console.log('nextSelectedRegulatoryLayers')
        console.log(nextSelectedRegulatoryLayers)
        window.localStorage.setItem(SELECTED_REG_ZONES_IDS_LOCAL_STORAGE_KEY, JSON.stringify(nextSelectedRegulatoryLayerIds))
        state.selectedRegulatoryLayers = nextSelectedRegulatoryLayers
      }
    },
    setRegulatoryTopics (state, action) {
      state.regulatoryTopics = action.payload
    },
    setLayersTopicsByRegTerritory (state, action) {
      state.layersTopicsByRegTerritory = action.payload
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
  setRegulationSearchedZoneExtent,
  setSelectedRegulatoryZone
} = regulatorySlice.actions

export default regulatorySlice.reducer
