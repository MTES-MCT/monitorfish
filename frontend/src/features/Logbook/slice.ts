import { FishingActivitiesTab } from '@features/Vessel/types/vessel'
import { createSlice } from '@reduxjs/toolkit'

import type { Logbook } from './Logbook.types'
import type { DisplayedLogbookOverlay } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { PayloadAction } from '@reduxjs/toolkit'

// TODO Properly type this redux state.
export type LogbookState = {
  areFishingActivitiesShowedOnMap: boolean
  displayedLogbookOverlays: DisplayedLogbookOverlay[]
  fishingActivities: Logbook.FishingActivities | undefined
  fishingActivitiesTab: FishingActivitiesTab
  isFirstVoyage: boolean | null
  isLastVoyage: boolean | null
  lastFishingActivities: Logbook.FishingActivities
  loadingFishingActivities: boolean
  nextFishingActivities: Logbook.FishingActivities | null
  tripNumber: string | null
  vesselIdentity: Vessel.VesselIdentity | undefined
}
const INITIAL_STATE: LogbookState = {
  areFishingActivitiesShowedOnMap: true,
  displayedLogbookOverlays: [],
  fishingActivities: undefined,
  fishingActivitiesTab: FishingActivitiesTab.SUMMARY,
  isFirstVoyage: null,
  isLastVoyage: null,
  lastFishingActivities: {
    alerts: [],
    logbookMessages: []
  },
  loadingFishingActivities: false,
  nextFishingActivities: null,
  tripNumber: null,
  vesselIdentity: undefined
}

const logbookSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'fishingActivities',
  reducers: {
    /**
     * Show a single fishing activity on the vessel track, on the map
     */
    displayLogbookOverlay(state, action) {
      state.displayedLogbookOverlays = state.displayedLogbookOverlays.concat(action.payload as DisplayedLogbookOverlay)
    },

    /**
     * Show fishing activities on the vessel track, on the map
     * Without the corrected messages
     */
    displayLogbookOverlays(state, action) {
      state.displayedLogbookOverlays = action.payload
    },

    hideAllLogbookOverlays(state) {
      state.areFishingActivitiesShowedOnMap = false
      state.displayedLogbookOverlays = []
    },

    hideLogbookOverlay(state, action) {
      state.displayedLogbookOverlays = state.displayedLogbookOverlays.filter(showed => showed.id !== action.payload)
    },

    /**
     * Reset vessel fishing activities
     */
    reset(state) {
      state.displayedLogbookOverlays = []
      state.fishingActivities = undefined
      state.vesselIdentity = undefined
      state.nextFishingActivities = null
    },

    resetIsLoading(state) {
      state.loadingFishingActivities = false
    },

    resetNextUpdate(state) {
      state.nextFishingActivities = null
    },

    setAreFishingActivitiesShowedOnMap(state, action) {
      state.areFishingActivitiesShowedOnMap = action.payload
    },

    setFishingActivities(state, action: PayloadAction<Logbook.FishingActivities>) {
      state.fishingActivities = action.payload
      state.loadingFishingActivities = false
    },

    setIsLoading(state) {
      state.loadingFishingActivities = true
    },

    /**
     * Set selected vessel last voyage - This voyage is saved to be able to compare it
     * with new last voyages we will receive from the CRON
     */
    setLastVoyage(state, action: PayloadAction<Logbook.VesselVoyage>) {
      state.lastFishingActivities = action.payload.logbookMessagesAndAlerts
      state.fishingActivities = action.payload.logbookMessagesAndAlerts
      state.isLastVoyage = action.payload.isLastVoyage
      state.isFirstVoyage = action.payload.isFirstVoyage
      state.tripNumber = action.payload.tripNumber
      state.vesselIdentity = action.payload.vesselIdentity
      state.loadingFishingActivities = false
    },

    /**
     * Set selected next vessel fishing activities to propose an update of the current displayed fishing activities
     * @param {Object=} state
     * @param {{payload: FishingActivities}} action - the fishing activities with new messages
     */
    setNextUpdate(state, action) {
      state.nextFishingActivities = action.payload
    },

    /**
     * Show the specified fishing activities tab (Resume or All messages)
     * @param {Object=} state
     * @param {{payload: number}} action - The tab
     */
    setTab(state, action) {
      state.fishingActivitiesTab = action.payload
    },

    /**
     * Set selected vessel voyage
     */
    setVoyage(state, action: PayloadAction<Logbook.VesselVoyage>) {
      const { isFirstVoyage, isLastVoyage, logbookMessagesAndAlerts, tripNumber, vesselIdentity } = action.payload

      state.fishingActivities = logbookMessagesAndAlerts
      state.isLastVoyage = isLastVoyage
      state.isFirstVoyage = isFirstVoyage
      state.tripNumber = tripNumber
      state.loadingFishingActivities = false
      state.vesselIdentity = vesselIdentity
    }
  }
})

export const logbookReducer = logbookSlice.reducer

export const logbookActions = logbookSlice.actions
