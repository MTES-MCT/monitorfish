import { UseCaseStore } from '@libs/UseCaseStore'
import { createSlice } from '@reduxjs/toolkit'
import { ensure } from '@utils/ensure'

import type { DisplayedError } from '@libs/DisplayedError'
import type { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import type { PayloadAction } from '@reduxjs/toolkit'

type DisplayedErrorStateValue = {
  hasRetryableUseCase: boolean
  message: string
}

export type DisplayedErrorState = Record<DisplayedErrorKey, DisplayedErrorStateValue | undefined>
export const INITIAL_STATE: DisplayedErrorState = {
  missionFormError: undefined,
  vesselSidebarError: undefined
}

const displayedErrorSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'displayedError',
  reducers: {
    set(
      state,
      action: PayloadAction<
        Partial<{
          [key in DisplayedErrorKey]: DisplayedError
        }>
      >
    ) {
      Object.keys(action.payload).forEach(key => {
        const typedKey = key as DisplayedErrorKey
        const displayedError = ensure(action.payload[typedKey], `action.payload[${typedKey}]`)

        state[typedKey] = {
          hasRetryableUseCase: displayedError.hasRetryableUseCase,
          message: displayedError.message
        }
      })
    },

    unset(state, action: PayloadAction<keyof DisplayedErrorState | Array<keyof DisplayedErrorState>>) {
      const keys = Array.isArray(action.payload) ? action.payload : [action.payload]

      keys.forEach(key => {
        UseCaseStore.unset(key)

        state[key] = undefined
      })
    }
  }
})

export const displayedErrorActions = displayedErrorSlice.actions
export const displayedErrorReducer = displayedErrorSlice.reducer
