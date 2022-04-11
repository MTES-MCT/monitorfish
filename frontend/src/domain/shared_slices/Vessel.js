import { createSlice } from '@reduxjs/toolkit'

import { atLeastOneVesselSelected, Vessel, VesselSidebarTab } from '../entities/vessel'
import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'

/* eslint-disable */
/** @namespace VesselReducer */
const VesselReducer = null
/* eslint-enable */

const NOT_FOUND = -1

const vesselSlice = createSlice({
  name: 'vessel',
  initialState: {
    vessels: [],
    vesselsEstimatedPositions: [],
    /** @type {Object.<string, ShowedVesselTrack>} vesselsTracksShowed */
    vesselsTracksShowed: {},
    uniqueVesselsSpecies: [],
    uniqueVesselsDistricts: [],
    /** @type {VesselIdentity | null} selectedVesselIdentity */
    selectedVesselIdentity: null,
    /** @type {SelectedVessel | null} selectedVessel */
    selectedVessel: null,
    /** @type {VesselPosition[] | null} selectedVesselPositions */
    selectedVesselPositions: null,
    hideNonSelectedVessels: false,
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
    setVesselsFromAPI (state, action) {
      // FIXME : find a way to update state.vessel[vessels] without overriding
      // "private" properties like isFiltered / filterPreview when uploading from api
      state.vessels = action.payload?.map(vessel => {
        return {
          vesselProperties: {
            ...vessel,
            flagState: vessel.flagState?.toLowerCase(),
            gearsArray: vessel.gearOnboard ? [...new Set(vessel.gearOnboard.map(gear => gear.gear))] : [],
            fleetSegmentsArray: vessel.segments ? vessel.segments.map(segment => segment.replace(' ', '')) : [],
            speciesArray: vessel.speciesOnboard ? [...new Set(vessel.speciesOnboard.map(species => species.species))] : [],
            lastControlDateTimeTimestamp: vessel.lastControlDateTime ? new Date(vessel.lastControlDateTime).getTime() : '',
            hasAlert: !!vessel.alerts?.length
          },
          vesselId: Vessel.getVesselFeatureId(vessel),
          isAtPort: vessel.isAtPort,
          course: vessel.course,
          speed: vessel.speed,
          lastPositionSentAt: new Date(vessel.dateTime).getTime(),
          coordinates: transform([vessel.longitude, vessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION),
          isFiltered: 0,
          filterPreview: 0,
          hasBeaconMalfunction: !!vessel.beaconMalfunctionId
        }
      })
    },
    setAllVesselsAsUnfiltered (state) {
      if (!state.vessels.find(vessel => vessel.isFiltered)) {
        return
      }

      state.vessels = state.vessels.map((vessel) => {
        return {
          ...vessel,
          isFiltered: 0
        }
      })
    },
    setVesselsEstimatedPositions (state, action) {
      state.vesselsEstimatedPositions = action.payload
    },
    /**
     * Set filtered features as true
     * @function setFilteredVesselsFeatures
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string[]}} action - the vessel features uids
     */
    setFilteredVesselsFeatures (state, action) {
      const filteredVesselsFeaturesUids = action.payload
      state.vessels = state.vessels.map(vessel => {
        if (filteredVesselsFeaturesUids.indexOf(vessel.vesselId) !== NOT_FOUND) {
          return {
            ...vessel,
            isFiltered: 1
          }
        }
        return {
          ...vessel,
          isFiltered: 0
        }
      })
    },
    /**
     * Set  previewed vessel features
     * @function setPreviewFilteredVesselsFeatures
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string[]}} action - the previewed vessel features uids
     */
    setPreviewFilteredVesselsFeatures (state, action) {
      const previewFilteredVesselsFeaturesUids = action.payload
      state.vessels = state.vessels.map(vessel => {
        if (previewFilteredVesselsFeaturesUids.indexOf(vessel.vesselId) !== NOT_FOUND) {
          return {
            ...vessel,
            filterPreview: 1
          }
        }
        return {
          ...vessel,
          filterPreview: 0
        }
      })
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
      state.selectedVesselPositions = null
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

      if (!atLeastOneVesselSelected(state.vesselsTracksShowed, state.selectedVesselIdentity)) {
        state.hideNonSelectedVessels = false
      }
    },
    setFocusOnVesselSearch (state, action) {
      state.isFocusedOnVesselSearch = action.payload
    },
    resetLoadingVessel (state) {
      state.loadingVessel = false
      state.loadingPositions = false
    },
    /**
     * Set a custom track depth of the selected vessel
     * @function setSelectedVesselCustomTrackDepth
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: VesselTrackDepth | null}} action - The track depth
     */
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
     * @function setHideNonSelectedVessels
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: boolean}} action - hide (true) or show (false)
     */
    setHideNonSelectedVessels (state, action) {
      state.hideNonSelectedVessels = action.payload
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
     *   vesselId: string,
     *   showedVesselTrack: ShowedVesselTrack
     *  }}} action - the vessel positions to show on map
     */
    addVesselTrackShowed (state, action) {
      state.vesselsTracksShowed[action.payload.vesselId] = action.payload.showedVesselTrack
    },
    /**
     * Update a given vessel track as showed by the layer
     * @function updateVesselTrackAsShowed
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: {
     *   vesselId: string,
     *   extent: number[]
     * }}} action - the vessel id and extent
     */
    updateVesselTrackAsShowedWithExtend (state, action) {
      const {
        vesselId,
        extent
      } = action.payload
      if (state.vesselsTracksShowed[vesselId]) {
        state.vesselsTracksShowed[vesselId].toShow = false
        state.vesselsTracksShowed[vesselId].extent = extent
      }
    },
    /**
     * Update a given vessel track as zoomed
     * @function updateVesselTrackAsZoomed
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string}} action - the vessel id
     */
    updateVesselTrackAsZoomed (state, action) {
      if (state.vesselsTracksShowed[action.payload]) {
        state.vesselsTracksShowed[action.payload].toZoom = false
      }
    },
    /**
     * Update a given vessel track as to be hidden by the layer
     * @function updateVesselTrackAsShowed
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string}} action - the vessel id
     */
    updateVesselTrackAsToHide (state, action) {
      if (state.vesselsTracksShowed[action.payload]) {
        state.vesselsTracksShowed[action.payload].toHide = true
      }
    },
    /**
     * Remove the vessel track to the list
     * @function updateVesselTrackAsHidden
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: string}} action - the vessel id
     */
    updateVesselTrackAsHidden (state, action) {
      delete state.vesselsTracksShowed[action.payload]

      if (!atLeastOneVesselSelected(state.vesselsTracksShowed, state.selectedVesselIdentity)) {
        state.hideNonSelectedVessels = false
      }
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
  setVesselsFromAPI,
  setAllVesselsAsUnfiltered,
  setFilteredVesselsFeatures,
  setPreviewFilteredVesselsFeatures,
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
  updateVesselTrackAsShowedWithExtend,
  updateVesselTrackAsToHide,
  updateVesselTrackAsHidden,
  updateVesselTrackAsZoomed,
  setVesselTrackExtent,
  resetVesselTrackExtent,
  setHideNonSelectedVessels
} = vesselSlice.actions

export default vesselSlice.reducer
