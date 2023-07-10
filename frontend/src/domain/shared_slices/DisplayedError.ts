import { createSlice } from '@reduxjs/toolkit'

import { DisplayedError } from '../../libs/DisplayedError'

import type { PayloadAction } from '@reduxjs/toolkit'

/**
 * A `null` value means the error is no longer displayed
 */
export type OptionalDisplayedErrorAction = {
  missionFormError?: DisplayedError | null
  vesselSidebarError?: DisplayedError | null
}

export type DisplayedErrorState = {
  missionFormError: DisplayedError | undefined | null
  vesselSidebarError: DisplayedError | undefined | null
}
export const INITIAL_STATE: DisplayedErrorState = {
  missionFormError: undefined,
  vesselSidebarError: undefined
}

const displayedErrorSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'displayedError',
  reducers: {
    setDisplayedErrors(state, action: PayloadAction<OptionalDisplayedErrorAction>) {
      Object.keys(INITIAL_STATE).forEach(key => {
        state[key] = getValueOrDefault(action.payload[key], state[key])
      })
    }
  }
})

export const { setDisplayedErrors } = displayedErrorSlice.actions

export const displayedErrorReducer = displayedErrorSlice.reducer

function getValueOrDefault(value, defaultValue) {
  if (value !== undefined) {
    return value
  }

  return defaultValue
}
