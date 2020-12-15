import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
    name: 'vessel',
    initialState: {
        selectedVesselTrackVector: null,
        selectedVesselFeature: null,
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
            if(!state.selectedVesselFeature) {
                state.selectedVesselFeature = action.payload
                state.selectedVesselTrackVector = null
                state.selectedVessel = null
                state.vesselSummaryIsOpen = true
                state.loadingVessel = true
            }
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
        closeVesselSummary(state, action) {
            state.vesselSummaryIsOpen = false

            let keepSelectedVessel = action.payload
            if(!keepSelectedVessel) {
                state.selectedVesselTrackVector = null
                state.selectedVessel = null
                state.selectedVesselFeature = null
            }
        },
        closeVesselBox(state, action) {
            state.vesselBoxIsOpen = false

            let keepSelectedVessel = action.payload
            if(!keepSelectedVessel) {
                state.selectedVesselTrackVector = null
                state.selectedVessel = null
                state.selectedVesselFeature = null
            }
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
    closeVesselBox
} = vesselSlice.actions

export default vesselSlice.reducer
