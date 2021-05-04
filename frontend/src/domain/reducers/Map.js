import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'
import { VesselTrackDepth } from '../entities/vesselTrackDepth'
import { vesselLabel } from '../entities/vesselLabel'
import { baseLayers } from '../entities/layers'

const vesselLabelsShowedOnMapLocalStorageKey = 'vesselLabelsShowedOnMap'
const vesselsLastPositionVisibilityLocalStorageKey = 'vesselsLastPositionVisibility'
const vesselTrackDepthLocalStorageKey = 'vesselTrackDepth'
const vesselLabelLocalStorageKey = 'vesselLabel'
const savedMapViewLocalStorageKey = 'mapView'
const baseLayerLocalStorageKey = 'baseLayer'

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    vesselsLastPositionVisibility: getLocalStorageState({
      opacityReduced: 6,
      hidden: 48
    }, vesselsLastPositionVisibilityLocalStorageKey),
    vesselTrackDepth: getLocalStorageState(VesselTrackDepth.TWELVE_HOURS, vesselTrackDepthLocalStorageKey),
    vesselLabel: getLocalStorageState(vesselLabel.VESSEL_NAME, vesselLabelLocalStorageKey),
    vesselLabelsShowedOnMap: getLocalStorageState(false, vesselLabelsShowedOnMapLocalStorageKey),
    animateToVessel: null,
    animateToRegulatoryLayer: null,
    vesselNamesHiddenByZoom: undefined,
    isMoving: false,
    interaction: null,
    measure: null,
    circleMeasureToAdd: null,
    zonesSelected: [],
    selectedBaseLayer: getLocalStorageState(baseLayers.OSM.code, baseLayerLocalStorageKey),
    view: getLocalStorageState({
      zoom: null,
      center: null
    }, savedMapViewLocalStorageKey)
  },
  reducers: {
    animateToVessel (state, action) {
      state.animateToVessel = action.payload
    },
    animateToRegulatoryLayer (state, action) {
      state.animateToRegulatoryLayer = action.payload
    },
    resetAnimateToRegulatoryLayer (state) {
      state.animateToRegulatoryLayer = null
    },
    resetAnimateToVessel (state) {
      state.animateToVessel = null
    },
    setVesselLabelsShowedOnMap (state, action) {
      window.localStorage.setItem(vesselLabelsShowedOnMapLocalStorageKey, JSON.stringify(action.payload))
      state.vesselLabelsShowedOnMap = action.payload
    },
    setView (state, action) {
      window.localStorage.setItem(savedMapViewLocalStorageKey, JSON.stringify(action.payload))
      state.view = action.payload
    },
    hideVesselNames (state, action) {
      state.vesselNamesHiddenByZoom = action.payload
    },
    isMoving (state) {
      state.isMoving = !state.isMoving
    },
    setVesselsLastPositionVisibility (state, action) {
      window.localStorage.setItem(vesselsLastPositionVisibilityLocalStorageKey, JSON.stringify(action.payload))
      state.vesselsLastPositionVisibility = action.payload
    },
    setVesselTrackDepth (state, action) {
      window.localStorage.setItem(vesselTrackDepthLocalStorageKey, JSON.stringify(action.payload))
      state.vesselTrackDepth = action.payload
    },
    setVesselLabel (state, action) {
      window.localStorage.setItem(vesselLabelLocalStorageKey, JSON.stringify(action.payload))
      state.vesselLabel = action.payload
    },
    selectBaseLayer (state, action) {
      window.localStorage.setItem(baseLayerLocalStorageKey, JSON.stringify(action.payload))
      state.selectedBaseLayer = action.payload
    },
    setInteraction (state, action) {
      state.interaction = action.payload
    },
    resetInteraction (state) {
      state.interaction = null
    },
    setMeasure (state, action) {
      state.measure = action.payload
    },
    resetMeasure (state) {
      state.measure = null
    },
    setCircleMeasureToAdd (state, action) {
      state.circleMeasureToAdd = action.payload
    },
    resetCircleMeasureToAdd (state) {
      state.circleMeasureToAdd = null
    },
    addZoneSelected (state, action) {
      state.zonesSelected = state.zonesSelected.concat(action.payload)
    },
    removeZoneSelected (state, action) {
      state.zonesSelected = state.zonesSelected.filter(zoneSelected => {
        return zoneSelected.name !== action.payload
      })
    },
    setZonesSelected (state, action) {
      state.zonesSelected = action.payload
    },
    resetZonesSelected (state) {
      state.zonesSelected = []
    }
  }
})

export const {
  animateToVessel,
  resetAnimateToVessel,
  animateToRegulatoryLayer,
  resetAnimateToRegulatoryLayer,
  setVesselLabelsShowedOnMap,
  hideVesselNames,
  isMoving,
  setView,
  setVesselsLastPositionVisibility,
  setVesselTrackDepth,
  setVesselLabel,
  selectBaseLayer,
  setInteraction,
  resetInteraction,
  setMeasure,
  resetMeasure,
  setCircleMeasureToAdd,
  resetCircleMeasureToAdd,
  addZoneSelected,
  setZonesSelected,
  removeZoneSelected,
  resetZonesSelected
} = mapSlice.actions

export default mapSlice.reducer
