import {createSlice} from '@reduxjs/toolkit'
import {getLocalStorageState} from "../../utils";
import {VesselTrackDepth} from "../entities/vesselTrackDepth";
import {vesselLabel} from "../entities/vesselLabel";

const vesselLabelsShowedOnMapLocalStorageKey = 'vesselLabelsShowedOnMap'
const vesselsLastPositionVisibilityLocalStorageKey = 'vesselsLastPositionVisibility'
const vesselTrackDepthLocalStorageKey = 'vesselTrackDepth'
const vesselLabelLocalStorageKey = 'vesselLabel'
const savedMapViewLocalStorageKey = 'mapView'

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
        view: getLocalStorageState({
            zoom: null,
            center: null,
        }, savedMapViewLocalStorageKey)
    },
    reducers: {
        animateToVessel(state, action) {
            state.animateToVessel = action.payload
        },
        animateToRegulatoryLayer(state, action) {
            state.animateToRegulatoryLayer = action.payload
        },
        resetAnimateToRegulatoryLayer(state) {
            state.animateToRegulatoryLayer = null
        },
        resetAnimateToVessel(state) {
            state.animateToVessel = null
        },
        setVesselLabelsShowedOnMap(state, action) {
            window.localStorage.setItem(vesselLabelsShowedOnMapLocalStorageKey, JSON.stringify(action.payload))
            state.vesselLabelsShowedOnMap = action.payload
        },
        setView(state, action) {
            window.localStorage.setItem(savedMapViewLocalStorageKey, JSON.stringify(action.payload))
            state.view = action.payload
        },
        hideVesselNames(state, action) {
            state.vesselNamesHiddenByZoom = action.payload
        },
        isMoving(state) {
            state.isMoving = !state.isMoving
        },
        setVesselsLastPositionVisibility(state, action) {
            window.localStorage.setItem(vesselsLastPositionVisibilityLocalStorageKey, JSON.stringify(action.payload))
            state.vesselsLastPositionVisibility = action.payload
        },
        setVesselTrackDepth(state, action) {
            window.localStorage.setItem(vesselTrackDepthLocalStorageKey, JSON.stringify(action.payload))
            state.vesselTrackDepth = action.payload
        },
        setVesselLabel(state, action) {
            window.localStorage.setItem(vesselLabelLocalStorageKey, JSON.stringify(action.payload))
            state.vesselLabel = action.payload
        },
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
    setVesselLabel
} = mapSlice.actions

export default mapSlice.reducer
