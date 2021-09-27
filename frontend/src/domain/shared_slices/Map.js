import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'
import { VesselTrackDepth } from '../entities/vesselTrackDepth'
import { vesselLabel } from '../entities/vesselLabelLine'
import { baseLayers } from '../entities/layers'
import { CoordinatesFormat } from '../entities/map'

const vesselLabelsShowedOnMapLocalStorageKey = 'vesselLabelsShowedOnMap'
const vesselsLastPositionVisibilityLocalStorageKey = 'vesselsLastPositionVisibility'
const vesselTrackDepthLocalStorageKey = 'vesselTrackDepth'
const vesselLabelLocalStorageKey = 'vesselLabel'
const savedMapViewLocalStorageKey = 'mapView'
const savedMapExtentLocalStorageKey = 'mapExtent'
const baseLayerLocalStorageKey = 'baseLayer'
const measurementsLocalStorageKey = 'measurements'
const estimatedPositionsLocalStorageKey = 'estimatedPositions'
const riskFactorLocalStorageKey = 'riskFactor'
const coordinatesFormatLocalStorageKey = 'coordinatesFormat'

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    // Vessels map properties
    vesselsLastPositionVisibility: getLocalStorageState({
      opacityReduced: 6,
      hidden: 48
    }, vesselsLastPositionVisibilityLocalStorageKey),
    vesselTrackDepth: getLocalStorageState(VesselTrackDepth.TWELVE_HOURS, vesselTrackDepthLocalStorageKey),
    vesselLabel: getLocalStorageState(vesselLabel.VESSEL_NAME, vesselLabelLocalStorageKey),
    vesselLabelsShowedOnMap: getLocalStorageState(false, vesselLabelsShowedOnMapLocalStorageKey),
    riskFactorShowedOnMap: getLocalStorageState(true, riskFactorLocalStorageKey),
    showingVesselsEstimatedPositions: getLocalStorageState(true, estimatedPositionsLocalStorageKey),
    // End of vessels map properties
    animateTo: null,
    updatedFromCron: false,
    animateToRegulatoryLayer: null,
    interaction: null,
    measurementTypeToAdd: null,
    circleMeasurementToAdd: null,
    measurementsDrawed: getLocalStorageState([], measurementsLocalStorageKey),
    zonesSelected: [],
    selectedBaseLayer: getLocalStorageState(baseLayers.LIGHT.code, baseLayerLocalStorageKey),
    view: getLocalStorageState({
      zoom: null,
      center: null
    }, savedMapViewLocalStorageKey),
    extent: getLocalStorageState(null, savedMapExtentLocalStorageKey),
    coordinatesFormat: getLocalStorageState(CoordinatesFormat.DEGREES_MINUTES_SECONDS, coordinatesFormatLocalStorageKey)
  },
  reducers: {
    setUpdatedFromCron (state, action) {
      state.updatedFromCron = action.payload
    },
    /**
     * Animate map to the specified OpenLayers coordinates
     * @param {Object=} state
     * @param {{
     * payload: String[]
     * }} action - The OpenLayers internal [longitude, latitude] coordinates
     */
    animateTo (state, action) {
      state.animateTo = action.payload
    },
    resetAnimateTo (state) {
      state.animateTo = null
    },
    animateToRegulatoryLayer (state, action) {
      state.animateToRegulatoryLayer = action.payload
    },
    resetAnimateToRegulatoryLayer (state) {
      state.animateToRegulatoryLayer = null
    },
    setVesselLabelsShowedOnMap (state, action) {
      window.localStorage.setItem(vesselLabelsShowedOnMapLocalStorageKey, JSON.stringify(action.payload))
      state.vesselLabelsShowedOnMap = action.payload
    },
    setRiskFactorShowedOnMap (state, action) {
      window.localStorage.setItem(riskFactorLocalStorageKey, JSON.stringify(action.payload))
      state.riskFactorShowedOnMap = action.payload
    },
    setView (state, action) {
      window.localStorage.setItem(savedMapViewLocalStorageKey, JSON.stringify(action.payload))
      state.view = action.payload
    },
    setExtent (state, action) {
      window.localStorage.setItem(savedMapExtentLocalStorageKey, JSON.stringify(action.payload))
      state.extent = action.payload
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
    },
    /**
     * Set the coordinate format in the whole application (as DMS, DMD or DD)
     * @param {Object=} state
     * @param {{
     * payload: CoordinatesFormat}} action - The coordinate format
     */
    setCoordinatesFormat (state, action) {
      window.localStorage.setItem(coordinatesFormatLocalStorageKey, JSON.stringify(action.payload))
      state.coordinatesFormat = action.payload
    },
    /**
     * Show or hide the vessels current estimated positions
     * @param {Object=} state
     * @param {{
     * payload: boolean}} action
     */
    showVesselsEstimatedPositions (state, action) {
      window.localStorage.setItem(estimatedPositionsLocalStorageKey, JSON.stringify(action.payload))
      state.showingVesselsEstimatedPositions = action.payload
    }
  }
})

export const {
  animateTo,
  resetAnimateTo,
  animateToRegulatoryLayer,
  resetAnimateToRegulatoryLayer,
  setVesselLabelsShowedOnMap,
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
  resetZonesSelected,
  showVesselsEstimatedPositions,
  setUpdatedFromCron,
  setCoordinatesFormat,
  setRiskFactorShowedOnMap
} = mapSlice.actions

export default mapSlice.reducer
