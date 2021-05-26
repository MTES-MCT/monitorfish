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
const savedMapExtentLocalStorageKey = 'mapExtent'
const baseLayerLocalStorageKey = 'baseLayer'
const measurementsLocalStorageKey = 'measurements'

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
    vesselLabelsHiddenByZoom: undefined,
    isMoving: false,
    interaction: null,
    measurementTypeToAdd: null,
    circleMeasurementToAdd: null,
    measurementsDrawed: getLocalStorageState([], measurementsLocalStorageKey),
    zonesSelected: [],
    selectedBaseLayer: getLocalStorageState(baseLayers.OSM.code, baseLayerLocalStorageKey),
    view: getLocalStorageState({
      zoom: null,
      center: null
    }, savedMapViewLocalStorageKey),
    extent: getLocalStorageState(null, savedMapExtentLocalStorageKey)
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
    setExtent (state, action) {
      window.localStorage.setItem(savedMapExtentLocalStorageKey, JSON.stringify(action.payload))
      state.extent = action.payload
    },
    hideVesselLabels (state, action) {
      state.vesselLabelsHiddenByZoom = action.payload
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
    setMeasurementTypeToAdd (state, action) {
      state.measurementTypeToAdd = action.payload
    },
    resetMeasurementTypeToAdd (state) {
      state.measurementTypeToAdd = null
    },
    addMeasurementDrawed (state, action) {
      const nextMeasurementsDrawed = state.measurementsDrawed.concat(action.payload)

      window.localStorage.setItem(measurementsLocalStorageKey, JSON.stringify(nextMeasurementsDrawed))
      state.measurementsDrawed = nextMeasurementsDrawed
    },
    removeMeasurementDrawed (state, action) {
      const nextMeasurementsDrawed = state.measurementsDrawed.filter(measurement => {
        return measurement.feature.id !== action.payload
      })

      window.localStorage.setItem(measurementsLocalStorageKey, JSON.stringify(nextMeasurementsDrawed))
      state.measurementsDrawed = nextMeasurementsDrawed
    },
    setCircleMeasurementToAdd (state, action) {
      state.circleMeasurementToAdd = action.payload
    },
    resetCircleMeasurementToAdd (state) {
      state.circleMeasurementToAdd = null
    },
    /**
     * Add a selected zone to filter vessels on vessel list
     * @param {Object=} state
     * @param {{
     * payload: {
     *  name: string,
     *  code: string,
     *  feature: GeoJSON
     * }}} action - The zone to add
     */
    addZoneSelected (state, action) {
      if (!state.zonesSelected.find(zone => zone.code === action.payload.code)) {
        state.zonesSelected = state.zonesSelected.concat(action.payload)
      }
    },
    /**
     * Remove a selected zone
     * @param {Object=} state
     * @param {{
     * payload: string}} action - The name of the zone
     */
    removeZoneSelected (state, action) {
      state.zonesSelected = state.zonesSelected.filter(zoneSelected => {
        return zoneSelected.code !== action.payload
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
  hideVesselLabels,
  isMoving,
  setView,
  setExtent,
  setVesselsLastPositionVisibility,
  setVesselTrackDepth,
  setVesselLabel,
  selectBaseLayer,
  setInteraction,
  resetInteraction,
  setMeasurementTypeToAdd,
  resetMeasurementTypeToAdd,
  addMeasurementDrawed,
  removeMeasurementDrawed,
  setCircleMeasurementToAdd,
  resetCircleMeasurementToAdd,
  addZoneSelected,
  setZonesSelected,
  removeZoneSelected,
  resetZonesSelected
} = mapSlice.actions

export default mapSlice.reducer
