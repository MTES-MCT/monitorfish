import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from '@reduxjs/toolkit'

import {
  atLeastOneVesselSelected,
  getOnlyVesselIdentityProperties,
  Vessel,
  VesselSidebarTab
} from '../../domain/entities/vessel/vessel'
import { ReportingType, ReportingTypeCharacteristics } from '../Reporting/types'

import type {
  FishingActivityShowedOnMap,
  ShowedVesselTrack,
  TrackRequest,
  VesselEnhancedLastPositionWebGLObject,
  VesselFeatureId,
  VesselIdentity,
  VesselPosition
} from '../../domain/entities/vessel/types'
import type { Vessel as VesselTypes } from '@features/Vessel/Vessel.types'

const NOT_FOUND = -1

export const vesselsAdapter = createEntityAdapter({
  selectId: (vessel: VesselEnhancedLastPositionWebGLObject) => vessel.vesselFeatureId,
  sortComparer: false
})

// TODO Properly type this redux state.
export type VesselState = {
  fishingActivitiesShowedOnMap: FishingActivityShowedOnMap[]
  hideNonSelectedVessels: boolean
  highlightedVesselTrackPosition: VesselPosition | null
  isFocusedOnVesselSearch: boolean
  loadingPositions: boolean | null
  loadingVessel: boolean | null
  selectedVessel: VesselTypes.AugmentedSelectedVessel | null
  selectedVesselIdentity: VesselIdentity | null
  selectedVesselPositions: VesselPosition[] | null
  selectedVesselTrackRequest: TrackRequest | null
  tripMessagesLastToFormerDEPDateTimes: any[]
  uniqueVesselsDistricts: any[]
  uniqueVesselsSpecies: any[]
  vesselSidebarIsOpen: boolean
  vesselSidebarTab: VesselSidebarTab
  vesselTrackExtent: any | null
  vessels: EntityState<VesselEnhancedLastPositionWebGLObject, VesselFeatureId>
  vesselsEstimatedPositions: any[]
  vesselsTracksShowed: Record<string, ShowedVesselTrack>
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
  vessels: vesselsAdapter.getInitialState(),
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
        vesselFeatureId: VesselFeatureId
      }>
    ) {
      const vessel = vesselsAdapter.getSelectors().selectById(state.vessels, action.payload.vesselFeatureId)

      if (vessel) {
        const nextVesselReportings = vessel?.vesselProperties?.reportings?.concat(action.payload.reportingType)
        const nextVessel = {
          ...vessel,
          vesselProperties: {
            ...vessel.vesselProperties,
            hasInfractionSuspicion: !!nextVesselReportings?.some(reportingType =>
              reportingIsAnInfractionSuspicion(reportingType)
            ),
            reportings: nextVesselReportings ?? []
          }
        }

        vesselsAdapter.setOne(state.vessels, nextVessel)
      }

      if (
        state.selectedVesselIdentity &&
        Vessel.getVesselFeatureId(state.selectedVesselIdentity) === action.payload.vesselFeatureId
      ) {
        let reportings: ReportingType[] = []

        if (state.selectedVessel?.reportings?.length) {
          reportings = state.selectedVessel.reportings
        }

        const nextVesselReportings = reportings.concat(action.payload.reportingType)

        state.selectedVessel = {
          ...(state.selectedVessel as VesselTypes.AugmentedSelectedVessel),
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
     *
     * @param {Object} state
     * @param {{payload: {
     *   vesselCompositeIdentifier: string,
     *   showedVesselTrack: ShowedVesselTrack
     *  }}} action - the vessel positions to show on map
     */
    addVesselTrackShowed(state, action) {
      state.vesselsTracksShowed[action.payload.vesselCompositeIdentifier] = action.payload.showedVesselTrack
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
     *
     * @param {Object} state
     * @param {{payload: VesselPosition | null}} action - The position
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
        vesselFeatureId: VesselFeatureId
      }>
    ) {
      const vessel = vesselsAdapter.getSelectors().selectById(state.vessels, action.payload.vesselFeatureId)

      if (vessel) {
        const filteredAlerts = vessel?.vesselProperties?.alerts?.filter(alert => alert !== action.payload.alertType)

        if (action.payload.isValidated) {
          const addedReportings = vessel.vesselProperties.reportings?.concat(ReportingTypeCharacteristics.ALERT.code)

          const nextVessel = {
            ...vessel,
            vesselProperties: {
              ...vessel.vesselProperties,
              alerts: filteredAlerts,
              hasAlert: !!filteredAlerts?.length,
              hasInfractionSuspicion: addedReportings.some(reportingType =>
                reportingIsAnInfractionSuspicion(reportingType)
              ),
              reportings: addedReportings
            }
          }

          vesselsAdapter.setOne(state.vessels, nextVessel)
        } else {
          const nextVessel = {
            ...vessel,
            vesselProperties: {
              ...vessel.vesselProperties,
              alerts: filteredAlerts,
              hasAlert: !!filteredAlerts?.length
            }
          }

          vesselsAdapter.setOne(state.vessels, nextVessel)
        }
      }

      if (state.selectedVessel) {
        const filteredAlerts = state.selectedVessel.alerts?.filter(alert => alert !== action.payload.alertType) ?? []

        let reportingsWithAlert: ReportingType[] = []
        if (state.selectedVessel.reportings?.length) {
          reportingsWithAlert = state.selectedVessel.reportings
        }
        reportingsWithAlert = reportingsWithAlert.concat([ReportingType.ALERT])
        state.selectedVessel = {
          ...(state.selectedVessel as VesselTypes.AugmentedSelectedVessel),
          alerts: filteredAlerts,
          hasAlert: !!filteredAlerts?.length,
          hasInfractionSuspicion: reportingsWithAlert.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType)
          ),
          reportings: reportingsWithAlert
        }
      }
    },

    /**
     * Remove the reporting from vessels array before the /vessels API is fetched from the cron
     */
    removeVesselReporting(
      state,
      action: PayloadAction<{
        reportingType: string
        vesselFeatureId: VesselFeatureId
      }>
    ) {
      const vessel = vesselsAdapter.getSelectors().selectById(state.vessels, action.payload.vesselFeatureId)
      if (vessel) {
        const vesselReportingWithoutFirstFoundReportingType = vessel.vesselProperties.reportings?.reduce(
          filterFirstFoundReportingType(action.payload.reportingType),
          []
        )

        const nextVessel = {
          ...vessel,
          vesselProperties: {
            ...vessel.vesselProperties,
            hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingType.some(reportingType =>
              reportingIsAnInfractionSuspicion(reportingType)
            ),
            reportings: vesselReportingWithoutFirstFoundReportingType
          }
        }

        vesselsAdapter.setOne(state.vessels, nextVessel)
      }

      if (
        state.selectedVessel &&
        Vessel.getVesselFeatureId(state.selectedVesselIdentity) === action.payload.vesselFeatureId
      ) {
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
     *     vesselFeatureId: string
     *   }[]
     * }} action - the reportings to remove
     */
    removeVesselReportings(state, action) {
      const vesselsFeatureIds = action.payload.map(reporting => reporting.vesselFeatureId)
      const vessels = vesselsAdapter.getSelectors().selectAll(state.vessels)

      vesselsAdapter.setMany(
        state.vessels,
        vessels.map(vessel => {
          if (!vesselsFeatureIds.find(vesselFeatureId => vessel.vesselFeatureId === vesselFeatureId)) {
            return vessel
          }

          const vesselReportingsToRemove = action.payload.filter(
            reporting => vessel.vesselFeatureId === reporting.vesselFeatureId
          )
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
      )

      if (!state.selectedVesselIdentity) {
        return
      }

      const selectedVesselFeatureId = Vessel.getVesselFeatureId(state.selectedVesselIdentity)
      if (
        state.selectedVessel &&
        vesselsFeatureIds.find(vesselFeatureId => selectedVesselFeatureId === vesselFeatureId)
      ) {
        const vesselReportingsToRemove = action.payload.filter(
          reporting => selectedVesselFeatureId === reporting.vesselFeatureId
        )
        const vesselReportingWithoutFirstFoundReportingTypes = filterFirstFoundReportingTypes(
          state.selectedVessel.reportings || [],
          vesselReportingsToRemove
        )

        state.selectedVessel = {
          ...(state.selectedVessel as VesselTypes.AugmentedSelectedVessel),
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
     *
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

    setAllVesselsAsUnfiltered(state) {
      const vessels = vesselsAdapter.getSelectors().selectAll(state.vessels)
      const vesselIds = vesselsAdapter.getSelectors().selectIds(state.vessels)

      // Check if any vessel has `isFiltered` set to true
      if (!vessels.some(vessel => vessel.isFiltered)) {
        return
      }

      // Update all vessels' `isFiltered` field to 0
      vesselsAdapter.updateMany(
        state.vessels,
        vesselIds.map(vesselId => ({
          changes: {
            isFiltered: 0
          },
          id: vesselId
        }))
      )
    },

    setFilteredVesselsFeatures(state, action: PayloadAction<VesselFeatureId>) {
      const filteredVesselsFeaturesUids = action.payload
      const vesselIds = vesselsAdapter.getSelectors().selectIds(state.vessels)

      // Update only the vessels that match the filtered IDs
      vesselsAdapter.updateMany(
        state.vessels,
        vesselIds.map(vesselId => ({
          changes: {
            isFiltered: filteredVesselsFeaturesUids.includes(vesselId) ? 1 : 0
          },
          id: vesselId
        }))
      )
    },

    /**
     * Show or hide other vessels (than the selected vessel)
     * @function setHideNonSelectedVessels
     *
     * @param {Object} state
     * @param {{payload: boolean}} action - hide (true) or show (false)
     */
    setHideNonSelectedVessels(state, action) {
      state.hideNonSelectedVessels = action.payload
    },

    setIsFocusedOnVesselSearch(state, action) {
      state.isFocusedOnVesselSearch = action.payload
    },

    /**
     * Set  previewed vessel features
     * @function setPreviewFilteredVesselsFeatures
     * @param {Object} state
     * @param {{payload: string[]}} action - the previewed vessel features uids
     */
    setPreviewFilteredVesselsFeatures(state, action) {
      const previewFilteredVesselsFeaturesUids = action.payload
      const vesselIds = vesselsAdapter.getSelectors().selectIds(state.vessels)

      // Update only the vessels that match the filtered IDs
      vesselsAdapter.updateMany(
        state.vessels,
        vesselIds.map(vesselId => ({
          changes: {
            filterPreview: previewFilteredVesselsFeaturesUids.indexOf(vesselId) !== NOT_FOUND ? 1 : 0
          },
          id: vesselId
        }))
      )
    },

    /**
     * Set the selected vessel and positions
     */
    setSelectedVessel(
      state,
      action: PayloadAction<{
        positions: VesselPosition[]
        vessel: VesselTypes.SelectedVessel
      }>
    ) {
      state.loadingVessel = null
      state.loadingPositions = null
      state.selectedVessel = action.payload.vessel
      state.selectedVesselIdentity = getOnlyVesselIdentityProperties(action.payload.vessel)
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
     * @param {{payload: TrackRequest}} action - The track request
     */
    setSelectedVesselCustomTrackRequest(state, action) {
      state.selectedVesselTrackRequest = action.payload
    },

    setVessels(state, action: PayloadAction<VesselEnhancedLastPositionWebGLObject[]>) {
      if (!action.payload || !Array.isArray(action.payload)) {
        return
      }

      vesselsAdapter.setMany(state.vessels, action.payload)
    },

    setVesselsEstimatedPositions(state, action) {
      state.vesselsEstimatedPositions = action.payload
    },

    setVesselsSpeciesAndDistricts(state, action) {
      state.uniqueVesselsSpecies = action.payload.species
      state.uniqueVesselsDistricts = action.payload.districts
    },

    /**
     * Set the vessel track features extent - used to fit the extent into the OpenLayers view
     * @function setVesselTrackExtent
     *
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
     *
     * @param {Object} state
     * @param {{payload: VesselPosition[]}} action - The positions
     */
    updateSelectedVesselPositions(state, action) {
      state.loadingPositions = null
      state.selectedVesselPositions = action.payload
    },

    /**
     * Remove the vessel track to the list
     * @function updateVesselTrackAsHidden
     *
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
     */
    updateVesselTrackAsShowedWithExtend(
      state,
      action: PayloadAction<{
        extent: number[]
        vesselCompositeIdentifier: string
      }>
    ) {
      const { extent, vesselCompositeIdentifier } = action.payload

      const isFound = !!state.vesselsTracksShowed[vesselCompositeIdentifier]
      if (isFound) {
        state.vesselsTracksShowed[vesselCompositeIdentifier]!.toShow = false
        state.vesselsTracksShowed[vesselCompositeIdentifier]!.extent = extent
      }
    },

    /**
     * Update a given vessel track as to be hidden by the layer
     * @function updateVesselTrackAsShowed
     * @param {Object} state
     * @param {{payload: string}} action - the vessel id
     */
    updateVesselTrackAsToHide(state, action: PayloadAction<string>) {
      if (state.vesselsTracksShowed[action.payload]) {
        state.vesselsTracksShowed[action.payload]!.toHide = true
      }
    },

    /**
     * Update a given vessel track as zoomed
     * @function updateVesselTrackAsZoomed
     *
     * @param {Object} state
     * @param {{payload: string}} action - the vessel Composite Identifier
     */
    updateVesselTrackAsZoomed(state, action) {
      if (state.vesselsTracksShowed[action.payload]) {
        state.vesselsTracksShowed[action.payload]!.toZoom = false
      }
    },

    updatingVesselTrackDepth(state) {
      state.loadingPositions = true
    }
  }
})

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
  setAllVesselsAsUnfiltered,
  setFilteredVesselsFeatures,
  setHideNonSelectedVessels,
  setIsFocusedOnVesselSearch,
  setPreviewFilteredVesselsFeatures,
  setSelectedVessel,
  setSelectedVesselCustomTrackRequest,
  setVessels,
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
