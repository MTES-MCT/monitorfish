import { createSlice } from '@reduxjs/toolkit'

import { dummyCustomZone } from './__tests__/__mocks__/dummyCustomZone'
import { getEnvironmentVariable } from '../../api/utils'

import type { CustomZone } from './types'
import type { PayloadAction } from '@reduxjs/toolkit'

const IS_CYPRESS_TEST = getEnvironmentVariable('REACT_APP_CYPRESS_TEST')

export type CustomZoneState = {
  zones: Record<string, CustomZone>
}
const INITIAL_STATE: CustomZoneState = {
  zones: IS_CYPRESS_TEST ? dummyCustomZone : {}
}

const customZoneSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'customZone',
  reducers: {
    /**
     * add a new layer
     * @param {Object=} state
     * @param action
     */
    add(state, action: PayloadAction<CustomZone>) {
      state.zones = { ...state.zones, [action.payload.uuid]: action.payload }
    },

    /**
     * Hide a layer with the UUID
     * @param {Object=} state
     * @param action - the uuid
     */
    hide(state, action: PayloadAction<string>) {
      state.zones[action.payload]!.isShown = false
    },

    /**
     * Delete a layer with the UUID
     * @param {Object=} state
     * @param action - the uuid
     */
    remove(state, action: PayloadAction<string>) {
      delete state.zones[action.payload]
    },

    /**
     * Show a layer with the UUID
     * @param {Object=} state
     * @param action - the uuid
     */
    show(state, action: PayloadAction<string>) {
      state.zones[action.payload]!.isShown = true
    }
  }
})

export const { add, hide, remove, show } = customZoneSlice.actions

export const customZoneReducer = customZoneSlice.reducer

export const customZoneActions = customZoneSlice.actions
