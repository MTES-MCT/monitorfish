import { createSlice } from '@reduxjs/toolkit'
import { transform } from 'ol/proj'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'
import { reportingIsAnInfractionSuspicion, ReportingType } from '../entities/reporting'
import { atLeastOneVesselSelected, Vessel, VesselSidebarTab } from '../entities/vessel'
import { VesselTrackDepth } from '../entities/vesselTrackDepth'

const NOT_FOUND = -1

function filterFirstFoundReportingType(action) {
  let reportingTypeHasBeenRemoved = false

  return (acc, reportingType) => {
    if (reportingType === action.payload.reportingType && !reportingTypeHasBeenRemoved) {
      reportingTypeHasBeenRemoved = true

      return acc
    }

    acc.push(reportingType)

    return acc
  }
}

const vesselSlice = createSlice({
  initialState: {
    /** @type {VesselNS.FishingActivityShowedOnMap[]} */
    fishingActivitiesShowedOnMap: [],
    hideNonSelectedVessels: false,
    /** @type {VesselNS.VesselPosition | null} */
    highlightedVesselTrackPosition: null,
    isFocusedOnVesselSearch: false,

    /** @type {boolean | null} */
    loadingPositions: null,

    /** @type {boolean | null} */
    loadingVessel: null,
    /** @type {VesselNS.SelectedVessel | null} */
    selectedVessel: null,
    /** @type {VesselNS.TrackRequest} */
    selectedVesselCustomTrackRequest: {
      afterDateTime: null,
      beforeDateTime: null,
      trackDepth: VesselTrackDepth.TWELVE_HOURS,
    },
    /** @type {VesselNS.VesselIdentity | null} */
    selectedVesselIdentity: null,
    /** @type {VesselNS.VesselPosition[] | null} */
    selectedVesselPositions: null,
    /** @type {any[]} */
    tripMessagesLastToFormerDEPDateTimes: [],
    /** @type {any[]} */
    uniqueVesselsDistricts: [],
    /** @type {any[]} */
    uniqueVesselsSpecies: [],
    /** @type {any[]} */
    vessels: [],
    /** @type {any[]} */
    vesselsEstimatedPositions: [],
    vesselSidebarIsOpen: false,
    vesselSidebarTab: VesselSidebarTab.SUMMARY,
    /** @type {Object.<string, VesselNS.ShowedVesselTrack>} */
    vesselsTracksShowed: {},

    vesselTrackExtent: null,
  },
  name: 'vessel',
  reducers: {
    /**
     * Add a reporting to the vessels array
     * before the /vessels API is fetched from the cron
     * @function addVesselReporting
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{
     *   payload: {
     *     vesselId: string,
     *     reportingType: string
     *   }
     * }} action - the vessel alert to validate or silence
     */
    addVesselReporting(state, action) {
      state.vessels = state.vessels.map(vessel => {
        if (vessel.vesselId !== action.payload.vesselId) {
          return vessel
        }

        const nextVesselReportings = vessel.vesselProperties.reportings?.concat(action.payload.reportingType)

        return {
          ...vessel,
          vesselProperties: {
            ...vessel.vesselProperties,
            hasInfractionSuspicion: nextVesselReportings.some(reportingType =>
              reportingIsAnInfractionSuspicion(reportingType),
            ),
            reportings: nextVesselReportings,
          },
        }
      })

      if (Vessel.getVesselFeatureId(state.selectedVesselIdentity) === action.payload.vesselId) {
        const nextVesselReportings = state.selectedVessel.reportings?.concat(action.payload.reportingType)

        state.selectedVessel = {
          ...state.selectedVessel,
          hasInfractionSuspicion: nextVesselReportings.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType),
          ),
          reportings: nextVesselReportings,
        }
      }
    },

    loadingVessel(state, action) {
      state.selectedVesselIdentity = action.payload.vesselIdentity
      state.vesselSidebarIsOpen = true
      if (!action.payload.calledFromCron) {
        state.selectedVessel = null
        state.loadingVessel = true
        state.loadingPositions = true
      }
    },

    /**
     * Remove the vessel alert and update the reporting in the vessels array and selected vessel object
     * before the /vessels API is fetched from the cron
     * @function removeVesselAlertAndUpdateReporting
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: {
     *   vesselId: string,
     *   alertType: string,
     *   isValidated: boolean
     * }}} action - the vessel alert to validate or silence
     */
    removeVesselAlertAndUpdateReporting(state, action) {
      state.vessels = state.vessels.map(vessel => {
        if (vessel.vesselId !== action.payload.vesselId) {
          return vessel
        }
        const filteredAlerts = vessel.vesselProperties.alerts?.filter(alert => alert !== action.payload.alertType)

        if (action.payload.isValidated) {
          const addedReportings = vessel.vesselProperties.reportings?.concat(ReportingType.ALERT.code)

          return {
            ...vessel,
            vesselProperties: {
              ...vessel.vesselProperties,
              alerts: filteredAlerts,
              hasAlert: !!filteredAlerts.length,
              hasInfractionSuspicion: addedReportings.some(reportingType =>
                reportingIsAnInfractionSuspicion(reportingType),
              ),
              reportings: addedReportings,
            },
          }
        }

        return {
          ...vessel,
          vesselProperties: {
            ...vessel.vesselProperties,
            alerts: filteredAlerts,
            hasAlert: !!filteredAlerts.length,
          },
        }
      })

      if (state.selectedVessel) {
        const filteredAlerts = state.selectedVessel.alerts?.filter(alert => alert !== action.payload.alertType)
        const addedReportings = state.selectedVessel.reportings?.concat(ReportingType.ALERT.code)
        state.selectedVessel = {
          ...state.selectedVessel,
          alerts: filteredAlerts,
          hasAlert: !!filteredAlerts.length,
          hasInfractionSuspicion: addedReportings.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType),
          ),
          reportings: addedReportings,
        }
      }
    },

    /**
     * Remove the reporting from vessels array
     * before the /vessels API is fetched from the cron
     * @function removeVesselReporting
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{
     *   payload: {
     *     vesselId: string
     *     reportingType: string
     *   }
     * }} action - the vessel alert to validate or silence
     */
    removeVesselReporting(state, action) {
      state.vessels = state.vessels.map(vessel => {
        if (vessel.vesselId !== action.payload.vesselId) {
          return vessel
        }

        const vesselReportingWithoutFirstFoundReportingType = vessel.vesselProperties.reportings?.reduce(
          filterFirstFoundReportingType(action),
          [],
        )

        return {
          ...vessel,
          vesselProperties: {
            ...vessel.vesselProperties,
            hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingType.some(reportingType =>
              reportingIsAnInfractionSuspicion(reportingType),
            ),
            reportings: vesselReportingWithoutFirstFoundReportingType,
          },
        }
      })

      if (Vessel.getVesselFeatureId(state.selectedVesselIdentity) === action.payload.vesselId) {
        const vesselReportingWithoutFirstFoundReportingType = state.selectedVessel.reportings?.reduce(
          filterFirstFoundReportingType(action),
          [],
        )

        state.selectedVessel = {
          ...state.selectedVessel,
          hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingType.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType),
          ),
          reportings: vesselReportingWithoutFirstFoundReportingType,
        }
      }
    },

    closeVesselSidebar(state) {
      state.vesselSidebarIsOpen = false
      state.selectedVessel = null
      state.selectedVesselIdentity = null
      state.selectedVesselCustomTrackRequest = {
        afterDateTime: null,
        trackDepth: VesselTrackDepth.TWELVE_HOURS,
        beforeDateTime: null,
      }
      state.isFocusedOnVesselSearch = false
      state.tripMessagesLastToFormerDEPDateTimes = []

      if (!atLeastOneVesselSelected(state.vesselsTracksShowed, state.selectedVesselIdentity)) {
        state.hideNonSelectedVessels = false
      }
    },

    setAllVesselsAsUnfiltered(state) {
      if (!state.vessels.find(vessel => vessel.isFiltered)) {
        return
      }

      state.vessels = state.vessels.map(vessel => ({
        ...vessel,
        isFiltered: 0,
      }))
    },

    resetSelectedVessel(state) {
      state.selectedVessel = null
      state.selectedVesselIdentity = null
      state.selectedVesselPositions = null
    },

    setVesselsFromAPI(state, action) {
      // FIXME : find a way to update state.vessel[vessels] without overriding
      // "private" properties like isFiltered / filterPreview when uploading from api
      state.vessels = action.payload?.map(vessel => ({
        isAtPort: vessel.isAtPort,
        vesselProperties: {
          ...vessel,
          flagState: vessel.flagState?.toLowerCase(),
          fleetSegmentsArray: vessel.segments ? vessel.segments.map(segment => segment.replace(' ', '')) : [],
            gearsArray: vessel.gearOnboard ? [...new Set(vessel.gearOnboard.map(gear => gear.gear))] : [],
          speciesArray: vessel.speciesOnboard
            ? [...new Set(vessel.speciesOnboard.map(species => species.species))]
            : [],
          lastControlDateTimeTimestamp: vessel.lastControlDateTime
            ? new Date(vessel.lastControlDateTime).getTime()
            : '',
          hasAlert: !!vessel.alerts?.length,
          hasInfractionSuspicion: vessel.reportings.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType),
          ),
        },
        vesselId: Vessel.getVesselFeatureId(vessel),
        course: vessel.course,
        lastPositionSentAt: new Date(vessel.dateTime).getTime(),
        coordinates: transform([vessel.longitude, vessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION),
        speed: vessel.speed,
        filterPreview: 0,
        isFiltered: 0,
        hasBeaconMalfunction: !!vessel.beaconMalfunctionId,
      }))
    },

    resetLoadingVessel(state) {
      state.loadingVessel = false
      state.loadingPositions = false
    },

    /**
     * Set filtered features as true
     * @function setFilteredVesselsFeatures
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: string[]}} action - the vessel features uids
     */
    setFilteredVesselsFeatures(state, action) {
      const filteredVesselsFeaturesUids = action.payload
      state.vessels = state.vessels.map(vessel => {
        if (filteredVesselsFeaturesUids.indexOf(vessel.vesselId) !== NOT_FOUND) {
          return {
            ...vessel,
            isFiltered: 1,
          }
        }

        return {
          ...vessel,
          isFiltered: 0,
        }
      })
    },

    
    /**
     * Highlight a vessel position on map from the vessel track positions table
     * @function highlightVesselTrackPosition
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: VesselNS.VesselPosition | null}} action - The position
     */
highlightVesselTrackPosition(state, action) {
      state.highlightedVesselTrackPosition = action.payload
    },

    
/**
     * Set  previewed vessel features
     * @function setPreviewFilteredVesselsFeatures
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: string[]}} action - the previewed vessel features uids
     */
setPreviewFilteredVesselsFeatures(state, action) {
      const previewFilteredVesselsFeaturesUids = action.payload
      state.vessels = state.vessels.map(vessel => {
        if (previewFilteredVesselsFeaturesUids.indexOf(vessel.vesselId) !== NOT_FOUND) {
          return {
            ...vessel,
            filterPreview: 1,
          }
        }

        return {
          ...vessel,
          filterPreview: 0,
        }
      })
    },

    setVesselsEstimatedPositions(state, action) {
      state.vesselsEstimatedPositions = action.payload
    },

    /**
     * Reset the highlighted vessel position
     * @function resetHighlightedVesselTrackPosition
     * @memberOf VesselReducer
     * @param {Object} state
     */
    resetHighlightedVesselTrackPosition(state) {
      state.highlightedVesselTrackPosition = null
    },

    
/**
     * Add a new vessel track to show or remove -
     * In the ShowedVesselTrack object,
     * - The `toShow` property trigger the layer to show the track
     * - The `toHide` property trigger the layer to hide the track
     * @function addVesselTrackShowed
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: {
     *   vesselId: string,
     *   showedVesselTrack: VesselNS.ShowedVesselTrack
     *  }}} action - the vessel positions to show on map
     */
addVesselTrackShowed(state, action) {
      state.vesselsTracksShowed[action.payload.vesselId] = action.payload.showedVesselTrack
    },

    
/**
     * Set the selected vessel and positions
     * @function setSelectedVessel
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: {
     *   vessel: Vessel,
     *   positions: VesselNS.VesselPosition[]
     * }}} action - The positions
     */
setSelectedVessel(state, action) {
      state.loadingVessel = null
      state.loadingPositions = null
      state.selectedVessel = action.payload.vessel
      state.selectedVesselPositions = action.payload.positions
    },

    updatingVesselTrackDepth(state) {
      state.loadingPositions = true
    },

    setFocusOnVesselSearch(state, action) {
      state.isFocusedOnVesselSearch = action.payload
    },

    
/**
     * Show or hide other vessels (than the selected vessel)
     * @function setHideNonSelectedVessels
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: boolean}} action - hide (true) or show (false)
     */
setHideNonSelectedVessels(state, action) {
      state.hideNonSelectedVessels = action.payload
    },

    
    /**
     * Update the positions of the vessel
     * @function updateSelectedVesselPositions
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: VesselNS.VesselPosition[]}} action - The positions
     */
updateSelectedVesselPositions(state, action) {
      state.loadingPositions = null
      state.selectedVesselPositions = action.payload
    },

    /**
     * Set the custom track request of the selected vessel
     * The `afterDateTime` and `beforeDateTime` Dates objects are kept in the local timezone format.
     * Only the date part is used, as the time will be set as :
     *  afterDateTime: 00h00
     *  beforeDateTime: 23h59
     * When fetching the track from the API
     *
     * @function setSelectedVesselCustomTrackRequest
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: VesselNS.TrackRequest}} action - The track request
     */
    setSelectedVesselCustomTrackRequest(state, action) {
      state.selectedVesselCustomTrackRequest = action.payload
    },

    /**
     * Reset the vessel track features extent
     * @function setVesselTrackExtent
     * @memberOf VesselReducer
     * @param {Object} state
     */
resetVesselTrackExtent(state) {
      state.vesselTrackExtent = null
    },

    
    
setVesselsSpeciesAndDistricts(state, action) {
      state.uniqueVesselsSpecies = action.payload.species
      state.uniqueVesselsDistricts = action.payload.districts
    },

    /**
     * Set the vessel track features extent - used to fit the extent into the OpenLayers view
     * @function setVesselTrackExtent
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: number[]}} action - the extent
     */
    setVesselTrackExtent(state, action) {
      state.vesselTrackExtent = action.payload
    },

    /**
     * Show the specified vessel tab
     * @function showVesselSidebarTab
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: number}} action - The tab (VesselSidebarTab)
     */
    showVesselSidebarTab(state, action) {
      state.vesselSidebarTab = action.payload
    },

    /**
     * Remove the vessel track to the list
     * @function updateVesselTrackAsHidden
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: string}} action - the vessel id
     */
    updateVesselTrackAsHidden(state, action) {
      delete state.vesselsTracksShowed[action.payload]

      if (!atLeastOneVesselSelected(state.vesselsTracksShowed, state.selectedVesselIdentity)) {
        state.hideNonSelectedVessels = false
      }
    },

    /**
     * Update a given vessel track as showed by the layer
     * @function updateVesselTrackAsShowed
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: {
     *   vesselId: string,
     *   extent: number[]
     * }}} action - the vessel id and extent
     */
    updateVesselTrackAsShowedWithExtend(state, action) {
      const { extent, vesselId } = action.payload
      if (state.vesselsTracksShowed[vesselId]) {
        state.vesselsTracksShowed[vesselId].toShow = false
        state.vesselsTracksShowed[vesselId].extent = extent
      }
    },

    /**
     * Update a given vessel track as to be hidden by the layer
     * @function updateVesselTrackAsShowed
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: string}} action - the vessel id
     */
    updateVesselTrackAsToHide(state, action) {
      if (state.vesselsTracksShowed[action.payload]) {
        state.vesselsTracksShowed[action.payload].toHide = true
      }
    },

    /**
     * Update a given vessel track as zoomed
     * @function updateVesselTrackAsZoomed
     * @memberOf VesselReducer
     * @param {Object} state
     * @param {{payload: string}} action - the vessel id
     */
    updateVesselTrackAsZoomed(state, action) {
      if (state.vesselsTracksShowed[action.payload]) {
        state.vesselsTracksShowed[action.payload].toZoom = false
      }
    },
  },
})

export const {
  addVesselReporting,
  addVesselTrackShowed,
  closeVesselSidebar,
  highlightVesselTrackPosition,
  loadingVessel,
  removeVesselAlertAndUpdateReporting,
  removeVesselReporting,
  resetHighlightedVesselTrackPosition,
  resetLoadingVessel,
  resetSelectedVessel,
  resetVesselTrackExtent,
  setAllVesselsAsUnfiltered,
  setFilteredVesselsFeatures,
  setFocusOnVesselSearch,
  setHideNonSelectedVessels,
  setPreviewFilteredVesselsFeatures,
  setSelectedVessel,
  setSelectedVesselCustomTrackRequest,
  setVesselsFromAPI,
  setVesselsSpeciesAndDistricts,
  setVesselTrackExtent,
  showVesselSidebarTab,
  updateSelectedVesselPositions,
  updateVesselTrackAsHidden,
  updateVesselTrackAsShowedWithExtend,
  updateVesselTrackAsToHide,
  updateVesselTrackAsZoomed,
  updatingVesselTrackDepth,
} = vesselSlice.actions

export default vesselSlice.reducer
