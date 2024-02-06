import { createSlice } from '@reduxjs/toolkit'

import { DisplayedError } from '../../libs/DisplayedError'

import type { PayloadAction } from '@reduxjs/toolkit'

export type DisplayedErrorState = {
  missionFormError: DisplayedError | undefined
  vesselSidebarError: DisplayedError | undefined
}
export const INITIAL_STATE: DisplayedErrorState = {
  missionFormError: undefined,
  vesselSidebarError: undefined
}

const displayedErrorSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'displayedError',
  reducers: {
    set(state, action: PayloadAction<Partial<DisplayedErrorState>>) {
      Object.keys(action.payload).forEach(key => {
        state[key] = action.payload[key]
      })
    },

    unset(state, action: PayloadAction<keyof DisplayedErrorState | Array<keyof DisplayedErrorState>>) {
      const keys = Array.isArray(action.payload) ? action.payload : [action.payload]

      keys.forEach(key => {
        state[key] = undefined
      })
    }
  }
})

export const displayedErrorActions = displayedErrorSlice.actions
export const displayedErrorReducer = displayedErrorSlice.reducer
