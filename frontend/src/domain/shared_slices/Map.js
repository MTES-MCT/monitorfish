import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { baseLayers } from '../entities/layers'
import { CoordinatesFormat } from '../entities/map'
import { vesselLabel } from '../entities/vesselLabelLine'
import { VesselTrackDepth } from '../entities/vesselTrackDepth'

const vesselLabelsShowedOnMapLocalStorageKey = 'vesselLabelsShowedOnMap'
const vesselsLastPositionVisibilityLocalStorageKey = 'vesselsLastPositionVisibility'
export const vesselTrackDepthLocalStorageKey = 'vesselTrackDepth'
const vesselLabelLocalStorageKey = 'vesselLabel'
const savedMapViewLocalStorageKey = 'mapView'
const savedMapExtentLocalStorageKey = 'mapExtent'
const baseLayerLocalStorageKey = 'baseLayer'
const estimatedPositionsLocalStorageKey = 'estimatedPositions'
const riskFactorLocalStorageKey = 'riskFactor'
const coordinatesFormatLocalStorageKey = 'coordinatesFormat'
const hideVesselsAtPortLocalStorageKey = 'hideVesselsAtPort'

const mapSlice = createSlice({
  initialState: {
    // End of vessels map properties
    animateToCoordinates: null,
    animateToExtent: null,
    animateToRegulatoryLayer: null,
    coordinatesFormat: getLocalStorageState(
      CoordinatesFormat.DEGREES_MINUTES_SECONDS,
      coordinatesFormatLocalStorageKey,
    ),
    defaultVesselTrackDepth: getLocalStorageState(VesselTrackDepth.TWELVE_HOURS, vesselTrackDepthLocalStorageKey),
    doNotAnimate: false,
    extent: getLocalStorageState(null, savedMapExtentLocalStorageKey),
    hideVesselsAtPort: getLocalStorageState(true, hideVesselsAtPortLocalStorageKey),
    interaction: null,
    riskFactorShowedOnMap: getLocalStorageState(true, riskFactorLocalStorageKey),
    selectedBaseLayer: getLocalStorageState(baseLayers.LIGHT.code, baseLayerLocalStorageKey),
    showingVesselsEstimatedPositions: getLocalStorageState(true, estimatedPositionsLocalStorageKey),
    vesselLabel: getLocalStorageState(vesselLabel.VESSEL_NAME, vesselLabelLocalStorageKey),
    vesselLabelsShowedOnMap: getLocalStorageState(false, vesselLabelsShowedOnMapLocalStorageKey),
    // Vessels map properties
    vesselsLastPositionVisibility: getLocalStorageState(
      {
        hidden: 48,
        opacityReduced: 6,
      },
      vesselsLastPositionVisibilityLocalStorageKey,
    ),
    view: getLocalStorageState(
      {
        center: null,
        zoom: null,
      },
      savedMapViewLocalStorageKey,
    ),
  },
  name: 'map',
  reducers: {
    /**
     * Animate map to the specified OpenLayers coordinates
     * @param {Object} state
     * @param {{
     *   payload: String[]
     * }} action - The OpenLayers internal [longitude, latitude] coordinates
     */
    animateToCoordinates(state, action) {
      state.animateToCoordinates = action.payload
    },

    /**
     * Animate map to the vessel track extent stored in the Vessel reduced
     * @param {Object=} state
     */
    animateToExtent(state) {
      state.animateToExtent = true
    },

    animateToRegulatoryLayer(state, action) {
      state.animateToRegulatoryLayer = action.payload
    },

    doNotAnimate(state, action) {
      state.doNotAnimate = action.payload
    },
    resetAnimateToCoordinates(state) {
      state.animateToCoordinates = null
    },
    resetAnimateToExtent(state) {
      state.animateToExtent = null
    },
    resetAnimateToRegulatoryLayer(state) {
      state.animateToRegulatoryLayer = null
    },
    /**
     * Reset the interaction with the OpenLayers map
     * @param {Object=} state
     */
    resetInteraction(state) {
      state.interaction = null
    },

    selectBaseLayer(state, action) {
      window.localStorage.setItem(baseLayerLocalStorageKey, JSON.stringify(action.payload))
      state.selectedBaseLayer = action.payload
    },

    /**
     * Set the coordinate format in the whole application (as DMS, DMD or DD)
     * @param {Object} state
     * @param {{
     * payload: CoordinatesFormat}} action - The coordinate format
     */
    setCoordinatesFormat(state, action) {
      window.localStorage.setItem(coordinatesFormatLocalStorageKey, JSON.stringify(action.payload))
      state.coordinatesFormat = action.payload
    },

    setDefaultVesselTrackDepth(state, action) {
      window.localStorage.setItem(vesselTrackDepthLocalStorageKey, JSON.stringify(action.payload))
      state.defaultVesselTrackDepth = action.payload
    },

    /**
     * Show or hide the vessels located in a port
     * @param {Object} state
     * @param {{
     * payload: boolean}} action - true if the vessels at port are hidden
     */
    setHideVesselsAtPort(state, action) {
      window.localStorage.setItem(hideVesselsAtPortLocalStorageKey, JSON.stringify(action.payload))
      state.hideVesselsAtPort = action.payload
    },

    setRiskFactorShowedOnMap(state, action) {
      window.localStorage.setItem(riskFactorLocalStorageKey, JSON.stringify(action.payload))
      state.riskFactorShowedOnMap = action.payload
    },

    /**
     * Start an interaction with the OpenLayers map, hence use the mouse to draw geometries
     * @param {Object} state
     * @param {{
     *   payload: {
     *     type: string
     *     listener: (layersType.REGULATORY|layersType.VESSEL)
     *   }
     * }} action - The interaction type (see InteractionTypes enum) and listener (see layersType enum)
     */
setInteraction(state, action) {
      state.interaction = action.payload
    },

    
    setVesselLabelsShowedOnMap(state, action) {
      window.localStorage.setItem(vesselLabelsShowedOnMapLocalStorageKey, JSON.stringify(action.payload))
      state.vesselLabelsShowedOnMap = action.payload
    },

    setVesselLabel(state, action) {
      window.localStorage.setItem(vesselLabelLocalStorageKey, JSON.stringify(action.payload))
      state.vesselLabel = action.payload
    },

    setVesselsLastPositionVisibility(state, action) {
      window.localStorage.setItem(vesselsLastPositionVisibilityLocalStorageKey, JSON.stringify(action.payload))
      state.vesselsLastPositionVisibility = action.payload
    },

    /**
     * Show or hide the vessels current estimated positions
     * @param {Object} state
     * @param {{
     * payload: boolean}} action
     */
    showVesselsEstimatedPositions(state, action) {
      window.localStorage.setItem(estimatedPositionsLocalStorageKey, JSON.stringify(action.payload))
      state.showingVesselsEstimatedPositions = action.payload
    },
  },
})

export const {
  animateToCoordinates,
  animateToExtent,
  animateToRegulatoryLayer,
  doNotAnimate,
  resetAnimateToCoordinates,
  resetAnimateToExtent,
  resetAnimateToRegulatoryLayer,
  resetInteraction,
  selectBaseLayer,
  setCoordinatesFormat,
  setDefaultVesselTrackDepth,
  setHideVesselsAtPort,
  setInteraction,
  setRiskFactorShowedOnMap,
  setVesselLabel,
  setVesselLabelsShowedOnMap,
  setVesselsLastPositionVisibility,
  showVesselsEstimatedPositions,
} = mapSlice.actions

export default mapSlice.reducer
