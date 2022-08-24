import { createSlice } from '@reduxjs/toolkit'

import { getEffectiveDateTimeFromMessage, getLogbookMessageType } from '../entities/logbook'
import { FishingActivitiesTab } from '../entities/vessel'

/* eslint-disable */
/** @namespace FishingActivitiesReducer */
const FishingActivitiesReducer = null
/* eslint-enable */

const fishingActivitiesSlice = createSlice({
  initialState: {
    /** @type {FishingActivities} fishingActivities */
    fishingActivities: {
      alerts: [],
      logbookMessages: [],
    },

    fishingActivitiesAreShowedOnMap: false,

    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    fishingActivitiesShowedOnMap: [],

    fishingActivitiesTab: FishingActivitiesTab.SUMMARY,

    isFirstVoyage: null,

    isLastVoyage: null,

    /** @type {FishingActivities} lastFishingActivities */
    lastFishingActivities: {
      alerts: [],
      logbookMessages: [],
    },

    loadingFishingActivities: false,

    /** @type {FishingActivities | null} nextFishingActivities */
    nextFishingActivities: null,
    redrawFishingActivitiesOnMap: false,
    tripNumber: null,
  },
  name: 'fishingActivities',
  reducers: {
    /**
     * Hide a single fishing activity showed on the vessel track
     * @function hideFishingActivityOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The fishing activity id to hide
     */
    removeFishingActivityFromMap(state, action) {
      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.filter(
        showed => showed.id !== action.payload,
      )
    },

    /**
     * Remove fishing activities from the map
     * @function showFishingActivitiesOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     */
removeFishingActivitiesFromMap(state) {
      state.fishingActivitiesShowedOnMap = []
    },

    
    
resetNextFishingActivities(state) {
      state.nextFishingActivities = null
    },

    /**
     * Show the specified fishing activities tab (Resume or All messages)
     * @function setFishingActivitiesTab
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: number}} action - The tab
     */
    setFishingActivitiesTab(state, action) {
      state.fishingActivitiesTab = action.payload
    },

    
    /**
     * Hide fishing activities of the vessel track
     * @function showFishingActivitiesOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     */
hideFishingActivitiesOnMap(state) {
      state.fishingActivitiesAreShowedOnMap = false
      state.fishingActivitiesShowedOnMap = []
    },

    
    
/**
     * Set selected vessel last voyage - This voyage is saved to be able to compare it
     * with new last voyages we will receive from the CRON
     * @function setLastVoyage
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: VesselVoyage}} action - the vessel last voyage
     */
setLastVoyage(state, action) {
      state.lastFishingActivities = action.payload.logbookMessagesAndAlerts
      state.fishingActivities = action.payload.logbookMessagesAndAlerts
      state.isLastVoyage = action.payload.isLastVoyage
      state.isFirstVoyage = action.payload.isFirstVoyage
      state.tripNumber = action.payload.tripNumber
    },

    /**
     * Set selected vessel voyage
     * @function setVoyage
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: VesselVoyage}} action - the vessel voyage
     */
    setVoyage(state, action) {
      const { isFirstVoyage, isLastVoyage, logbookMessagesAndAlerts, tripNumber } = action.payload

      state.fishingActivities = logbookMessagesAndAlerts
      state.isLastVoyage = isLastVoyage
      state.isFirstVoyage = isFirstVoyage
      state.tripNumber = tripNumber
      state.loadingFishingActivities = false
    },

    /**
     * End redraw fishing activities on map
     * @function endRedrawFishingActivitiesOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     */
    endRedrawFishingActivitiesOnMap(state) {
      state.redrawFishingActivitiesOnMap = false
    },

    
    /**
     * Set the loading of fishing activities to true, and shows a loader in the fishing activities tab
     * @function loadFishingActivities
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     */
loadFishingActivities(state) {
      state.loadingFishingActivities = true
    },

    
    /**
     * Set selected next vessel fishing activities to propose an update of the current displayed fishing activities
     * @function setNextFishingActivities
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: FishingActivities}} action - the fishing activities with new messages
     */
setNextFishingActivities(state, action) {
      state.nextFishingActivities = action.payload
    },

    
    /**
     * Show fishing activities on the vessel track, on the map
     * Without the corrected messages
     * @function showFishingActivitiesOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: boolean}} action - To force a redraw
     */
showFishingActivitiesOnMap(state, action) {
      state.fishingActivitiesAreShowedOnMap = true
      state.fishingActivitiesShowedOnMap = state.fishingActivities.logbookMessages
        .filter(fishingActivity => !fishingActivity.isCorrected)
        .map(fishingActivity => ({
          date: getEffectiveDateTimeFromMessage(fishingActivity),
          id: fishingActivity.operationNumber,
          isDeleted: fishingActivity.deleted,
          isNotAcknowledged: !fishingActivity.acknowledge?.isSuccess,
          name: getLogbookMessageType(fishingActivity),
        }))

      if (action.payload) {
        state.redrawFishingActivitiesOnMap = true
      }
    },

    
    /**
     * Show a single fishing activity on the vessel track, on the map
     * @function showFishingActivityOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The fishing activity id to show
     */
showFishingActivityOnMap(state, action) {
      const fishingActivityToShow = state.fishingActivities.logbookMessages.find(
        fishingActivity => fishingActivity.operationNumber === action.payload,
      )

      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.concat({
        date: getEffectiveDateTimeFromMessage(fishingActivityToShow),
        id: fishingActivityToShow.operationNumber,
        isDeleted: fishingActivityToShow.deleted,
        isNotAcknowledged: !fishingActivityToShow.acknowledge?.isSuccess,
        name: getLogbookMessageType(fishingActivityToShow),
      })
    },

    /**
     * Update coordinates of showed fishing activities
     * @function updateFishingActivitiesOnMapCoordinates
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: {
     *   id: string,
     *   coordinates: string[]
     * }[]}} action - The fishing activities to update
     */
    updateFishingActivitiesOnMapCoordinates(state, action) {
      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.map(fishingActivity => {
        const fishingActivityWithCoordinates = action.payload.find(
          fishingActivityToUpdate => fishingActivityToUpdate.id === fishingActivity.id,
        )

        if (fishingActivityWithCoordinates) {
          return { ...fishingActivity, coordinates: fishingActivityWithCoordinates.coordinates }
        }

        return fishingActivity
      })
    },
  },
})

export const {
  endRedrawFishingActivitiesOnMap,
  hideFishingActivitiesOnMap,
  loadFishingActivities,
  loadingFisheriesActivities,
  navigateToFishingActivity,
  removeFishingActivitiesFromMap,
  removeFishingActivityFromMap,
  resetNextFishingActivities,
  setFishingActivitiesTab,
  setLastFishingActivities,
  setLastVoyage,
  setNextFishingActivities,
  setVoyage,
  showFishingActivitiesOnMap,
  showFishingActivityOnMap,
  updateFishingActivitiesOnMapCoordinates,
} = fishingActivitiesSlice.actions

export default fishingActivitiesSlice.reducer
