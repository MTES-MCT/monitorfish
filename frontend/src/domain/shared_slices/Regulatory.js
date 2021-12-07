import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'

const selectedRegulatoryZonesLocalStorageKey = 'selectedRegulatoryZones'

/* eslint-disable */
/** @namespace RegulatoryReducer */
const RegulatoryReducer = null
/* eslint-enable */

export const reOrderOldObjectHierarchyIfFound = layers => {
  Object.keys(layers)
    .forEach(layer => {
      layers[layer] = layers[layer].map(zone => {
        if (zone && zone.layerName) {
          return {
            topic: zone.layerName,
            ...zone
          }
        }

        return zone
      })
    })

  return layers
}

const regulatorySlice = createSlice({
  name: 'regulatory',
  initialState: {
    isReadyToShowRegulatoryLayers: false,
    /** @type {Object.<string, SelectedRegulatoryZone[]>} selectedRegulatoryLayers */
    selectedRegulatoryLayers: reOrderOldObjectHierarchyIfFound(getLocalStorageState({}, selectedRegulatoryZonesLocalStorageKey)),
    regulatoryZoneMetadata: null,
    /** @type RegulatoryLawTypes regulatoryLayers */
    regulatoryLayers: [],
    loadingRegulatoryZoneMetadata: false,
    regulatoryZoneMetadataPanelIsOpen: false,
    lawTypeOpened: null,
    regulatoryTopicsOpened: [],
    regulatoryZoneToEdit: null,
    regulatoryTopics: [],
    layersTopicsByRegTerritory: {},
    regulatoryGeometryToPreview: null,
    simplifiedGeometries: true,
    regulationSearchedZoneExtent: []
  },
  reducers: {
    setRegulatoryGeometryToPreview (state, action) {
      state.regulatoryGeometryToPreview = action.payload
    },
    /**
     * Add regulatory zones to "My Zones" regulatory selection
     * @memberOf RegulatoryReducer
     * @param {Object=} state
     * @param {SelectedRegulatoryZone[]} action - The regulatory zones
     */
    addRegulatoryZonesToMyLayers (state, action) {
      const myRegulatoryLayers = { ...state.selectedRegulatoryLayers }

      action.payload.forEach(regulatoryZone => {
        if (!myRegulatoryLayers[regulatoryZone.topic] || !myRegulatoryLayers[regulatoryZone.topic].length) {
          myRegulatoryLayers[regulatoryZone.topic] = [regulatoryZone]
        } else {
          if (!myRegulatoryLayers[regulatoryZone.topic].some(zone =>
            zone.topic === regulatoryZone.topic &&
            zone.zone === regulatoryZone.zone)) {
            myRegulatoryLayers[regulatoryZone.topic] = myRegulatoryLayers[regulatoryZone.topic].concat(regulatoryZone)
          }
        }
      })

      state.selectedRegulatoryLayers = myRegulatoryLayers
      window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryLayers))
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
      if (action.payload.zone && action.payload.topic) {
        state.selectedRegulatoryLayers[action.payload.topic] = state.selectedRegulatoryLayers[action.payload.topic].filter(subZone => {
          return !(subZone.topic === action.payload.topic && subZone.zone === action.payload.zone)
        })
      } else if (action.payload.topic) {
        state.selectedRegulatoryLayers[action.payload.topic] = state.selectedRegulatoryLayers[action.payload.topic].filter(subZone => {
          return !(subZone.topic === action.payload.topic)
        })
      }

      if (!state.selectedRegulatoryLayers[action.payload.topic].length) {
        delete state.selectedRegulatoryLayers[action.payload.topic]
      }

      window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryLayers))
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
      state.regulatoryTopicsOpened.filter(e => e !== action.payload)
    },
    setRegulatoryZoneToEdit (state, action) {
      state.regulatoryZoneToEdit = action.payload
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
     *       bycatch: undefined,
     *       closingDate: undefined,
     *       deposit: undefined,
     *       gears: "DRB",
     *       lawType: "Reg locale",
     *       mandatoryDocuments: undefined,
     *       obligations: undefined,
     *       openingDate: undefined,
     *       period: undefined,
     *       permissions: undefined,
     *       prohibitedGears: null,
     *       prohibitedSpecies: null,
     *       prohibitions: undefined,
     *       quantity: undefined,
     *       region: "Bretagne",
     *       regulatoryReferences: "[
     *         {\"url\": \"http://legipeche.metier.i2/arrete-prefectoral-r53-2020-04-24-002-delib-2020-a9873.html?id_rub=1637\",
     *         \"reference\": \"ArrÃªtÃ© PrÃ©fectoral R53-2020-04-24-002 - dÃ©lib 2020-004 / NAMO\"}, {\"url\": \"\", \"reference\": \"126-2020\"}]",
     *       rejections: undefined,
     *       size: undefined,
     *       species: "SCE",
     *       state: undefined,
     *       technicalMeasurements: undefined,
     *       topic: "Armor_CSJ_Dragues",
     *       zone: "Secteur 3"
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
    setRegulatoryLayers (state, action) {
      state.regulatoryLayers = action.payload
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
     * @function setRegulationSearchedZoneExtent
     * @memberOf RegulatoryReducer
     * @param {Object=} state
     * @param {{payload: number[]}} action - the extent
     */
    setRegulationSearchedZoneExtent (state, action) {
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
  setRegulatoryLayers,
  setLawTypeOpened,
  addRegulatoryTopicOpened,
  removeRegulatoryTopicOpened,
  setRegulatoryTopicsOpened,
  setRegulatoryZoneToEdit,
  setRegulatoryTopics,
  setLayersTopicsByRegTerritory,
  setRegulatoryGeometryToPreview,
  showSimplifiedGeometries,
  showWholeGeometries,
  setRegulationSearchedZoneExtent
} = regulatorySlice.actions

export default regulatorySlice.reducer
