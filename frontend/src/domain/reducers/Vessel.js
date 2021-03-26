import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
    name: 'vessel',
    initialState: {
        temporaryVesselsToHighLightOnMap: [],
        selectedVesselFeatureAndIdentity: null,
        vessels: [],
        vesselsLayerSource: null,
        selectedVessel: null,
        removeSelectedIconToFeature: false,
        loadingVessel: null,
        vesselSidebarIsOpen: false,
        vesselSidebarTabIndexToShow: 1,
        isFocusedOnVesselSearch: false,
        fishingActivities: {},
        nextFishingActivities: null
    },
    reducers: {
        setVessels(state, action) {
            state.vessels = action.payload
        },
        setVesselsLayerSource(state, action) {
            state.vesselsLayerSource = action.payload
        },
        loadingVessel(state, action) {
            state.selectedVesselFeatureAndIdentity = action.payload
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
            state.selectedVessel = null
            state.selectedVesselFeatureAndIdentity = null
        },
        updateVesselFeatureAndIdentity(state, action) {
            state.selectedVesselFeatureAndIdentity = action.payload
        },
        removeSelectedIconToFeature(state) {
            state.removeSelectedIconToFeature = true
        },
        setFocusOnVesselSearch(state, action) {
            state.isFocusedOnVesselSearch = action.payload
        },
        loadingFisheriesActivities(state) {
            state.loadingVessel = true
        },
        resetLoadingVessel(state) {
            state.loadingVessel = false
        },
        setFishingActivities(state, action) {
            state.fishingActivities = action.payload
            state.loadingVessel = null
        },
        setNextFishingActivities(state, action) {
            state.nextFishingActivities = action.payload
        },
        resetNextFishingActivities(state) {
            state.nextFishingActivities = null
        },
        setTemporaryVesselsToHighLightOnMap(state, action) {
            state.temporaryVesselsToHighLightOnMap = action.payload
        },
        resetTemporaryVesselsToHighLightOnMap(state) {
            state.temporaryVesselsToHighLightOnMap = []
        }
    }
})

export const {
    setVessels,
    setVesselsLayerSource,
    loadingVessel,
    resetLoadingVessel,
    setSelectedVessel,
    resetSelectedVessel,
    openVesselSidebar,
    closeVesselBox,
    updateVesselFeatureAndIdentity,
    setFishingActivities,
    setNextFishingActivities,
    resetNextFishingActivities,
    loadingFisheriesActivities,
    setFocusOnVesselSearch,
    setTemporaryVesselsToHighLightOnMap,
    resetTemporaryVesselsToHighLightOnMap
} = vesselSlice.actions

export default vesselSlice.reducer
