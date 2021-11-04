/* eslint-disable */
import { VesselSidebarTab } from '../entities/vessel'
import { createSlice } from '@reduxjs/toolkit'

/** @namespace VesselReducer */
const VesselReducer = null
/* eslint-disable */

const vesselSlice = createSlice({
  name: 'vessel',
  initialState: {
    vessels: [],
    /** @type {Object.<string, ShowedVesselTrack>} vesselsTracksShowed */
    vesselsTracksShowed: {},
    uniqueVesselsSpecies: [],
    uniqueVesselsDistricts: [],
    filteredVesselsFeaturesUids: [],
    previewFilteredVesselsFeaturesUids: [],
    vesselsLayerSource: null,
    /** @type {VesselIdentity | null} selectedVesselIdentity */
    selectedVesselIdentity: null,
    /** @type {SelectedVessel | null} selectedVessel */
    selectedVessel: null,
    /** @type {VesselPosition[] | null} selectedVesselPositions */
    selectedVesselPositions: null,
    hideOtherVessels: false,
    /** @type {VesselPosition | null} highlightedVesselTrackPosition */
    highlightedVesselTrackPosition: null,
    loadingVessel: null,
    loadingPositions: null,
    vesselSidebarIsOpen: false,
    vesselSidebarTab: VesselSidebarTab.SUMMARY,
    isFocusedOnVesselSearch: false,
    /** @type {VesselTrackDepth} selectedVesselCustomTrackDepth */
    selectedVesselCustomTrackDepth: {
      trackDepth: null,
      afterDateTime: null,
      beforeDateTime: null
    },
    vesselTrackExtent: null,
    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    fishingActivitiesShowedOnMap: []
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
        state.loadingPositions = true
      }
    },
    updatingVesselTrackDepth (state) {
      state.loadingPositions = true
    },
    /**
     * Set the selected vessel and positions
     * @function setSelectedVessel
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: {
     *   vessel: Vessel,
     *   positions: VesselPosition[]
     * }}} action - The positions
     */
    setSelectedVessel (state, action) {
      state.loadingVessel = null
      state.loadingPositions = null
      state.selectedVessel = action.payload.vessel
      state.selectedVesselPositions = action.payload.positions
    },
    /**
     * Update the positions of the vessel
     * @function updateSelectedVesselPositions
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: VesselPosition[]}} action - The positions
     */
    updateSelectedVesselPositions (state, action) {
      state.loadingPositions = null
      state.selectedVesselPositions = action.payload
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
    resetLoadingVessel (state) {
      state.loadingVessel = false
      state.loadingPositions = false
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
     * @param {{payload: VesselPosition | null}} action - The position
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
     * @param {{payload: number}} action - The tab (VesselSidebarTab)
     */
    showVesselSidebarTab (state, action) {
      state.vesselSidebarTab = action.payload
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
     * @param {{payload: number[]}} action - the extent
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
  updatingVesselTrackDepth,
  setSelectedVessel,
  updateSelectedVesselPositions,
  resetSelectedVessel,
  closeVesselSidebar,
  setFocusOnVesselSearch,
  setTemporaryVesselsToHighLightOnMap,
  resetTemporaryVesselsToHighLightOnMap,
  setSelectedVesselCustomTrackDepth,
  resetSelectedVesselCustomTrackDepth,
  highlightVesselTrackPosition,
  resetHighlightedVesselTrackPosition,
  showVesselSidebarTab,
  setVesselsSpeciesAndDistricts,
  addVesselTrackShowed,
  updateVesselTrackAsShowed,
  updateVesselTrackAsToHide,
  updateVesselTrackAsHidden,
  setVesselTrackExtent,
  resetVesselTrackExtent,
  setHideOtherVessels
} = vesselSlice.actions

export default vesselSlice.reducer
