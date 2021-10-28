/* eslint-disable */
import { VesselSidebarTab } from '../entities/vessel'

/** @namespace VesselReducer */
const VesselReducer = null
/* eslint-disable */

import { createSlice } from '@reduxjs/toolkit'

const vesselSlice = createSlice({
  name: 'vessel',
  initialState: {
    /** @type {VesselIdentity | null} selectedVesselIdentity */
    selectedVesselIdentity: null,
    vessels: [],
    /** @type {Object.<string, ShowedVesselTrack>} vesselsTracksShowed */
    vesselsTracksShowed: {},
    uniqueVesselsSpecies: [],
    uniqueVesselsDistricts: [],
    filteredVesselsFeaturesUids: [],
    previewFilteredVesselsFeaturesUids: [],
    vesselsLayerSource: null,
    /** @type {SelectedVessel | null} selectedVessel */
    selectedVessel: null,
    hideOtherVessels: false,
    /** @type {VesselPosition | null} highlightedVesselTrackPosition */
    highlightedVesselTrackPosition: null,
    loadingVessel: null,
    vesselSidebarIsOpen: false,
    vesselSidebarTab: VesselSidebarTab.SUMMARY,
    isFocusedOnVesselSearch: false,
    /** @type {FishingActivities} fishingActivities */
    fishingActivities: {},
    /** @type {FishingActivities} lastFishingActivities */
    lastFishingActivities: {},
    isLastVoyage: null,
    isFirstVoyage: null,
    tripNumber: null,
    /** @type {FishingActivities | null} nextFishingActivities */
    nextFishingActivities: null,
    /** @type {ControlResume} controlResumeAndControl */
    controlResumeAndControls: {},
    nextControlResumeAndControls: null,
    controlsFromDate: new Date(new Date().getUTCFullYear() - 5, 0, 1),
    /** @type {VesselTrackDepth} selectedVesselCustomTrackDepth */
    selectedVesselCustomTrackDepth: {
      trackDepth: null,
      afterDateTime: null,
      beforeDateTime: null
    },
    vesselTrackExtent: null
  },
  reducers: {
    setVessels (state, action) {
      state.vessels = action.payload
    },
    resetVessels (state) {
      state.vessels = []
    },
    /**
     * Set the list of vessel features Uids for filtering features (using JS indexOf is good for performance)
     * @function setFilteredVesselsFeaturesUids
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string[]}} action - the vessel features uids
     */
    setFilteredVesselsFeaturesUids (state, action) {
      state.filteredVesselsFeaturesUids = action.payload
    },
    /**
     * Set the list of previewed vessel features Uids (using JS indexOf is good for performance)
     * @function setPreviewFilteredVesselsFeaturesUids
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string[]}} action - the previewed vessel features uids
     */
    setPreviewFilteredVesselsFeaturesUids (state, action) {
      state.previewFilteredVesselsFeaturesUids = action.payload
    },
    setVesselsLayerSource (state, action) {
      state.vesselsLayerSource = action.payload
    },
    loadingVessel (state, action) {
      state.selectedVesselIdentity = action.payload.vesselIdentity
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
      state.selectedVesselIdentity = null
    },
    closeVesselSidebar (state) {
      state.vesselSidebarIsOpen = false
      state.selectedVessel = null
      state.selectedVesselIdentity = null
      state.selectedVesselCustomTrackDepth = {
        trackDepth: null,
        afterDateTime: null,
        beforeDateTime: null
      }
      state.tripMessagesLastToFormerDEPDateTimes = []
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
     * @function setVoyage
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: VesselVoyage}} action - the vessel voyage
     */
    setVoyage (state, action) {
      state.fishingActivities = action.payload.ersMessagesAndAlerts
      state.isLastVoyage = action.payload.isLastVoyage
      state.isFirstVoyage = action.payload.isFirstVoyage
      state.tripNumber = action.payload.tripNumber
      state.loadingVessel = null
    },
    /**
     * Set selected vessel last voyage - This voyage is saved to be able to compare it
     * with new last voyages we will receive from the CRON
     * @function setLastVoyage
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: VesselVoyage}} action - the vessel last voyage
     */
    setLastVoyage (state, action) {
      state.lastFishingActivities = action.payload.ersMessagesAndAlerts
      state.fishingActivities = action.payload.ersMessagesAndAlerts
      state.isLastVoyage = action.payload.isLastVoyage
      state.isFirstVoyage = action.payload.isFirstVoyage
      state.tripNumber = action.payload.tripNumber
      state.loadingVessel = null
    },
    resetVoyage (state) {
      state.fishingActivities = null
      state.isLastVoyage = null
      state.isFirstVoyage = null
      state.voyageStartDate = null
      state.voyageEndDate = null
      state.tripNumber = null
      state.loadingVessel = null
    },
    /**
     * Set selected next vessel fishing activities to propose an update of the current displayed fishing activities
     * @function setNextFishingActivities
     * @memberOf VesselReducer
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
     * @function setControlResumeAndControls
     * @memberOf VesselReducer
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
    setSelectedVesselCustomTrackDepth (state, action) {
      state.selectedVesselCustomTrackDepth = action.payload
    },
    resetSelectedVesselCustomTrackDepth (state) {
      state.selectedVesselCustomTrackDepth = {
        trackDepth: null,
        afterDateTime: null,
        beforeDateTime: null
      }
    },
    /**
     * Highlight a vessel position on map from the vessel track positions table
     * @function highlightVesselTrackPosition
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: Position | null}} action - The position
     */
    highlightVesselTrackPosition (state, action) {
      state.highlightedVesselTrackPosition = action.payload
    },
    /**
     * Reset the highlighted vessel position
     * @function resetHighlightedVesselTrackPosition
     * @memberOf VesselReducer
     * @param {Object=} state
     */
    resetHighlightedVesselTrackPosition (state) {
      state.highlightedVesselTrackPosition = null
    },
    /**
     * Show the specified vessel tab
     * @function showVesselSidebarTab
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: VesselSidebarTab}} action - The tab
     */
    showVesselSidebarTab (state, action) {
      state.vesselSidebarTab = action.payload
    },
    /**
     * Set the date since controls are fetched
     * @function setControlFromDate
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: Date}} action - The "from" date
     */
    setControlFromDate (state, action) {
      state.controlsFromDate = action.payload
    },
    setVesselsSpeciesAndDistricts (state, action) {
      state.uniqueVesselsSpecies = action.payload.species
      state.uniqueVesselsDistricts = action.payload.districts
    },
    /**
     * Show or hide other vessels (than the selected vessel)
     * @function setHideOtherVessels
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: boolean}} action - hide (true) or show (false)
     */
    setHideOtherVessels (state, action) {
      state.hideOtherVessels = action.payload
    },
    /**
     * Add a new vessel track to show or remove -
     * In the ShowedVesselTrack object,
     * - The `toShow` property trigger the layer to show the track
     * - The `toHide` property trigger the layer to hide the track
     * @function addVesselTrackShowed
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: {
     *   identity: string,
     *   showedVesselTrack: ShowedVesselTrack
     *  }}} action - the vessel positions to show on map
     */
    addVesselTrackShowed (state, action) {
      state.vesselsTracksShowed[action.payload.identity] = action.payload.showedVesselTrack
    },
    /**
     * Update a given vessel track as showed by the layer
     * @function updateVesselTrackAsShowed
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string}} action - the vessel identity
     */
    updateVesselTrackAsShowed (state, action) {
      state.vesselsTracksShowed[action.payload].toShow = false
    },
    /**
     * Update a given vessel track as to be hidden by the layer
     * @function updateVesselTrackAsShowed
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string}} action - the vessel identity
     */
    updateVesselTrackAsToHide (state, action) {
      state.vesselsTracksShowed[action.payload].toHide = true
    },
    /**
     * Remove the vessel track to the list
     * @function updateVesselTrackAsHidden
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string}} action - the vessel identity
     */
    updateVesselTrackAsHidden (state, action) {
      delete state.vesselsTracksShowed[action.payload]
    },
    /**
     * Set the vessel track features extent - used to fit the extent into the OpenLayers view
     * @function setVesselTrackExtent
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string[]}} action - the extent
     */
    setVesselTrackExtent (state, action) {
      state.vesselTrackExtent = action.payload
    },
    /**
     * Reset the vessel track features extent
     * @function setVesselTrackExtent
     * @memberOf VesselReducer
     * @param {Object=} state
     */
    resetVesselTrackExtent (state) {
      state.vesselTrackExtent = null
    }
  }
})

export const {
  setVessels,
  resetVessels,
  setFilteredVesselsFeaturesUids,
  setPreviewFilteredVesselsFeaturesUids,
  setVesselsLayerSource,
  loadingVessel,
  resetLoadingVessel,
  setSelectedVessel,
  resetSelectedVessel,
  closeVesselSidebar,
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
  setSelectedVesselCustomTrackDepth,
  resetSelectedVesselCustomTrackDepth,
  highlightVesselTrackPosition,
  resetHighlightedVesselTrackPosition,
  showVesselSidebarTab,
  setControlFromDate,
  setVesselsSpeciesAndDistricts,
  setHideOtherVessels,
  addVesselTrackShowed,
  updateVesselTrackAsShowed,
  updateVesselTrackAsToHide,
  updateVesselTrackAsHidden,
  setVesselTrackExtent,
  resetVesselTrackExtent
} = vesselSlice.actions

export default vesselSlice.reducer
