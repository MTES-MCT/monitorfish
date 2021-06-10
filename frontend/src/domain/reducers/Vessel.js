import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
  name: 'vessel',
  initialState: {
    temporaryVesselsToHighLightOnMap: [],
    selectedVesselFeatureAndIdentity: null,
    vessels: [],
    vesselsLayerSource: null,
    selectedVessel: null,
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
      state.selectedVesselFeatureAndIdentity = action.payload.vesselFeatureAndIdentity
      state.vesselSidebarIsOpen = true
      if (!action.payload.calledFromCron) {
        state.selectedVessel = null
        state.loadingVessel = true
      }
    },
    setSelectedVessel (state, action) {
      state.loadingVessel = null
      state.selectedVessel = action.payload
    },
    resetSelectedVessel (state) {
      state.selectedVessel = null
      state.selectedVesselFeatureAndIdentity = null
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
    updateSelectedVesselFeature (state, action) {
      const nextState = { ...state.selectedVesselFeatureAndIdentity }
      state.selectedVesselFeatureAndIdentity = { identity: nextState.identity, feature: action.payload }
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
  closeVesselSidebar,
  updateSelectedVesselFeature,
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
  resetTemporaryTrackDepth
} = vesselSlice.actions

export default vesselSlice.reducer
