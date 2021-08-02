import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'

const selectedRegulatoryZonesLocalStorageKey = 'selectedRegulatoryZones'

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
    loadingRegulatoryZoneMetadata: false,
    regulatoryZoneMetadataPanelIsOpen: false,
    lawTypeOpened: null,
    zoneThemeArray: [],
    regulationBlocArray: [],
    seaFrontArray: [],
    layersNamesByRegTerritory: {},
    regulatoryGeometryToPreview: null
  },
  reducers: {
    setRegulatoryGeometryToPreview (state, action) {
      state.regulatoryGeometryToPreview = action.payload
    },
    /**
     * Add regulatory layers to search selection
     * @param {Object=} state
     * @param {{payload: Object.<string, SelectedRegulatoryZone[]>}} action - The regulatory layers
     */
    addRegulatoryLayersToSelection (state, action) {
      state.selectedRegulatoryLayers = action.payload
      window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryZones))
    },
    /**
     * Remove a regulatory zone to search selection
     * @param {Object=} state
     * @param {{payload: Object.<string, SelectedRegulatoryZone>}} action - The regulatory zone to remove
     */
    removeRegulatoryZonesFromSelection (state, action) {
      if (action.payload.zone) {
        state.selectedRegulatoryLayers[action.payload.topic] = state.selectedRegulatoryLayers[action.payload.topic].filter(subZone => {
          return !(subZone.topic === action.payload.topic && subZone.zone === action.payload.zone)
        })
      } else {
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
    setZoneThemeArray (state, action) {
      state.zoneThemeArray = action.payload
    },
    setRegulationBlocArray (state, action) {
      state.regulationBlocArray = action.payload
    },
    setSeaFrontArray (state, action) {
      state.seaFrontArray = action.payload
    },
    setLayersNamesByRegTerrory (state, action) {
      state.layersNamesByRegTerritory = action.payload
    }
  }
})

export const {
  addRegulatoryLayersToSelection,
  removeRegulatoryZonesFromSelection,
  setIsReadyToShowRegulatoryZones,
  setLoadingRegulatoryZoneMetadata,
  resetLoadingRegulatoryZoneMetadata,
  setRegulatoryZoneMetadata,
  closeRegulatoryZoneMetadataPanel,
  setLawTypeOpened,
  setZoneThemeArray,
  setRegulationBlocArray,
  setSeaFrontArray,
  setLayersNamesByRegTerrory,
  setRegulatoryGeometryToPreview
} = regulatorySlice.actions

export default regulatorySlice.reducer
