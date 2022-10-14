import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { transform } from 'ol/proj'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../entities/map'
import { reportingIsAnInfractionSuspicion, ReportingTypeCharacteristics } from '../entities/reporting'
import {
  atLeastOneVesselSelected,
  getOnlyVesselIdentityPropertiesFromSelectedVessel,
  Vessel,
  VesselSidebarTab
} from '../entities/vessel'
import { ReportingType } from '../types/reporting'

import type { FishingActivityShowedOnMap, TrackRequest, VesselIdentity, VesselPosition } from '../types/vessel'

const NOT_FOUND = -1

function filterFirstFoundReportingType(reportingType) {
  let reportingTypeHasBeenRemoved = false

  return (acc, returnedReportingType) => {
    if (returnedReportingType === reportingType && !reportingTypeHasBeenRemoved) {
      reportingTypeHasBeenRemoved = true

      return acc
    }

    acc.push(returnedReportingType)

    return acc
  }
}

function filterFirstFoundReportingTypes(reportingTypes, vesselReportingsToRemove) {
  let vesselReportingWithoutFirstFoundReportingTypes = reportingTypes

  vesselReportingsToRemove.forEach(reportingToRemove => {
    vesselReportingWithoutFirstFoundReportingTypes = vesselReportingWithoutFirstFoundReportingTypes.reduce(
      filterFirstFoundReportingType(reportingToRemove.type),
      []
    )
  })

  return vesselReportingWithoutFirstFoundReportingTypes
}

// TODO Properly type this redux state.
export type VesselState = {
  fishingActivitiesShowedOnMap: FishingActivityShowedOnMap[]
  hideNonSelectedVessels: boolean
  highlightedVesselTrackPosition: VesselPosition | null
  isFocusedOnVesselSearch: boolean
  loadingPositions: boolean | null
  loadingVessel: boolean | null
  // TODO Fix this type which doesn't match many actions props.
  // selectedVessel: VesselNS.SelectedVessel | null
  selectedVessel: {
    alerts?: string[]
    hasAlert?: boolean
    hasInfractionSuspicion: boolean
    reportings: ReportingType[]
    vesselId?: string | undefined
  } | null
  selectedVesselIdentity: VesselIdentity | null
  selectedVesselPositions: VesselPosition[] | null
  selectedVesselTrackRequest: TrackRequest | null
  tripMessagesLastToFormerDEPDateTimes: any[]
  uniqueVesselsDistricts: any[]
  uniqueVesselsSpecies: any[]
  vesselSidebarIsOpen: boolean
  vesselSidebarTab: VesselSidebarTab
  vesselTrackExtent: any | null
  vessels: any[]
  vesselsEstimatedPositions: any[]
  vesselsTracksShowed: any
}
const INITIAL_STATE: VesselState = {
  fishingActivitiesShowedOnMap: [],
  hideNonSelectedVessels: false,
  highlightedVesselTrackPosition: null,
  isFocusedOnVesselSearch: false,
  loadingPositions: null,
  loadingVessel: null,
  selectedVessel: null,
  selectedVesselIdentity: null,
  selectedVesselPositions: null,
  selectedVesselTrackRequest: null,
  tripMessagesLastToFormerDEPDateTimes: [],
  uniqueVesselsDistricts: [],
  uniqueVesselsSpecies: [],
  vessels: [],
  vesselsEstimatedPositions: [],
  vesselSidebarIsOpen: false,
  vesselSidebarTab: VesselSidebarTab.SUMMARY,
  vesselsTracksShowed: {},
  vesselTrackExtent: null
}

const vesselSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vessel',
  reducers: {
    /**
     * Add a reporting to the vessels array
     * before the /vessels API is fetched from the cron
     */
    // TODO Make that functional.
    addVesselReporting(
      state,
      action: PayloadAction<{
        reportingType: ReportingType
        vesselId: string
      }>
    ) {
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
              reportingIsAnInfractionSuspicion(reportingType)
            ),
            reportings: nextVesselReportings
          }
        }
      })

      if (Vessel.getVesselFeatureId(state.selectedVesselIdentity) === action.payload.vesselId) {
        let reportings: ReportingType[] = []

        if (state.selectedVessel?.reportings.length) {
          reportings = state.selectedVessel.reportings
        }

        const nextVesselReportings = reportings.concat(action.payload.reportingType)

        state.selectedVessel = {
          ...state.selectedVessel,
          hasInfractionSuspicion: nextVesselReportings.some(reportingIsAnInfractionSuspicion),
          reportings: nextVesselReportings
        }
      }
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

    closeVesselSidebar(state) {
      state.vesselSidebarIsOpen = false
      state.selectedVessel = null
      state.selectedVesselIdentity = null
      state.selectedVesselTrackRequest = null
      state.isFocusedOnVesselSearch = false
      state.tripMessagesLastToFormerDEPDateTimes = []

      if (!atLeastOneVesselSelected(state.vesselsTracksShowed, state.selectedVesselIdentity)) {
        state.hideNonSelectedVessels = false
      }
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
     */
    removeVesselAlertAndUpdateReporting(
      state,
      action: PayloadAction<{
        alertType: string
        isValidated: boolean
        vesselId: string
      }>
    ) {
      state.vessels = state.vessels.map(vessel => {
        if (vessel.vesselId !== action.payload.vesselId) {
          return vessel
        }
        const filteredAlerts = vessel.vesselProperties.alerts?.filter(alert => alert !== action.payload.alertType)

        if (action.payload.isValidated) {
          const addedReportings = vessel.vesselProperties.reportings?.concat(ReportingTypeCharacteristics.ALERT.code)

          return {
            ...vessel,
            vesselProperties: {
              ...vessel.vesselProperties,
              alerts: filteredAlerts,
              hasAlert: !!filteredAlerts.length,
              hasInfractionSuspicion: addedReportings.some(reportingType =>
                reportingIsAnInfractionSuspicion(reportingType)
              ),
              reportings: addedReportings
            }
          }
        }

        return {
          ...vessel,
          vesselProperties: {
            ...vessel.vesselProperties,
            alerts: filteredAlerts,
            hasAlert: !!filteredAlerts.length
          }
        }
      })

      if (state.selectedVessel) {
        const filteredAlerts = state.selectedVessel.alerts?.filter(alert => alert !== action.payload.alertType)

        let reportingsWithAlert: ReportingType[] = []
        if (state.selectedVessel.reportings?.length) {
          reportingsWithAlert = state.selectedVessel.reportings
        }
        reportingsWithAlert = reportingsWithAlert.concat([ReportingType.ALERT])
        state.selectedVessel = {
          ...state.selectedVessel,
          alerts: filteredAlerts,
          hasAlert: filteredAlerts && !!filteredAlerts.length,
          hasInfractionSuspicion: reportingsWithAlert.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType)
          ),
          reportings: reportingsWithAlert
        }
      }
    },

    /**
     * Remove the reporting from vessels array
     * before the /vessels API is fetched from the cron
     * @function removeVesselReporting
     * @param {Object} state
     * @param {{
     *   payload: {
     *     vesselId: string
     *     reportingType: string
     *   }
     * }} action
     */
    removeVesselReporting(state, action) {
      state.vessels = state.vessels.map(vessel => {
        if (vessel.vesselId !== action.payload.vesselId) {
          return vessel
        }

        const vesselReportingWithoutFirstFoundReportingType = vessel.vesselProperties.reportings?.reduce(
          filterFirstFoundReportingType(action.payload.reportingType),
          []
        )

        return {
          ...vessel,
          vesselProperties: {
            ...vessel.vesselProperties,
            hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingType.some(reportingType =>
              reportingIsAnInfractionSuspicion(reportingType)
            ),
            reportings: vesselReportingWithoutFirstFoundReportingType
          }
        }
      })

      if (state.selectedVessel && Vessel.getVesselFeatureId(state.selectedVesselIdentity) === action.payload.vesselId) {
        const vesselReportingWithoutFirstFoundReportingType = state.selectedVessel.reportings?.reduce(
          filterFirstFoundReportingType(action.payload.reportingType),
          []
        )

        state.selectedVessel = {
          ...state.selectedVessel,
          hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingType.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType)
          ),
          reportings: vesselReportingWithoutFirstFoundReportingType
        }
      }
    },
    /**
     * Remove multiple reportings from vessels array
     * before the /vessels API is fetched from the cron
     * @function removeVesselReporting
     * @param {Object} state
     * @param {{
     *   payload: {
     *     id: number
     *     type: string
     *     vesselId: string
     *   }[]
     * }} action - the reportings to remove
     */
    removeVesselReportings(state, action) {
      const vesselsIds = action.payload.map(reporting => reporting.vesselId)
      state.vessels = state.vessels.map(vessel => {
        if (!vesselsIds.find(vesselId => vessel.vesselId === vesselId)) {
          return vessel
        }

        const vesselReportingsToRemove = action.payload.filter(reporting => vessel.vesselId === reporting.vesselId)
        const vesselReportingWithoutFirstFoundReportingTypes = filterFirstFoundReportingTypes(
          vessel.vesselProperties.reportings,
          vesselReportingsToRemove
        )

        return {
          ...vessel,
          vesselProperties: {
            ...vessel.vesselProperties,
            hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingTypes.some(reportingType =>
              reportingIsAnInfractionSuspicion(reportingType)
            ),
            reportings: vesselReportingWithoutFirstFoundReportingTypes
          }
        }
      })

      if (!state.selectedVesselIdentity) {
        return
      }

      const selectedVesselId = Vessel.getVesselFeatureId(state.selectedVesselIdentity)
      if (state.selectedVessel && vesselsIds.find(vesselId => selectedVesselId === vesselId)) {
        const vesselReportingsToRemove = action.payload.filter(reporting => selectedVesselId === reporting.vesselId)
        const vesselReportingWithoutFirstFoundReportingTypes = filterFirstFoundReportingTypes(
          state.selectedVessel.reportings || [],
          vesselReportingsToRemove
        )

        state.selectedVessel = {
          ...state.selectedVessel,
          hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingTypes.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType)
          ),
          reportings: vesselReportingWithoutFirstFoundReportingTypes
        }
      }
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

    resetLoadingVessel(state) {
      state.loadingVessel = false
      state.loadingPositions = false
    },

    resetSelectedVessel(state) {
      state.selectedVessel = null
      state.selectedVesselIdentity = null
      state.selectedVesselPositions = null
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

    setAllVesselsAsUnfiltered(state) {
      if (!state.vessels.find(vessel => vessel.isFiltered)) {
        return
      }

      state.vessels = state.vessels.map(vessel => ({
        ...vessel,
        isFiltered: 0
      }))
    },

    /**
     * Set filtered features as true
     * @function setFilteredVesselsFeatures
     * @param {Object} state
     * @param {{payload: string[]}} action - the vessel features uids
     */
    setFilteredVesselsFeatures(state, action) {
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
     * Set  previewed vessel features
     * @function setPreviewFilteredVesselsFeatures
     * @param {Object} state
     * @param {{payload: string[]}} action - the previewed vessel features uids
     */
    setPreviewFilteredVesselsFeatures(state, action) {
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

    /**
     * Set the selected vessel and positions
     * @function setSelectedVessel
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
      state.selectedVesselIdentity = getOnlyVesselIdentityPropertiesFromSelectedVessel(action.payload.vessel)
      state.selectedVesselPositions = action.payload.positions
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
     * @param {Object} state
     * @param {{payload: VesselNS.TrackRequest}} action - The track request
     */
    setSelectedVesselCustomTrackRequest(state, action) {
      state.selectedVesselTrackRequest = action.payload
    },

    setVesselsEstimatedPositions(state, action) {
      state.vesselsEstimatedPositions = action.payload
    },

    setVesselsFromAPI(state, action) {
      // FIXME : find a way to update state.vessel[vessels] without overriding
      // "private" properties like isFiltered / filterPreview when uploading from api
      state.vessels = action.payload?.map(vessel => ({
        coordinates: transform([vessel.longitude, vessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION),
        course: vessel.course,
        filterPreview: 0,
        hasBeaconMalfunction: !!vessel.beaconMalfunctionId,
        isAtPort: vessel.isAtPort,
        isFiltered: 0,
        lastPositionSentAt: new Date(vessel.dateTime).getTime(),
        speed: vessel.speed,
        vesselId: Vessel.getVesselFeatureId(vessel),
        vesselProperties: {
          ...vessel,
          flagState: vessel.flagState?.toLowerCase(),
          fleetSegmentsArray: vessel.segments ? vessel.segments.map(segment => segment.replace(' ', '')) : [],
          gearsArray: vessel.gearOnboard ? [...new Set(vessel.gearOnboard.map(gear => gear.gear))] : [],
          hasAlert: !!vessel.alerts?.length,
          hasInfractionSuspicion: vessel.reportings.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType)
          ),
          lastControlDateTimeTimestamp: vessel.lastControlDateTime
            ? new Date(vessel.lastControlDateTime).getTime()
            : '',
          speciesArray: vessel.speciesOnboard ? [...new Set(vessel.speciesOnboard.map(species => species.species))] : []
        }
      }))
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
     * @param {Object} state
     * @param {{payload: number}} action - The tab (VesselSidebarTab)
     */
    showVesselSidebarTab(state, action) {
      state.vesselSidebarTab = action.payload
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

    updatingVesselTrackDepth(state) {
      state.loadingPositions = true
    }
  }
})

export const {
  addVesselReporting,
  addVesselTrackShowed,
  closeVesselSidebar,
  highlightVesselTrackPosition,
  loadingVessel,
  removeVesselAlertAndUpdateReporting,
  removeVesselReporting,
  removeVesselReportings,
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
  updatingVesselTrackDepth
} = vesselSlice.actions

export const vesselSliceReducer = vesselSlice.reducer
