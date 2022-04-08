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
const estimatedPositionsLocalStorageKey = 'estimatedPositions'
const riskFactorLocalStorageKey = 'riskFactor'
const coordinatesFormatLocalStorageKey = 'coordinatesFormat'
const hideVesselsAtPortLocalStorageKey = 'hideVesselsAtPort'

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    // Vessels map properties
    vesselsLastPositionVisibility: getLocalStorageState({
      opacityReduced: 6,
      hidden: 48
    }, vesselsLastPositionVisibilityLocalStorageKey),
    hideVesselsAtPort: getLocalStorageState(true, hideVesselsAtPortLocalStorageKey),
    defaultVesselTrackDepth: getLocalStorageState(VesselTrackDepth.TWELVE_HOURS, vesselTrackDepthLocalStorageKey),
    vesselLabel: getLocalStorageState(vesselLabel.VESSEL_NAME, vesselLabelLocalStorageKey),
    vesselLabelsShowedOnMap: getLocalStorageState(false, vesselLabelsShowedOnMapLocalStorageKey),
    riskFactorShowedOnMap: getLocalStorageState(true, riskFactorLocalStorageKey),
    showingVesselsEstimatedPositions: getLocalStorageState(true, estimatedPositionsLocalStorageKey),
    // End of vessels map properties
    animateToCoordinates: null,
    animateToExtent: null,
    doNotAnimate: false,
    animateToRegulatoryLayer: null,
    interaction: null,
    selectedBaseLayer: getLocalStorageState(baseLayers.LIGHT.code, baseLayerLocalStorageKey),
    view: getLocalStorageState({
      zoom: null,
      center: null
    }, savedMapViewLocalStorageKey),
    extent: getLocalStorageState(null, savedMapExtentLocalStorageKey),
    coordinatesFormat: getLocalStorageState(CoordinatesFormat.DEGREES_MINUTES_SECONDS, coordinatesFormatLocalStorageKey)
  },
  reducers: {
    doNotAnimate (state, action) {
      state.doNotAnimate = action.payload
    },
    /**
     * Animate map to the specified OpenLayers coordinates
     * @param {Object=} state
     * @param {{
     * payload: String[]
     * }} action - The OpenLayers internal [longitude, latitude] coordinates
     */
    animateToCoordinates (state, action) {
      state.animateToCoordinates = action.payload
    },
    resetAnimateToCoordinates (state) {
      state.animateToCoordinates = null
    },
    /**
     * Animate map to the vessel track extent stored in the Vessel reduced
     * @param {Object=} state
     */
    animateToExtent (state) {
      state.animateToExtent = true
    },
    resetAnimateToExtent (state) {
      state.animateToExtent = null
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
    setVesselsLastPositionVisibility (state, action) {
      window.localStorage.setItem(vesselsLastPositionVisibilityLocalStorageKey, JSON.stringify(action.payload))
      state.vesselsLastPositionVisibility = action.payload
    },
    setDefaultVesselTrackDepth (state, action) {
      window.localStorage.setItem(vesselTrackDepthLocalStorageKey, JSON.stringify(action.payload))
      state.defaultVesselTrackDepth = action.payload
    },
    setVesselLabel (state, action) {
      window.localStorage.setItem(vesselLabelLocalStorageKey, JSON.stringify(action.payload))
      state.vesselLabel = action.payload
    },
    selectBaseLayer (state, action) {
      window.localStorage.setItem(baseLayerLocalStorageKey, JSON.stringify(action.payload))
      state.selectedBaseLayer = action.payload
    },
    /**
     * Start an interaction with the OpenLayers map, hence use the mouse to draw geometries
     * @param {Object=} state
     * @param {{payload: {
     *   type: (InteractionTypes.SQUARE|InteractionTypes.POLYGON),
     *   listener: (layersType.REGULATORY|layersType.VESSEL)
     * }}} action - The interaction type (see InteractionTypes enum) and listener (see layersType enum)
     */
    setInteraction (state, action) {
      state.interaction = action.payload
    },
    /**
     * Reset the interaction with the OpenLayers map
     * @param {Object=} state
     */
    resetInteraction (state) {
      state.interaction = null
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
    },
    /**
     * Show or hide the vessels located in a port
     * @param {Object=} state
     * @param {{
     * payload: boolean}} action - true if the vessels at port are hidden
     */
    setHideVesselsAtPort (state, action) {
      window.localStorage.setItem(hideVesselsAtPortLocalStorageKey, JSON.stringify(action.payload))
      state.hideVesselsAtPort = action.payload
    }
  }
})

export const {
  animateToCoordinates,
  resetAnimateToCoordinates,
  animateToExtent,
  resetAnimateToExtent,
  animateToRegulatoryLayer,
  resetAnimateToRegulatoryLayer,
  setVesselLabelsShowedOnMap,
  setVesselsLastPositionVisibility,
  setDefaultVesselTrackDepth,
  setVesselLabel,
  selectBaseLayer,
  setInteraction,
  resetInteraction,
  showVesselsEstimatedPositions,
  doNotAnimate,
  setCoordinatesFormat,
  setRiskFactorShowedOnMap,
  setHideVesselsAtPort
} = mapSlice.actions

export default mapSlice.reducer
