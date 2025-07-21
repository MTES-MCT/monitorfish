import { BaseLayer, CoordinatesFormat } from '@features/Map/constants'
import { VesselLabel } from '@features/Vessel/label.types'
import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { VesselTrackDepth } from '../Vessel/types/vesselTrackDepth'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Coordinate } from 'ol/coordinate'
import type { Extent } from 'ol/extent'

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

export type MapState = {
  /** End of vessels map properties */
  animateToCoordinates: [number, number] | undefined
  animateToExtent: boolean
  animateToRegulatoryLayer:
    | {
        center: Coordinate
        name: string | MonitorFishMap.ShowableLayer
      }
    | undefined
  coordinatesFormat: CoordinatesFormat
  defaultVesselTrackDepth: SelectableVesselTrackDepth
  doNotAnimate: boolean
  extent: null
  fitToExtent: Extent | undefined
  riskFactorShowedOnMap: boolean
  selectedBaseLayer: string
  showingVesselsEstimatedPositions: boolean
  vesselLabel: VesselLabel
  vesselLabelsShowedOnMap: boolean
  /** Vessels map properties */
  vesselsLastPositionVisibility: MonitorFishMap.LastPositionVisibility
  view: {
    center: null
    zoom: null
  }
}
const INITIAL_STATE: MapState = {
  animateToCoordinates: undefined,
  animateToExtent: false,
  animateToRegulatoryLayer: undefined,
  coordinatesFormat: getLocalStorageState(CoordinatesFormat.DEGREES_MINUTES_SECONDS, coordinatesFormatLocalStorageKey),
  defaultVesselTrackDepth: getLocalStorageState(VesselTrackDepth.TWELVE_HOURS, vesselTrackDepthLocalStorageKey),
  doNotAnimate: false,
  extent: getLocalStorageState(null, savedMapExtentLocalStorageKey),
  fitToExtent: undefined,
  riskFactorShowedOnMap: getLocalStorageState(true, riskFactorLocalStorageKey),
  selectedBaseLayer: getLocalStorageState(BaseLayer.LIGHT.code, baseLayerLocalStorageKey),
  showingVesselsEstimatedPositions: getLocalStorageState(true, estimatedPositionsLocalStorageKey),
  vesselLabel: getLocalStorageState(VesselLabel.VESSEL_NAME, vesselLabelLocalStorageKey),
  vesselLabelsShowedOnMap: getLocalStorageState(false, vesselLabelsShowedOnMapLocalStorageKey),
  vesselsLastPositionVisibility: getLocalStorageState(
    {
      hidden: 48,
      opacityReduced: 6
    },
    vesselsLastPositionVisibilityLocalStorageKey
  ),
  view: getLocalStorageState(
    {
      center: null,
      zoom: null
    },
    savedMapViewLocalStorageKey
  )
}

// TODO This slice should be merged into a common "Map" feature.
const mapSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'map',
  reducers: {
    /**
     * Animate map to the specified OpenLayers coordinates
     * @param {Object} state
     * @param {{
     *   payload: import('ol/coordinate').Coordinate
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

    animateToRegulatoryLayer(
      state,
      action: PayloadAction<{
        center: Coordinate
        name: string | MonitorFishMap.ShowableLayer
      }>
    ) {
      state.animateToRegulatoryLayer = action.payload
    },

    /**
     * Show or hide the vessels current estimated positions
     * @param {Object} state
     * @param {{
     * payload: boolean}} action
     */
    displayVesselsEstimatedPositions(state, action) {
      window.localStorage.setItem(estimatedPositionsLocalStorageKey, JSON.stringify(action.payload))
      state.showingVesselsEstimatedPositions = action.payload
    },

    doNotAnimate(state, action) {
      state.doNotAnimate = action.payload
    },

    fitToExtent(state, action: PayloadAction<Extent>) {
      state.fitToExtent = action.payload
    },

    resetAnimateToCoordinates(state) {
      state.animateToCoordinates = undefined
    },

    resetAnimateToExtent(state) {
      state.animateToExtent = false
    },

    resetAnimateToRegulatoryLayer(state) {
      state.animateToRegulatoryLayer = undefined
    },

    resetFitToExtent(state) {
      state.fitToExtent = undefined
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

    setRiskFactorShowedOnMap(state, action) {
      window.localStorage.setItem(riskFactorLocalStorageKey, JSON.stringify(action.payload))
      state.riskFactorShowedOnMap = action.payload
    },

    setVesselLabel(state, action: PayloadAction<VesselLabel>) {
      window.localStorage.setItem(vesselLabelLocalStorageKey, JSON.stringify(action.payload))
      state.vesselLabel = action.payload
    },

    setVesselLabelsShowedOnMap(state, action) {
      window.localStorage.setItem(vesselLabelsShowedOnMapLocalStorageKey, JSON.stringify(action.payload))
      state.vesselLabelsShowedOnMap = action.payload
    },

    setVesselsLastPositionVisibility(state, action) {
      window.localStorage.setItem(vesselsLastPositionVisibilityLocalStorageKey, JSON.stringify(action.payload))
      state.vesselsLastPositionVisibility = action.payload
    }
  }
})

export const mapActions = mapSlice.actions
export const mapReducer = mapSlice.reducer

export const {
  animateToCoordinates,
  animateToExtent,
  animateToRegulatoryLayer,
  doNotAnimate,
  fitToExtent,
  resetAnimateToCoordinates,
  resetAnimateToExtent,
  resetAnimateToRegulatoryLayer,
  resetFitToExtent,
  selectBaseLayer,
  setCoordinatesFormat,
  setDefaultVesselTrackDepth,
  setRiskFactorShowedOnMap,
  setVesselLabel,
  setVesselLabelsShowedOnMap,
  setVesselsLastPositionVisibility
} = mapActions
