import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import { atLeastOneVesselSelected, VesselFeature, VesselSidebarTab } from '@features/Vessel/types/vessel'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from '@reduxjs/toolkit'

import { ReportingType, ReportingTypeCharacteristics } from '../Reporting/types'

import type { ShowedVesselTrack, TrackRequest } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

const NOT_FOUND = -1

export const vesselsAdapter = createEntityAdapter({
  selectId: (vessel: Vessel.VesselLastPosition) => vessel.vesselFeatureId,
  sortComparer: false
})

// TODO Properly type this redux state.
export type VesselState = {
  hideNonSelectedVessels: boolean
  highlightedVesselTrackPosition: Vessel.VesselPosition | null
  isFocusedOnVesselSearch: boolean
  loadingPositions: boolean | null
  loadingVessel: boolean | null
  selectedVessel: Vessel.AugmentedSelectedVessel | undefined
  selectedVesselIdentity: Vessel.VesselIdentity | undefined
  selectedVesselPositions: Vessel.VesselPosition[] | null
  selectedVesselSidebarTab: VesselSidebarTab
  selectedVesselTrackRequest: TrackRequest | null
  tripMessagesLastToFormerDEPDateTimes: any[]
  uniqueVesselsDistricts: any[]
  uniqueVesselsSpecies: any[]
  vesselSidebarIsOpen: boolean
  vesselTrackExtent: any | null
  vessels: EntityState<Vessel.VesselLastPosition, Vessel.VesselFeatureId>
  vesselsEstimatedPositions: any[]
  vesselsTracksShowed: Record<string, ShowedVesselTrack>
}
const INITIAL_STATE: VesselState = {
  hideNonSelectedVessels: false,
  highlightedVesselTrackPosition: null,
  isFocusedOnVesselSearch: false,
  loadingPositions: null,
  loadingVessel: null,
  selectedVessel: undefined,
  selectedVesselIdentity: undefined,
  selectedVesselPositions: null,
  selectedVesselSidebarTab: VesselSidebarTab.SUMMARY,
  selectedVesselTrackRequest: null,
  tripMessagesLastToFormerDEPDateTimes: [],
  uniqueVesselsDistricts: [],
  uniqueVesselsSpecies: [],
  vessels: vesselsAdapter.getInitialState(),
  vesselsEstimatedPositions: [],
  vesselSidebarIsOpen: false,
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
        vesselFeatureId: Vessel.VesselFeatureId
      }>
    ) {
      const vessel = vesselSelectors.selectById(state.vessels, action.payload.vesselFeatureId)

      if (vessel) {
        const nextVesselReportings = vessel?.reportings?.concat(action.payload.reportingType)
        const nextVessel = {
          ...vessel,
          hasInfractionSuspicion: !!nextVesselReportings?.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType)
          ),
          reportings: nextVesselReportings ?? []
        }

        vesselsAdapter.setOne(state.vessels, nextVessel)
      }

      if (
        state.selectedVesselIdentity &&
        VesselFeature.getVesselFeatureId(state.selectedVesselIdentity) === action.payload.vesselFeatureId
      ) {
        let reportings: ReportingType[] = []

        if (state.selectedVessel?.reportings?.length) {
          reportings = state.selectedVessel.reportings
        }

        const nextVesselReportings = reportings.concat(action.payload.reportingType)

        state.selectedVessel = {
          ...(state.selectedVessel as Vessel.AugmentedSelectedVessel),
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
     */
    addVesselTrackShowed(
      state,
      action: PayloadAction<{
        showedVesselTrack: ShowedVesselTrack
        vesselCompositeIdentifier: string
      }>
    ) {
      state.vesselsTracksShowed[action.payload.vesselCompositeIdentifier] = action.payload.showedVesselTrack
    },

    closeVesselSidebar(state) {
      state.vesselSidebarIsOpen = false
      state.selectedVessel = undefined
      state.selectedVesselIdentity = undefined
      state.selectedVesselTrackRequest = null
      state.isFocusedOnVesselSearch = false
      state.tripMessagesLastToFormerDEPDateTimes = []

      if (!atLeastOneVesselSelected(state.vesselsTracksShowed, state.selectedVesselIdentity)) {
        state.hideNonSelectedVessels = false
      }
    },

    /**
     * Highlight a vessel position on map from the vessel track positions table
     */
    highlightVesselTrackPosition(state, action: PayloadAction<Vessel.VesselPosition | null>) {
      state.highlightedVesselTrackPosition = action.payload
    },

    loadingVessel(state, action: PayloadAction<Vessel.VesselIdentity>) {
      state.selectedVesselIdentity = action.payload
      state.vesselSidebarIsOpen = true
      state.selectedVessel = undefined
      state.loadingVessel = true
      state.loadingPositions = true
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
        vesselFeatureId: Vessel.VesselFeatureId
      }>
    ) {
      const vessel = vesselSelectors.selectById(state.vessels, action.payload.vesselFeatureId)

      if (vessel) {
        const filteredAlerts = vessel?.alerts?.filter(alert => alert !== action.payload.alertType)

        if (action.payload.isValidated) {
          const addedReportings = vessel.reportings?.concat(ReportingTypeCharacteristics.ALERT.code)

          const nextVessel = {
            ...vessel,
            alerts: filteredAlerts,
            hasAlert: !!filteredAlerts?.length,
            hasInfractionSuspicion: addedReportings.some(reportingType =>
              reportingIsAnInfractionSuspicion(reportingType)
            ),
            reportings: addedReportings
          }

          vesselsAdapter.setOne(state.vessels, nextVessel)
        } else {
          const nextVessel = {
            ...vessel,
            alerts: filteredAlerts,
            hasAlert: !!filteredAlerts?.length
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
          ...(state.selectedVessel as Vessel.AugmentedSelectedVessel),
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
        vesselFeatureId: Vessel.VesselFeatureId
      }>
    ) {
      const vessel = vesselSelectors.selectById(state.vessels, action.payload.vesselFeatureId)
      if (vessel) {
        const vesselReportingWithoutFirstFoundReportingType =
          vessel.reportings?.reduce(filterFirstFoundReportingType(action.payload.reportingType), []) || []

        const nextVessel = {
          ...vessel,
          hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingType.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType)
          ),
          reportings: vesselReportingWithoutFirstFoundReportingType
        }

        vesselsAdapter.setOne(state.vessels, nextVessel)
      }

      if (
        state.selectedVessel &&
        VesselFeature.getVesselFeatureId(state.selectedVesselIdentity) === action.payload.vesselFeatureId
      ) {
        const vesselReportingWithoutFirstFoundReportingType =
          state.selectedVessel.reportings?.reduce(filterFirstFoundReportingType(action.payload.reportingType), []) || []

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
     * Remove multiple reportings from vessels array before the /vessels API is fetched from the cron
     */
    removeVesselReportings(
      state,
      action: PayloadAction<
        Array<{
          id: number
          type: string
          vesselFeatureId: string
        }>
      >
    ) {
      const vesselsFeatureIds = action.payload.map(reporting => reporting.vesselFeatureId)
      const vessels = vesselSelectors.selectAll(state.vessels)

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
            vessel.reportings,
            vesselReportingsToRemove
          )

          return {
            ...vessel,
            asInfractionSuspicion: vesselReportingWithoutFirstFoundReportingTypes.some(reportingType =>
              reportingIsAnInfractionSuspicion(reportingType)
            ),
            reportings: vesselReportingWithoutFirstFoundReportingTypes
          }
        })
      )

      if (!state.selectedVesselIdentity) {
        return
      }

      const selectedVesselFeatureId = VesselFeature.getVesselFeatureId(state.selectedVesselIdentity)
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
          ...(state.selectedVessel as Vessel.AugmentedSelectedVessel),
          hasInfractionSuspicion: vesselReportingWithoutFirstFoundReportingTypes.some(reportingType =>
            reportingIsAnInfractionSuspicion(reportingType)
          ),
          reportings: vesselReportingWithoutFirstFoundReportingTypes
        }
      }
    },

    resetLoadingVessel(state) {
      state.loadingVessel = false
      state.loadingPositions = false
    },

    resetSelectedVessel(state) {
      state.selectedVessel = undefined
      state.selectedVesselIdentity = undefined
      state.selectedVesselPositions = null
    },

    setAllVesselsAsUnfiltered(state) {
      const vessels = vesselSelectors.selectAll(state.vessels)
      const vesselIds = state.vessels.ids

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

    setFilteredVesselsFeatures(state, action: PayloadAction<Vessel.VesselFeatureId>) {
      const filteredVesselsFeaturesUids = action.payload
      const vesselIds = state.vessels.ids

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
     */
    setHideNonSelectedVessels(state, action: PayloadAction<boolean>) {
      state.hideNonSelectedVessels = action.payload
    },

    setIsFocusedOnVesselSearch(state, action) {
      state.isFocusedOnVesselSearch = action.payload
    },

    /**
     * Set  previewed vessel features
     */
    setPreviewFilteredVesselsFeatures(state, action: PayloadAction<string[]>) {
      const previewFilteredVesselsFeaturesUids = action.payload
      const vesselIds = state.vessels.ids

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
        positions: Vessel.VesselPosition[]
        vessel: Vessel.SelectedVessel
      }>
    ) {
      state.loadingVessel = null
      state.loadingPositions = null
      state.selectedVessel = action.payload.vessel
      state.selectedVesselIdentity = extractVesselIdentityProps(action.payload.vessel)
      state.selectedVesselPositions = action.payload.positions
    },

    /**
     * Set the custom track request of the selected vessel
     * The `afterDateTime` and `beforeDateTime` Dates objects are kept in the local timezone format.
     * Only the date part is used, as the time will be set as :
     *  afterDateTime: 00h00
     *  beforeDateTime: 23h59
     * When fetching the track from the API
     */
    setSelectedVesselCustomTrackRequest(state, action: PayloadAction<TrackRequest>) {
      state.selectedVesselTrackRequest = action.payload
    },

    setSelectedVesselSidebarTab(state, action: PayloadAction<VesselSidebarTab>) {
      state.selectedVesselSidebarTab = action.payload
    },

    setVessels(state, action: PayloadAction<Vessel.VesselLastPosition[]>) {
      if (!action.payload || !Array.isArray(action.payload)) {
        return
      }

      vesselsAdapter.setAll(state.vessels, action.payload)
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
     */
    setVesselTrackExtent(state, action: PayloadAction<number[]>) {
      state.vesselTrackExtent = action.payload
    },

    /**
     * Update the positions of the vessel
     */
    updateSelectedVesselPositions(state, action: PayloadAction<Vessel.VesselPosition[]>) {
      state.loadingPositions = null
      state.selectedVesselPositions = action.payload
    },

    /**
     * Remove the vessel track to the list
     */
    updateVesselTrackAsHidden(state, action: PayloadAction<string>) {
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
     */
    updateVesselTrackAsToHide(state, action: PayloadAction<string>) {
      if (state.vesselsTracksShowed[action.payload]) {
        state.vesselsTracksShowed[action.payload]!.toHide = true
      }
    },

    /**
     * Update a given vessel track as zoomed
     */
    updateVesselTrackAsZoomed(state, action: PayloadAction<string>) {
      if (state.vesselsTracksShowed[action.payload]) {
        state.vesselsTracksShowed[action.payload]!.toZoom = false
      }
    },

    updatingVesselTrackDepth(state) {
      state.loadingPositions = true
    }
  }
})

function filterFirstFoundReportingType(reportingType: string) {
  let reportingTypeHasBeenRemoved = false

  return (acc: ReportingType[], returnedReportingType: ReportingType) => {
    if (returnedReportingType === reportingType && !reportingTypeHasBeenRemoved) {
      reportingTypeHasBeenRemoved = true

      return acc
    }

    acc.push(returnedReportingType)

    return acc
  }
}

function filterFirstFoundReportingTypes(
  reportingTypes: ReportingType[],
  vesselReportingsToRemove: Array<{
    id: number
    type: string
    vesselFeatureId: string
  }>
): ReportingType[] {
  let vesselReportingWithoutFirstFoundReportingTypes = reportingTypes

  vesselReportingsToRemove.forEach(reportingToRemove => {
    vesselReportingWithoutFirstFoundReportingTypes = vesselReportingWithoutFirstFoundReportingTypes.reduce<
      ReportingType[]
    >(filterFirstFoundReportingType(reportingToRemove.type), [])
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
  resetLoadingVessel,
  resetSelectedVessel,
  setAllVesselsAsUnfiltered,
  setFilteredVesselsFeatures,
  setHideNonSelectedVessels,
  setIsFocusedOnVesselSearch,
  setPreviewFilteredVesselsFeatures,
  setSelectedVessel,
  setSelectedVesselCustomTrackRequest,
  setSelectedVesselSidebarTab,
  setVessels,
  setVesselsSpeciesAndDistricts,
  setVesselTrackExtent,
  updateSelectedVesselPositions,
  updateVesselTrackAsHidden,
  updateVesselTrackAsShowedWithExtend,
  updateVesselTrackAsToHide,
  updateVesselTrackAsZoomed,
  updatingVesselTrackDepth
} = vesselSlice.actions

export const vesselActions = vesselSlice.actions
export const vesselReducer = vesselSlice.reducer
export const vesselSelectors = vesselsAdapter.getSelectors()
