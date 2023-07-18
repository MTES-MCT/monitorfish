import { createSlice } from '@reduxjs/toolkit'

import { getEffectiveDateTimeFromMessage, getLogbookMessageType } from '../entities/logbook'
import { FishingActivitiesTab } from '../entities/vessel/vessel'

import type { FishingActivityShowedOnMap, VesselIdentity } from '../entities/vessel/types'
import type { FishingActivities, VesselVoyage } from '../types/fishingActivities'
import type { PayloadAction } from '@reduxjs/toolkit'

// TODO Properly type this redux state.
export type FishingActivitiesState = {
  areFishingActivitiesShowedOnMap: boolean
  fishingActivities: FishingActivities | undefined
  fishingActivitiesShowedOnMap: FishingActivityShowedOnMap[]
  fishingActivitiesTab: FishingActivitiesTab
  isFirstVoyage: any | null
  isLastVoyage: any | null
  lastFishingActivities: FishingActivities
  loadingFishingActivities: boolean
  nextFishingActivities: FishingActivities | null
  redrawFishingActivitiesOnMap: boolean
  tripNumber: number | null
  vesselIdentity: VesselIdentity | undefined
}
const INITIAL_STATE: FishingActivitiesState = {
  areFishingActivitiesShowedOnMap: false,
  fishingActivities: undefined,
  fishingActivitiesShowedOnMap: [],
  fishingActivitiesTab: FishingActivitiesTab.SUMMARY,
  isFirstVoyage: null,
  isLastVoyage: null,
  lastFishingActivities: {
    alerts: [],
    logbookMessages: []
  },
  loadingFishingActivities: false,
  nextFishingActivities: null,
  redrawFishingActivitiesOnMap: false,
  tripNumber: null,
  vesselIdentity: undefined
}

const fishingActivitiesSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'fishingActivities',
  reducers: {
    /**
     * Close vessel fishing activities
     */
    closeFishingActivities(state) {
      state.areFishingActivitiesShowedOnMap = false
      state.fishingActivitiesShowedOnMap = []
      state.fishingActivities = undefined
      state.loadingFishingActivities = false
      state.vesselIdentity = undefined
    },

    /**
     * End redraw fishing activities on map
     * @param {Object=} state
     */
    endRedrawFishingActivitiesOnMap(state) {
      state.redrawFishingActivitiesOnMap = false
    },

    /**
     * Hide fishing activities of the vessel track
     * @param {Object=} state
     */
    hideFishingActivitiesOnMap(state) {
      state.areFishingActivitiesShowedOnMap = false
      state.fishingActivitiesShowedOnMap = []
    },

    /**
     * Set the loading of fishing activities to true, and shows a loader in the fishing activities tab
     * @param {Object=} state
     */
    loadFishingActivities(state) {
      state.loadingFishingActivities = true
    },

    /**
     * Remove fishing activities from the map
     * @param {Object=} state
     */
    removeFishingActivitiesFromMap(state) {
      state.fishingActivitiesShowedOnMap = []
    },

    /**
     * Hide a single fishing activity showed on the vessel track
     * @param {Object=} state
     * @param {{payload: string}} action - The fishing activity id to hide
     */
    removeFishingActivityFromMap(state, action) {
      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.filter(
        showed => showed.id !== action.payload
      )
    },

    /**
     * Reset vessel fishing activities
     */
    resetFishingActivities(state, action: PayloadAction<VesselIdentity>) {
      state.areFishingActivitiesShowedOnMap = false
      state.fishingActivitiesShowedOnMap = []
      state.fishingActivities = undefined
      state.loadingFishingActivities = false
      state.vesselIdentity = action.payload
      state.nextFishingActivities = null
    },

    /**
     * Reset the loading of fishing activities
     * @param {Object=} state
     */
    resetLoadFishingActivities(state) {
      state.loadingFishingActivities = false
    },

    resetNextFishingActivities(state) {
      state.nextFishingActivities = null
    },

    /**
     * Show the specified fishing activities tab (Resume or All messages)
     * @param {Object=} state
     * @param {{payload: number}} action - The tab
     */
    setFishingActivitiesTab(state, action) {
      state.fishingActivitiesTab = action.payload
    },

    /**
     * Set selected vessel last voyage - This voyage is saved to be able to compare it
     * with new last voyages we will receive from the CRON
     */
    setLastVoyage(state, action: PayloadAction<VesselVoyage>) {
      state.lastFishingActivities = action.payload.logbookMessagesAndAlerts
      state.fishingActivities = action.payload.logbookMessagesAndAlerts
      state.isLastVoyage = action.payload.isLastVoyage
      state.isFirstVoyage = action.payload.isFirstVoyage
      state.tripNumber = action.payload.tripNumber
      state.vesselIdentity = action.payload.vesselIdentity
    },

    /**
     * Set selected next vessel fishing activities to propose an update of the current displayed fishing activities
     * @param {Object=} state
     * @param {{payload: FishingActivities}} action - the fishing activities with new messages
     */
    setNextFishingActivities(state, action) {
      state.nextFishingActivities = action.payload
    },

    /**
     * Set selected vessel voyage
     */
    setVoyage(state, action: PayloadAction<VesselVoyage>) {
      const { isFirstVoyage, isLastVoyage, logbookMessagesAndAlerts, tripNumber, vesselIdentity } = action.payload

      state.fishingActivities = logbookMessagesAndAlerts
      state.isLastVoyage = isLastVoyage
      state.isFirstVoyage = isFirstVoyage
      state.tripNumber = tripNumber
      state.loadingFishingActivities = false
      state.vesselIdentity = vesselIdentity
    },

    /**
     * Show fishing activities on the vessel track, on the map
     * Without the corrected messages
     */
    showFishingActivitiesOnMap(state) {
      state.areFishingActivitiesShowedOnMap = true
      // TODO There is a typing issue that may reveal a code issue here.

      if (!state.fishingActivities) {
        return
      }

      state.fishingActivitiesShowedOnMap = state.fishingActivities.logbookMessages
        .filter(fishingActivity => !fishingActivity.isCorrected)
        .map(fishingActivity => ({
          date: getEffectiveDateTimeFromMessage(fishingActivity),
          id: fishingActivity.operationNumber,
          isDeleted: fishingActivity.deleted,
          isNotAcknowledged: !fishingActivity.acknowledge?.isSuccess,
          name: getLogbookMessageType(fishingActivity)
        })) as any

      state.redrawFishingActivitiesOnMap = true
    },

    /**
     * Show a single fishing activity on the vessel track, on the map
     */
    showFishingActivityOnMap(state, action) {
      if (!state.fishingActivities) {
        return
      }

      const fishingActivityToShow = state.fishingActivities.logbookMessages.find(
        fishingActivity => fishingActivity.operationNumber === action.payload
      )
      if (!fishingActivityToShow) {
        return
      }

      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.concat({
        // TODO This date is not a Date but a string.
        date: getEffectiveDateTimeFromMessage(fishingActivityToShow),
        id: fishingActivityToShow.operationNumber,
        isDeleted: fishingActivityToShow.deleted,
        isNotAcknowledged: !fishingActivityToShow.acknowledge?.isSuccess,
        name: getLogbookMessageType(fishingActivityToShow)
      })
    },

    /**
     * Update coordinates of showed fishing activities
     * @param {Object=} state
     * @param {{payload: {
     *   id: string,
     *   coordinates: string[]
     * }[]}} action - The fishing activities to update
     */
    updateFishingActivitiesOnMapCoordinates(state, action) {
      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.map(fishingActivity => {
        const fishingActivityWithCoordinates = action.payload.find(
          fishingActivityToUpdate => fishingActivityToUpdate.id === fishingActivity.id
        )

        if (fishingActivityWithCoordinates) {
          return { ...fishingActivity, coordinates: fishingActivityWithCoordinates.coordinates }
        }

        return fishingActivity
      })
    }
  }
})

export const {
  closeFishingActivities,
  endRedrawFishingActivitiesOnMap,
  hideFishingActivitiesOnMap,
  loadFishingActivities,
  removeFishingActivitiesFromMap,
  removeFishingActivityFromMap,
  resetFishingActivities,
  resetLoadFishingActivities,
  resetNextFishingActivities,
  setFishingActivitiesTab,
  setLastVoyage,
  setNextFishingActivities,
  setVoyage,
  showFishingActivitiesOnMap,
  showFishingActivityOnMap,
  updateFishingActivitiesOnMapCoordinates
} = fishingActivitiesSlice.actions

export const fishingActivitiesReducer = fishingActivitiesSlice.reducer
