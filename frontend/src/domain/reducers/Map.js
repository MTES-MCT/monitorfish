import { createSlice } from '@reduxjs/toolkit'
import {getLocalStorageState} from "../../utils";

const vesselNamesShowedOnMapLocalStorageKey = 'vesselNamesShowedOnMap'
const savedMapViewLocalStorageKey = 'mapView'

const mapSlice = createSlice({
    name: 'map',
    initialState: {
        animateToVessel: null,
        vesselNamesShowedOnMap: getLocalStorageState(false, vesselNamesShowedOnMapLocalStorageKey),
        vesselNamesHiddenByZoom: undefined,
        isMoving: false,
        usingSearch: false,
        view: getLocalStorageState({
            zoom: null,
            center: null,
        }, savedMapViewLocalStorageKey)
    },
    reducers: {
        animateToVessel(state, action) {
            state.animateToVessel = action.payload
        },
        setUsingSearch(state) {
            state.usingSearch = true
        },
        resetAnimateToVessel(state) {
            state.animateToVessel = null
            state.usingSearch = false
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
        }
    }
})

export const {
    animateToVessel,
    setVesselNamesShowedOnMap,
    hideVesselNames,
    isMoving,
    resetAnimateToVessel,
    setUsingSearch,
    setView
} = mapSlice.actions

export default mapSlice.reducer
