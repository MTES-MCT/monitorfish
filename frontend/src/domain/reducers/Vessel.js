import { createSlice } from '@reduxjs/toolkit'
import {VESSEL_SELECTOR_STYLE} from "../../layers/styles/featuresStyles";

const vesselSlice = createSlice({
    name: 'vessel',
    initialState: {
        selectedVesselTrackVector: null,
        selectedVesselFeature: null,
        removeSelectedIconToFeature: false,
        selectedVessel: null,
        loadingVessel: null,
        vesselSummaryIsOpen: false,
        vesselBoxIsOpen: false,
        vesselBoxTabIndexToShow: 1
    },
    reducers: {
        setSelectedVesselTrackVector(state, action) {
            state.selectedVesselTrackVector = action.payload
        },
        loadingVessel(state, action) {
            state.selectedVesselFeature = action.payload
            state.selectedVesselTrackVector = null
            state.selectedVessel = null
            state.vesselSummaryIsOpen = true
            state.loadingVessel = true
        },
        setSelectedVessel(state, action) {
            state.loadingVessel = null
            state.selectedVessel = action.payload
        },
        resetSelectedVessel(state) {
            state.selectedVessel = null
            state.selectedVesselFeature = null
        },
        openVesselSummary(state) {
            state.vesselSummaryIsOpen = true
        },
        openVesselBox(state, action) {
            state.vesselBoxTabIndexToShow = action.payload ? action.payload : 1
            state.vesselBoxIsOpen = true
            state.vesselSummaryIsOpen = false
        },
        closeVesselSummary(state) {
            state.vesselSummaryIsOpen = false
        },
        closeVesselBox(state) {
            state.vesselBoxIsOpen = false
            state.selectedVesselTrackVector = null
            state.selectedVessel = null
            state.selectedVesselFeature = null
        },
        updateVesselFeature(state, action) {
            state.selectedVesselFeature = action.payload
        },
        removeSelectedIconToFeature(state) {
            state.removeSelectedIconToFeature = true
        }
    }
})

export const {
    loadingVessel,
    setSelectedVesselTrackVector,
    setSelectedVessel,
    resetSelectedVessel,
    openVesselBox,
    closeVesselSummary,
    openVesselSummary,
    closeVesselBox,
    updateVesselFeature,
    removeSelectedIconToFeature,
} = vesselSlice.actions

export default vesselSlice.reducer
