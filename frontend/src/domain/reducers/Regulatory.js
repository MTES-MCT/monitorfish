import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'

const selectedRegulatoryZonesLocalStorageKey = 'selectedRegulatoryZones'

const regulatorySlice = createSlice({
  name: 'regulatory',
  initialState: {
    isReadyToShowRegulatoryLayers: false,
    selectedRegulatoryLayers: getLocalStorageState({}, selectedRegulatoryZonesLocalStorageKey),
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
    addRegulatoryLayersToSelection (state, action) {
      state.selectedRegulatoryLayers = action.payload
      window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryZones))
    },
    removeRegulatoryZonesFromSelection (state, action) {
      if (action.payload.zone) {
        state.selectedRegulatoryLayers[action.payload.layerName] = state.selectedRegulatoryLayers[action.payload.layerName].filter(subZone => {
          return !(subZone.layerName === action.payload.layerName && subZone.zone === action.payload.zone)
        })
      } else {
        state.selectedRegulatoryLayers[action.payload.layerName] = state.selectedRegulatoryLayers[action.payload.layerName].filter(subZone => {
          return !(subZone.layerName === action.payload.layerName)
        })
      }

      if (!state.selectedRegulatoryLayers[action.payload.layerName].length) {
        delete state.selectedRegulatoryLayers[action.payload.layerName]
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
