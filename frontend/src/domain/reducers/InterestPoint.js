/* eslint-disable */
/** @namespace InterestPointReducer */
const InterestPointReducer = null
/* eslint-disable */

import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'

const interestPointsLocalStorageKey = 'interestPoints'

const interestPointSlice = createSlice({
  name: 'interestPoint',
  initialState: {
    isDrawing: false,
    /** @type {InterestPoint | null} interestPointBeingDrawed */
    interestPointBeingDrawed: null,
    /** @type {InterestPoint[]} interestPoints */
    interestPoints: getLocalStorageState([], interestPointsLocalStorageKey)
  },
  reducers: {
    /**
     * Start drawing an interest point with a clickable map
     * @function drawInterestPoint
     * @memberOf InterestPointReducer
     * @param {Object=} state
     */
    drawInterestPoint (state) {
      state.isDrawing = true
    },
    /**
     * End drawing
     * @function endInterestPointDraw
     * @memberOf InterestPointReducer
     * @param {Object=} state
     */
    endInterestPointDraw (state) {
      state.isDrawing = false
    },
    /**
     * Add a new interest point
     * @function addInterestPoint
     * @memberOf InterestPointReducer
     * @param {Object=} state
     * @param {{
     * payload: InterestPoint
     * }} action - The interest point to add
     */
    addInterestPoint(state, action) {
      state.interestPoints = state.interestPoints.concat(action.payload)
      state.isDrawing = false
      window.localStorage.setItem(interestPointsLocalStorageKey, JSON.stringify(state.interestPoints))
    },
    /**
     * Delete an existing interest point
     * @function removeInterestPoint
     * @memberOf InterestPointReducer
     * @param {Object=} state
     * @param {{
     * payload: string
     * }} action - The UUID of the interest point
     */
    removeInterestPoint(state, action) {
      state.interestPoints = state.interestPoints.filter(interestPoint => interestPoint.uuid !== action.payload)
      window.localStorage.setItem(interestPointsLocalStorageKey, JSON.stringify(state.interestPoints))
    },
    /**
     * Update the interest point being drawed
     * @function updateInterestPointBeingDrawed
     * @memberOf InterestPointReducer
     * @param {Object=} state
     * @param {{
     * payload: InterestPoint | null
     * }} action - The interest point to add
     */
    updateInterestPointBeingDrawed(state, action) {
      state.interestPointBeingDrawed = action.payload
    },
    /**
     * Update the specified key of the interest point being drawed
     * @function updateInterestPointBeingDrawed
     * @memberOf InterestPointReducer
     * @param {Object=} state
     * @param {{
     * payload: {
     *   key: string
     *   value: any
     * }
     * }} action - The interest point to add
     */
    updateInterestPointKeyBeingDrawed(state, action) {
      const nextInterestPointBeingDrawed = {...state.interestPointBeingDrawed}
      nextInterestPointBeingDrawed[action.payload.key] = action.payload.value
      state.interestPointBeingDrawed = nextInterestPointBeingDrawed
    }
  }
})

export const {
  drawInterestPoint,
  endInterestPointDraw,
  addInterestPoint,
  removeInterestPoint,
  updateInterestPointBeingDrawed,
  updateInterestPointKeyBeingDrawed
} = interestPointSlice.actions

export default interestPointSlice.reducer
