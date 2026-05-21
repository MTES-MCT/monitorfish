import { BaseLayer, CoordinatesFormat } from '@features/Map/constants'
import { VesselLabel } from '@features/Vessel/label.types'
import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { VesselTrackDepth } from '../Vessel/types/vesselTrackDepth'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Coordinate } from 'ol/coordinate'

const vesselLabelsShowedOnMapLocalStorageKey = 'vesselLabelsShowedOnMap'
export const vesselTrackDepthLocalStorageKey = 'vesselTrackDepth'
const vesselLabelLocalStorageKey = 'vesselLabel'
const savedMapViewLocalStorageKey = 'mapView'
const savedMapExtentLocalStorageKey = 'mapExtent'
const baseLayerLocalStorageKey = 'baseLayer'
const estimatedPositionsLocalStorageKey = 'estimatedPositions'
const riskFactorLocalStorageKey = 'riskFactor'
const coordinatesFormatLocalStorageKey = 'coordinatesFormat'

export type MapState = {
  animateToCoordinates: boolean
  animateToExtent: boolean
  animateToRegulatoryLayer:
    | {
        center: Coordinate
        name: string | MonitorFishMap.ShowableLayer
      }
    | undefined
  coordinatesFormat: CoordinatesFormat
  defaultVesselTrackDepth: SelectableVesselTrackDepth
  extent: null
  riskFactorShowedOnMap: boolean
  selectedBaseLayer: string
  showingVesselsEstimatedPositions: boolean
  vesselLabel: VesselLabel
  vesselLabelsShowedOnMap: boolean
  view: {
    center: null
    zoom: null
  }
}
const INITIAL_STATE: MapState = {
  animateToCoordinates: false,
  animateToExtent: false,
  animateToRegulatoryLayer: undefined,
  coordinatesFormat: getLocalStorageState(CoordinatesFormat.DEGREES_MINUTES_SECONDS, coordinatesFormatLocalStorageKey),
  defaultVesselTrackDepth: getLocalStorageState(VesselTrackDepth.TWELVE_HOURS, vesselTrackDepthLocalStorageKey),
  extent: getLocalStorageState(null, savedMapExtentLocalStorageKey),
  riskFactorShowedOnMap: getLocalStorageState(true, riskFactorLocalStorageKey),
  selectedBaseLayer: getLocalStorageState(BaseLayer.LIGHT.code, baseLayerLocalStorageKey),
  showingVesselsEstimatedPositions: getLocalStorageState(true, estimatedPositionsLocalStorageKey),
  vesselLabel: getLocalStorageState(VesselLabel.VESSEL_NAME, vesselLabelLocalStorageKey),
  vesselLabelsShowedOnMap: getLocalStorageState(false, vesselLabelsShowedOnMapLocalStorageKey),
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
    animateToCoordinates(state) {
      state.animateToCoordinates = true
    },

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

    displayVesselsEstimatedPositions(state, action) {
      window.localStorage.setItem(estimatedPositionsLocalStorageKey, JSON.stringify(action.payload))
      state.showingVesselsEstimatedPositions = action.payload
    },

    resetAnimateToCoordinates(state) {
      state.animateToCoordinates = false
    },

    resetAnimateToExtent(state) {
      state.animateToExtent = false
    },

    resetAnimateToRegulatoryLayer(state) {
      state.animateToRegulatoryLayer = undefined
    },

    selectBaseLayer(state, action) {
      window.localStorage.setItem(baseLayerLocalStorageKey, JSON.stringify(action.payload))
      state.selectedBaseLayer = action.payload
    },

    /**
     * Set the coordinate format in the whole application (as DMS, DMD or DD)
     */
    setCoordinatesFormat(state, action: PayloadAction<CoordinatesFormat>) {
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
    }
  }
})

export const mapActions = mapSlice.actions
export const mapReducer = mapSlice.reducer

export const {
  animateToCoordinates,
  animateToExtent,
  animateToRegulatoryLayer,
  resetAnimateToCoordinates,
  resetAnimateToExtent,
  resetAnimateToRegulatoryLayer,
  selectBaseLayer,
  setCoordinatesFormat,
  setDefaultVesselTrackDepth,
  setRiskFactorShowedOnMap,
  setVesselLabel,
  setVesselLabelsShowedOnMap
} = mapActions
