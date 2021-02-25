import { createSlice } from '@reduxjs/toolkit'
import {getLocalStorageState} from "../../utils";
import {VesselTrackDepth} from "../entities/vesselTrackDepth";

const vesselNamesShowedOnMapLocalStorageKey = 'vesselNamesShowedOnMap'
const vesselsLastPositionVisibilityLocalStorageKey = 'vesselsLastPositionVisibility'
const vesselTrackDepthLocalStorageKey = 'vesselTrackDepth'
const savedMapViewLocalStorageKey = 'mapView'

const mapSlice = createSlice({
    name: 'map',
    initialState: {
        vesselsLastPositionVisibility: getLocalStorageState({
            opacityReduced: 6,
            hidden: 48
        }, vesselsLastPositionVisibilityLocalStorageKey),
        vesselTrackDepth: getLocalStorageState(VesselTrackDepth.TWELVE_HOURS, vesselTrackDepthLocalStorageKey),
        animateToVessel: null,
        vesselNamesShowedOnMap: getLocalStorageState(false, vesselNamesShowedOnMapLocalStorageKey),
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
        resetAnimateToVessel(state) {
            state.animateToVessel = null
        },
        setVesselNamesShowedOnMap(state, action) {
            window.localStorage.setItem(vesselNamesShowedOnMapLocalStorageKey, JSON.stringify(action.payload))
            state.vesselNamesShowedOnMap = action.payload
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
    }
})

export const {
    animateToVessel,
    setVesselNamesShowedOnMap,
    hideVesselNames,
    isMoving,
    resetAnimateToVessel,
    setView,
    setVesselsLastPositionVisibility,
    setVesselTrackDepth
} = mapSlice.actions

export default mapSlice.reducer
