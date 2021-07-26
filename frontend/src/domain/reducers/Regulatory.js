import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'

const selectedRegulatoryZonesLocalStorageKey = 'selectedRegulatoryZones'

const regulatorySlice = createSlice({
  name: 'regulatory',
  initialState: {
    isReadyToShowRegulatoryZones: false,
    selectedRegulatoryZones: getLocalStorageState({}, selectedRegulatoryZonesLocalStorageKey),
    regulatoryZoneMetadata: null,
    loadingRegulatoryZoneMetadata: false,
    regulatoryZoneMetadataPanelIsOpen: false,
    lawTypeOpened: null,
<<<<<<< HEAD
    zoneThemeArray: [],
    regulationBlocArray: [],
    seaFrontArray: [],
    layersNamesByRegTerritory: {}
=======
    regulatoryGeometryToPreview: null
>>>>>>> display regulatory preview when a geometry is selected
  },
  reducers: {
    setRegulatoryGeometryToPreview (state, action) {
      state.regulatoryGeometryToPreview = action.payload
    },
    addRegulatoryZonesToSelection (state, action) {
      state.selectedRegulatoryZones = action.payload
      window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryZones))
    },
    removeRegulatoryZonesFromSelection (state, action) {
      if (action.payload.zone) {
        state.selectedRegulatoryZones[action.payload.layerName] = state.selectedRegulatoryZones[action.payload.layerName].filter(subZone => {
          return !(subZone.layerName === action.payload.layerName && subZone.zone === action.payload.zone)
        })
      } else {
        state.selectedRegulatoryZones[action.payload.layerName] = state.selectedRegulatoryZones[action.payload.layerName].filter(subZone => {
          return !(subZone.layerName === action.payload.layerName)
        })
      }

      if (!state.selectedRegulatoryZones[action.payload.layerName].length) {
        delete state.selectedRegulatoryZones[action.payload.layerName]
      }

      window.localStorage.setItem(selectedRegulatoryZonesLocalStorageKey, JSON.stringify(state.selectedRegulatoryZones))
    },
    setIsReadyToShowRegulatoryZones (state) {
      state.isReadyToShowRegulatoryZones = true
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
  addRegulatoryZonesToSelection,
  removeRegulatoryZonesFromSelection,
  setIsReadyToShowRegulatoryZones,
  setLoadingRegulatoryZoneMetadata,
  resetLoadingRegulatoryZoneMetadata,
  setRegulatoryZoneMetadata,
  closeRegulatoryZoneMetadataPanel,
  setLawTypeOpened,
<<<<<<< HEAD
  setZoneThemeArray,
  setRegulationBlocArray,
  setSeaFrontArray,
  setLayersNamesByRegTerrory
=======
  setRegulatoryGeometryToPreview
>>>>>>> display regulatory preview when a geometry is selected
} = regulatorySlice.actions

export default regulatorySlice.reducer
