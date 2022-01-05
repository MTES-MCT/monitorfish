import { VesselSidebarTab, Vessel } from '../entities/vessel'
import { createSlice } from '@reduxjs/toolkit'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'
import { transform } from 'ol/proj'

/* eslint-disable */
/** @namespace VesselReducer */
const VesselReducer = null
/* eslint-enable */

const NOT_FOUND = -1

const vesselSlice = createSlice({
  name: 'vessel',
  initialState: {
    vesselsgeojson: [],
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
    setVessels (state, action) {
      state.vesselsgeojson = action.payload?.map((vessel) => {
        return {
          ...vessel,
          vesselId: Vessel.getVesselId(vessel),
          lastPositionSentAt: new Date(vessel.dateTime).getTime(),
          coordinates: transform([vessel.longitude, vessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION),
          // new params
          flagState: vessel.flagState?.toLowerCase(),
          gearsArray: vessel.gearOnboard ? [...new Set(vessel.gearOnboard.map(gear => gear.gear))] : [],
          fleetSegmentsArray: vessel.segments ? vessel.segments.map(segment => segment.replace(' ', '')) : [],
          speciesArray: vessel.speciesOnboard ? [...new Set(vessel.speciesOnboard.map(species => species.species))] : [],
          lastControlDateTimeTimestamp: vessel.lastControlDateTime ? new Date(vessel.lastControlDateTime).getTime() : ''
        }
      })
    },
    setUnfilteredVessels (state, action) {
      state.vesselsgeojson = action.payload?.map((vessel) => {
        return {
          ...vessel,
          isFiltered: 0,
          vesselId: Vessel.getVesselId(vessel),
          lastPositionSentAt: new Date(vessel.dateTime).getTime(),
          coordinates: transform([vessel.longitude, vessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION),
          flagState: vessel.flagState?.toLowerCase(),
          gearsArray: vessel.gearOnboard ? [...new Set(vessel.gearOnboard.map(gear => gear.gear))] : [],
          fleetSegmentsArray: vessel.segments ? vessel.segments.map(segment => segment.replace(' ', '')) : [],
          speciesArray: vessel.speciesOnboard ? [...new Set(vessel.speciesOnboard.map(species => species.species))] : [],
          lastControlDateTimeTimestamp: vessel.lastControlDateTime ? new Date(vessel.lastControlDateTime).getTime() : ''
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
      state.vesselsgeojson = state.vesselsgeojson.map((vessel) => {
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
      console.time('previewFilteredVesselsFeatures')
      state.vesselsgeojson = state.vesselsgeojson.map((vessel) => {
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
      console.timeEnd('previewFilteredVesselsFeatures')
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
     * @function sethideNonSelectedVessels
     * @memberOf VesselReducer
     * @param {Object=} state
     * @param {{payload: boolean}} action - hide (true) or show (false)
     */
    sethideNonSelectedVessels (state, action) {
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
  setUnfilteredVessels,
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
  updateVesselTrackAsShowed,
  updateVesselTrackAsToHide,
  updateVesselTrackAsHidden,
  setVesselTrackExtent,
  resetVesselTrackExtent,
  sethideNonSelectedVessels
} = vesselSlice.actions

export default vesselSlice.reducer
