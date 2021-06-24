import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
  name: 'vessel',
  initialState: {
    temporaryVesselsToHighLightOnMap: [],
    selectedVesselFeatureAndIdentity: null,
    vessels: [],
    vesselsLayerSource: null,
    /** @type {Vessel | null} selectedVessel */
    selectedVessel: null,
    /** @type {VesselPosition | null} highlightedVesselTrackPosition */
    highlightedVesselTrackPosition: null,
    loadingVessel: null,
    vesselSidebarIsOpen: false,
    vesselSidebarTabIndexToShow: 1,
    isFocusedOnVesselSearch: false,
    /** @type {FishingActivities} fishingActivities */
    fishingActivities: {},
    /** @type {FishingActivities} lastFishingActivities */
    lastFishingActivities: {},
    isLastVoyage: null,
    previousBeforeDateTime: null,
    nextBeforeDateTime: null,
    /** @type {FishingActivities | null} nextFishingActivities */
    nextFishingActivities: null,
    /** @type {ControlResume} controlResumeAndControl */
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
      state.tripMessagesLastToFormerDEPDateTimes = []
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
    /**
     * Set selected vessel voyage
     * @param {Object=} state
     * @param {{payload: VesselVoyage}} action - the vessel voyage
     */
    setVoyage (state, action) {
      state.fishingActivities = action.payload.ersMessagesAndAlerts
      state.isLastVoyage = action.payload.isLastVoyage
      state.previousBeforeDateTime = action.payload.previousBeforeDateTime
      state.nextBeforeDateTime = action.payload.nextBeforeDateTime
      state.loadingVessel = null
    },
    /**
     * Set selected vessel last voyage - This voyage is saved to be able to compare it
     * with new last voyages we will receive from the CRON
     * @param {Object=} state
     * @param {{payload: VesselVoyage}} action - the vessel last voyage
     */
    setLastVoyage (state, action) {
      state.lastFishingActivities = action.payload.ersMessagesAndAlerts
      state.fishingActivities = action.payload.ersMessagesAndAlerts
      state.isLastVoyage = action.payload.isLastVoyage
      state.previousBeforeDateTime = action.payload.previousBeforeDateTime
      state.nextBeforeDateTime = action.payload.nextBeforeDateTime
      state.loadingVessel = null
    },
    resetVoyage (state) {
      state.fishingActivities = null
      state.isLastVoyage = null
      state.previousBeforeDateTime = null
      state.nextBeforeDateTime = null
      state.loadingVessel = null
    },
    /**
     * Set selected next vessel fishing activities to propose an update of the current displayed fishing activities
     * @param {Object=} state
     * @param {{payload: FishingActivities}} action - the fishing activities with new messages
     */
    setNextFishingActivities (state, action) {
      state.nextFishingActivities = action.payload
    },
    resetNextFishingActivities (state) {
      state.nextFishingActivities = null
    },
    /**
     * Set selected vessel control resume and control
     * @param {Object=} state
     * @param {{payload: ControlResume}} action - the control resume
     */
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
    /**
     * Highlight a vessel position on map from the vessel track positions table
     * @param {Object=} state
     * @param {{payload: ControlResume}} action - The position
     */
    highlightVesselTrackPosition (state, action) {
      state.highlightedVesselTrackPosition = action.payload
    },
    /**
     * Reset the highlighted vessel position
     * @param {Object=} state
     */
    resetHighlightedVesselTrackPosition (state) {
      state.highlightedVesselTrackPosition = null
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
  setVoyage,
  setLastVoyage,
  resetVoyage,
  setLastFishingActivities,
  setNextFishingActivities,
  resetNextFishingActivities,
  addNextDEPDateTime,
  removeLastFormerDEPDateTime,
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
  highlightVesselTrackPosition,
  resetHighlightedVesselTrackPosition
} = vesselSlice.actions

export default vesselSlice.reducer
