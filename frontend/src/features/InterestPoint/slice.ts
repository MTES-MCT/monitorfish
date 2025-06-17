import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'

import type { InterestPoint } from '@features/InterestPoint/types'

const interestPointsLocalStorageKey = 'interestPoints'

export const interestPointAdapter = createEntityAdapter({
  selectId: (interestPoint: InterestPoint) => interestPoint.id,
  sortComparer: false
})

export type InterestPointState = {
  interestPointIdEdited: string | undefined
  interestPoints: EntityState<InterestPoint, string>
  isCreation: boolean
  isEdition: boolean
}
export const INITIAL_STATE: InterestPointState = {
  interestPointIdEdited: undefined,
  /**
   * Used to migrate interestPoints points from manual localstorage to redux-persist.
   * If the key `mainPersistorInterestPoint` exist, stop initiating interestPoints.
   *
   * TODO To be removed after all users have run the app.
   * Keep only `interestPointAdapter.getInitialState()`.
   */
  interestPoints: window.localStorage.getItem('persist:mainPersistorInterestPoint')
    ? interestPointAdapter.getInitialState()
    : interestPointAdapter.addMany(
        interestPointAdapter.getInitialState({
          error: null,
          status: 'idle'
        }),
        getLocalStorageState<any>([], interestPointsLocalStorageKey).map(interestPoint => {
          interestPoint.feature.properties = {
            name: interestPoint.name,
            observations: interestPoint.observations,
            type: interestPoint.type
          }
          interestPoint.feature.id = interestPoint.uuid

          return interestPoint.feature
        })
      ),
  isCreation: false,
  isEdition: false
}

const interestPointSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'interestPoint',
  reducers: {
    /**
     * Start drawing an interest point with a clickable map
     */
    interestPointCreation(state, action: PayloadAction<InterestPoint>) {
      interestPointAdapter.addOne(state.interestPoints, action.payload)
      state.interestPointIdEdited = action.payload.id
      state.isCreation = true
      state.isEdition = false
    },

    /**
     * Edit an existing interest point ID
     */
    interestPointEdited(state, action: PayloadAction<string>) {
      state.interestPointIdEdited = action.payload
      state.isEdition = true
    },

    /**
     * End drawing or editing
     */
    interestPointEditionEnded(state) {
      state.interestPointIdEdited = undefined
      state.isCreation = false
      state.isEdition = false
    },

    /**
     * Delete an existing interest point
     */
    interestPointRemoved(state, action: PayloadAction<string>) {
      interestPointAdapter.removeOne(state.interestPoints, action.payload)
    },

    interestPointUpdated(state, action: PayloadAction<InterestPoint>) {
      interestPointAdapter.updateOne(state.interestPoints, {
        changes: action.payload,
        id: action.payload.id
      })
    }
  }
})

export const interestPointActions = interestPointSlice.actions
export const interestPointReducer = interestPointSlice.reducer
export const interestPointSelectors = interestPointAdapter.getSelectors()
