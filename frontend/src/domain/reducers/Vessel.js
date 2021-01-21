import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
    name: 'vessel',
    initialState: {
        selectedVesselTrackVector: null,
        selectedVesselFeatureAndIdentity: null,
        selectedVessel: null,
        removeSelectedIconToFeature: false,
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
            state.selectedVesselFeatureAndIdentity = action.payload
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
            state.selectedVesselFeatureAndIdentity = null
        },
        openVesselSidebar(state, action) {
            state.vesselSidebarTabIndexToShow = action.payload ? action.payload : 1
            state.vesselSidebarIsOpen = true
        },
        closeVesselBox(state) {
            state.vesselSidebarIsOpen = false
            state.selectedVesselTrackVector = null
            state.selectedVessel = null
            state.selectedVesselFeatureAndIdentity = null
        },
        updateVesselFeatureAndIdentity(state, action) {
            state.selectedVesselFeatureAndIdentity = action.payload
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
    updateVesselFeatureAndIdentity,
    setSearchVesselWhileVesselSelected,
} = vesselSlice.actions

export default vesselSlice.reducer
