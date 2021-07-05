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
    lawTypeOpened: null
  },
  reducers: {
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
  setLawTypeOpened
} = regulatorySlice.actions

export default regulatorySlice.reducer
