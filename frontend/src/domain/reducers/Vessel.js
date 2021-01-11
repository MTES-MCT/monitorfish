import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
    name: 'vessel',
    initialState: {
        selectedVesselTrackVector: null,
        selectedVesselFeature: null,
        removeSelectedIconToFeature: false,
        selectedVessel: null,
        loadingVessel: null,
        vesselSidebarIsOpen: false,
        vesselSidebarTabIndexToShow: 1,
        searchVesselWhileVesselSelected: false
    },
    reducers: {
        setSelectedVesselTrackVector(state, action) {
            state.selectedVesselTrackVector = action.payload
        },
        loadingVessel(state, action) {
            state.selectedVesselFeature = action.payload
            state.selectedVesselTrackVector = null
            state.selectedVessel = null
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
        openVesselSidebar(state, action) {
            state.vesselSidebarTabIndexToShow = action.payload ? action.payload : 1
            state.vesselSidebarIsOpen = true
        },
        closeVesselBox(state) {
            state.vesselSidebarIsOpen = false
            state.selectedVesselTrackVector = null
            state.selectedVessel = null
            state.selectedVesselFeature = null
        },
        updateVesselFeature(state, action) {
            state.selectedVesselFeature = action.payload
        },
        removeSelectedIconToFeature(state) {
            state.removeSelectedIconToFeature = true
        },
        setSearchVesselWhileVesselSelected(state, action) {
            state.searchVesselWhileVesselSelected = action.payload
        }
    }
})

export const {
    loadingVessel,
    setSelectedVesselTrackVector,
    setSelectedVessel,
    resetSelectedVessel,
    openVesselSidebar,
    closeVesselBox,
    updateVesselFeature,
    setSearchVesselWhileVesselSelected,
} = vesselSlice.actions

export default vesselSlice.reducer
