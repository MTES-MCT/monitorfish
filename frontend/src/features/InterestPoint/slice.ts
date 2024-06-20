import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'

import type { InterestPoint } from '../../domain/types/interestPoint'

const interestPointsLocalStorageKey = 'interestPoints'

export type InterestPointState = {
  interestPointBeingDrawed: InterestPoint | null
  interestPoints: InterestPoint[]
  isDrawing: boolean
  isEditing: boolean
  // TODO This is a UUID (an id then?), rename it.
  triggerInterestPointFeatureDeletion: string | null
}
export const INITIAL_STATE: InterestPointState = {
  interestPointBeingDrawed: null,
  interestPoints: getLocalStorageState([], interestPointsLocalStorageKey),
  isDrawing: false,
  isEditing: false,
  triggerInterestPointFeatureDeletion: null
}

const interestPointSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'interestPoint',
  reducers: {
    /**
     * Add a new interest point
     * @function addInterestPoint
     * @memberOf InterestPointReducer
     * @param {Object=} state
     */
    addInterestPoint(state) {
      if (!state.isEditing && state.interestPointBeingDrawed) {
        state.interestPoints = state.interestPoints.concat(state.interestPointBeingDrawed)
      }
      state.isDrawing = false
      state.interestPointBeingDrawed = null
      window.localStorage.setItem(interestPointsLocalStorageKey, JSON.stringify(state.interestPoints))
    },

    /**
     * Delete the interest point being drawed and trigger the deletion of the interest point feature currently showed
     * @function deleteInterestPointBeingDrawed
     * @memberOf InterestPointReducer
     * @param {Object=} state
     */
    deleteInterestPointBeingDrawed(state) {
      if (state.interestPointBeingDrawed) {
        state.triggerInterestPointFeatureDeletion = state.interestPointBeingDrawed.uuid
      }
      state.interestPointBeingDrawed = null
    },

    /**
     * Start drawing an interest point with a clickable map
     * @function drawInterestPoint
     * @memberOf InterestPointReducer
     * @param {Object=} state
     */
    drawInterestPoint(state) {
      state.isDrawing = true
      state.isEditing = false
    },

    /**
     * Edit an existing interest point
     * @function editInterestPoint
     * @memberOf InterestPointReducer
     * @param {Object=} state
     * @param {{
     * payload: string
     * }} action - The UUID of the interest point
     */
    editInterestPoint(state, action) {
      const foundInterestedPoint = state.interestPoints.find(interestPoint => interestPoint.uuid === action.payload)
      if (!foundInterestedPoint) {
        return
      }

      state.interestPointBeingDrawed = foundInterestedPoint
      state.isEditing = true
    },

    /**
     * End drawing
     * @function endInterestPointDraw
     * @memberOf InterestPointReducer
     * @param {Object=} state
     */
    endInterestPointDraw(state) {
      state.isDrawing = false
      state.isEditing = false
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
      state.isEditing = false
      state.interestPointBeingDrawed = null
      window.localStorage.setItem(interestPointsLocalStorageKey, JSON.stringify(state.interestPoints))
    },

    /**
     * Reset the trigger of the interest point deletion feature currently showed
     * @function resetInterestPointFeatureDeletion
     * @memberOf InterestPointReducer
     * @param {Object=} state
     */
    resetInterestPointFeatureDeletion(state) {
      state.triggerInterestPointFeatureDeletion = null
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
      if (!state.interestPointBeingDrawed) {
        return
      }

      const currentInterestPointBeingDrawed = { ...state.interestPointBeingDrawed }
      const nextInterestPointBeingDrawed = { ...state.interestPointBeingDrawed }
      nextInterestPointBeingDrawed[action.payload.key] = action.payload.value
      state.interestPointBeingDrawed = nextInterestPointBeingDrawed

      if (state.isEditing) {
        state.interestPoints = state.interestPoints.map(interestPoint => {
          if (interestPoint.uuid === currentInterestPointBeingDrawed.uuid) {
            interestPoint[action.payload.key] = action.payload.value
          }

          return interestPoint
        })
      }
    }
  }
})

export const {
  addInterestPoint,
  deleteInterestPointBeingDrawed,
  drawInterestPoint,
  editInterestPoint,
  endInterestPointDraw,
  removeInterestPoint,
  resetInterestPointFeatureDeletion,
  updateInterestPointBeingDrawed,
  updateInterestPointKeyBeingDrawed
} = interestPointSlice.actions

export const interestPointReducer = interestPointSlice.reducer
