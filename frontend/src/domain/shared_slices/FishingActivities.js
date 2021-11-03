/* eslint-disable */
import { FishingActivitiesTab } from '../entities/vessel'
import { createSlice } from '@reduxjs/toolkit'
import { getEffectiveDateTimeFromMessage } from '../entities/fishingActivities'

/** @namespace FishingActivitiesReducer */
const FishingActivitiesReducer = null
/* eslint-disable */

const fishingActivitiesSlice = createSlice({
  name: 'fishingActivities',
  initialState: {
    fishingActivitiesTab: FishingActivitiesTab.SUMMARY,
    /** @type {FishingActivities} fishingActivities */
    fishingActivities: {},
    /** @type {FishingActivities} lastFishingActivities */
    lastFishingActivities: {},
    isLastVoyage: null,
    isFirstVoyage: null,
    tripNumber: null,
    /** @type {FishingActivities | null} nextFishingActivities */
    nextFishingActivities: null,
    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    fishingActivitiesShowedOnMap: [],
    fishingActivitiesAreShowedOnMap: true,
    loadingFishingActivities: false
  },
  reducers: {
    /**
     * Set selected vessel voyage
     * @function setVoyage
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: VesselVoyage}} action - the vessel voyage
     */
    setVoyage (state, action) {
      const {
        ersMessagesAndAlerts,
        isLastVoyage,
        isFirstVoyage,
        tripNumber
      } = action.payload

      state.fishingActivities = ersMessagesAndAlerts
      state.isLastVoyage = isLastVoyage
      state.isFirstVoyage = isFirstVoyage
      state.tripNumber = tripNumber
      state.loadingFishingActivities = false
    },
    /**
     * Set selected vessel last voyage - This voyage is saved to be able to compare it
     * with new last voyages we will receive from the CRON
     * @function setLastVoyage
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: VesselVoyage}} action - the vessel last voyage
     */
    setLastVoyage (state, action) {
      state.lastFishingActivities = action.payload.ersMessagesAndAlerts
      state.fishingActivities = action.payload.ersMessagesAndAlerts
      state.isLastVoyage = action.payload.isLastVoyage
      state.isFirstVoyage = action.payload.isFirstVoyage
      state.tripNumber = action.payload.tripNumber
    },
    /**
     * Set selected next vessel fishing activities to propose an update of the current displayed fishing activities
     * @function setNextFishingActivities
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: FishingActivities}} action - the fishing activities with new messages
     */
    setNextFishingActivities (state, action) {
      state.nextFishingActivities = action.payload
    },
    resetNextFishingActivities (state) {
      state.nextFishingActivities = null
    },
    /**
     * Show the specified fishing activities tab (Resume or All messages)
     * @function setFishingActivitiesTab
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: number}} action - The tab
     */
    setFishingActivitiesTab (state, action) {
      state.fishingActivitiesTab = action.payload
    },
    /**
     * Show a single fishing activity on the vessel track, on the map
     * @function showFishingActivityOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The fishing activity id to show
     */
    showFishingActivityOnMap (state, action) {
      const fishingActivityToShow = state.fishingActivities.ersMessages
        .find(fishingActivity => fishingActivity.operationNumber === action.payload)

      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.concat({
        id: fishingActivityToShow.operationNumber,
        date: getEffectiveDateTimeFromMessage(fishingActivityToShow),
        name: fishingActivityToShow.messageType,
        isDeleted: fishingActivityToShow.deleted,
        isNotAcknowledged: !fishingActivityToShow.acknowledge?.isSuccess
      })
    },
    /**
     * Hide a single fishing activity showed on the vessel track
     * @function hideFishingActivityOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The fishing activity id to hide
     */
    removeFishingActivityFromMap (state, action) {
      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.filter(showed => showed.id !== action.payload)
    },
    /**
     * Show fishing activities on the vessel track, on the map
     * Without the corrected messages
     * @function showFishingActivitiesOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     */
    showFishingActivitiesOnMap (state) {
      state.fishingActivitiesAreShowedOnMap = true
      state.fishingActivitiesShowedOnMap = state.fishingActivities.ersMessages
        .filter(fishingActivity => !fishingActivity.isCorrected)
        .map(fishingActivity => ({
          id: fishingActivity.operationNumber,
          date: getEffectiveDateTimeFromMessage(fishingActivity),
          name: fishingActivity.messageType,
          isDeleted: fishingActivity.deleted,
          isNotAcknowledged: !fishingActivity.acknowledge?.isSuccess
        }))
    },
    /**
     * Remove fishing activities from the map
     * @function showFishingActivitiesOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     */
    removeFishingActivitiesFromMap (state) {
      state.fishingActivitiesShowedOnMap = []
    },
    /**
     * Hide fishing activities of the vessel track
     * @function showFishingActivitiesOnMap
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     */
    hideFishingActivitiesOnMap (state) {
      state.fishingActivitiesAreShowedOnMap = false
      state.fishingActivitiesShowedOnMap = []
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
    updateFishingActivitiesOnMapCoordinates (state, action) {
      state.fishingActivitiesShowedOnMap = state.fishingActivitiesShowedOnMap.map(fishingActivity => {
        const fishingActivityWithCoordinates = action.payload
          .find(fishingActivityToUpdate => fishingActivityToUpdate.id === fishingActivity.id)

        if (fishingActivityWithCoordinates) {
          return { ...fishingActivity, coordinates: fishingActivityWithCoordinates.coordinates }
        }

        return fishingActivity
      })
    },
    /**
     * Set the loading of fishing activities to true, and shows a loader in the fishing activities tab
     * @function loadFishingActivities
     * @memberOf FishingActivitiesReducer
     * @param {Object=} state
     */
    loadFishingActivities (state) {
      state.loadingFishingActivities = true
    }
  }
})

export const {
  setVoyage,
  setLastVoyage,
  setLastFishingActivities,
  setNextFishingActivities,
  resetNextFishingActivities,
  loadingFisheriesActivities,
  setFishingActivitiesTab,
  showFishingActivityOnMap,
  removeFishingActivityFromMap,
  removeFishingActivitiesFromMap,
  showFishingActivitiesOnMap,
  hideFishingActivitiesOnMap,
  updateFishingActivitiesOnMapCoordinates,
  navigateToFishingActivity,
  loadFishingActivities
} = fishingActivitiesSlice.actions

export default fishingActivitiesSlice.reducer
