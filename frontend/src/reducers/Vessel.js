import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
    name: 'vessel',
    initialState: {
        vesselTrackVector: null,
        selectedVesselFeature: null,
        vessel: null,
        loadingVessel: null,
        vesselSummaryIsOpen: false,
        vesselBoxIsOpen: false,
        vesselBoxTabIndexToShow: 1
    },
    reducers: {
        setVesselTrackVector(state, action) {
            state.vesselTrackVector = action.payload
        },
        resetVesselTrackVector(state) {
            state.vesselTrackVector = null
        },
        loadingVessel(state, action) {
            state.loadingVessel = action.payload
            state.selectedVesselFeature = action.payload
            state.vesselSummaryIsOpen = true
        },
        setVessel(state, action) {
            state.loadingVessel = null
            state.vessel = action.payload
        },
        resetVessel(state) {
            state.vessel = null
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
        closeVessel(state) {
            state.vesselSummaryIsOpen = false
            state.vesselBoxIsOpen = false
            state.vesselTrackVector = null
            state.vessel = null
            state.selectedVesselFeature = null
        }
    }
})

export const {
    loadingVessel,
    setVesselTrackVector,
    resetVesselTrackVector,
    setVessel,
    resetVessel,
    openVesselBox,
    closeVessel
} = vesselSlice.actions

export default vesselSlice.reducer
