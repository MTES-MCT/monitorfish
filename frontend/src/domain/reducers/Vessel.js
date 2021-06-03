import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
  name: 'vessel',
  initialState: {
    temporaryVesselsToHighLightOnMap: [],
    selectedVesselWasHiddenByFilter: false,
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
    nextFishingActivities: null,
    controlResumeAndControls: {},
    nextControlResumeAndControls: null,
    temporaryTrackDepth: {
      trackDepth: null,
      afterDateTimeRange: null,
      beforeDateTimeRange: null
    }
  },
  reducers: {
    setVessels (state, action) {
      state.vessels = action.payload
    },
    setVesselsLayerSource (state, action) {
      state.vesselsLayerSource = action.payload
    },
    loadingVessel (state, action) {
      state.selectedVesselFeatureAndIdentity = action.payload
      state.selectedVessel = null
      state.loadingVessel = true
    },
    setSelectedVessel (state, action) {
      state.loadingVessel = null
      state.selectedVessel = action.payload
    },
    resetSelectedVessel (state) {
      state.selectedVessel = null
      state.selectedVesselFeatureAndIdentity = null
    },
    openVesselSidebar (state, action) {
      state.vesselSidebarTabIndexToShow = action.payload ? action.payload : 1
      state.vesselSidebarIsOpen = true
    },
    closeVesselSidebar (state) {
      state.vesselSidebarIsOpen = false
      state.selectedVessel = null
      state.selectedVesselFeatureAndIdentity = null
      state.temporaryTrackDepth = {
        trackDepth: null,
        afterDateTime: null,
        beforeDateTime: null
      }
    },
    updateVesselFeatureAndIdentity (state, action) {
      state.selectedVesselFeatureAndIdentity = action.payload
    },
    removeSelectedIconToFeature (state) {
      state.removeSelectedIconToFeature = true
    },
    setFocusOnVesselSearch (state, action) {
      state.isFocusedOnVesselSearch = action.payload
    },
    loadingFisheriesActivities (state) {
      state.loadingVessel = true
    },
    resetLoadingVessel (state) {
      state.loadingVessel = false
    },
    setFishingActivities (state, action) {
      state.fishingActivities = action.payload
      state.loadingVessel = null
    },
    resetFishingActivities (state) {
      state.fishingActivities = null
      state.loadingVessel = null
    },
    setNextFishingActivities (state, action) {
      state.nextFishingActivities = action.payload
    },
    resetNextFishingActivities (state) {
      state.nextFishingActivities = null
    },
    setControlResumeAndControls (state, action) {
      state.controlResumeAndControls = action.payload
      state.loadingVessel = null
    },
    loadingControls (state) {
      state.loadingVessel = true
    },
    setNextControlResumeAndControls (state, action) {
      state.nextControlResumeAndControls = action.payload
    },
    resetNextControlResumeAndControls (state) {
      state.nextControlResumeAndControls = null
    },
    setTemporaryVesselsToHighLightOnMap (state, action) {
      state.temporaryVesselsToHighLightOnMap = action.payload
    },
    resetTemporaryVesselsToHighLightOnMap (state) {
      state.temporaryVesselsToHighLightOnMap = []
    },
    setTemporaryTrackDepth (state, action) {
      state.temporaryTrackDepth = action.payload
    },
    resetTemporaryTrackDepth (state) {
      state.temporaryTrackDepth = {
        trackDepth: null,
        afterDateTime: null,
        beforeDateTime: null
      }
    },
    setSelectedVesselWasHiddenByFilter(state, action) {
      state.selectedVesselWasHiddenByFilter = action.payload
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
  closeVesselSidebar,
  updateVesselFeatureAndIdentity,
  setFishingActivities,
  resetFishingActivities,
  setNextFishingActivities,
  resetNextFishingActivities,
  setControlResumeAndControls,
  setNextControlResumeAndControls,
  resetNextControlResumeAndControls,
  loadingFisheriesActivities,
  loadingControls,
  setFocusOnVesselSearch,
  setTemporaryVesselsToHighLightOnMap,
  resetTemporaryVesselsToHighLightOnMap,
  setTemporaryTrackDepth,
  resetTemporaryTrackDepth,
  setSelectedVesselWasHiddenByFilter
} = vesselSlice.actions

export default vesselSlice.reducer
