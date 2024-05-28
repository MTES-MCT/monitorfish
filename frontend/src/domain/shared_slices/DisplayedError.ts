import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { createSlice } from '@reduxjs/toolkit'
import { UseCaseStore } from '@store/UseCaseStore'
import { assertNotNullish } from '@utils/assertNotNullish'

import type { DisplayedError } from '@libs/DisplayedError'
import type { PayloadAction } from '@reduxjs/toolkit'

export type DisplayedErrorStateValue = {
  hasRetryableUseCase: boolean
  message: string
}

export type DisplayedErrorState = Record<DisplayedErrorKey, DisplayedErrorStateValue | undefined>
export const INITIAL_STATE: DisplayedErrorState = Object.values(DisplayedErrorKey).reduce(
  (acc, key) => ({ ...acc, [key]: undefined }),
  {} as DisplayedErrorState
)

const displayedErrorSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'displayedError',
  reducers: {
    /**
     * @internal
     * /!\ NEVER use this action directly, use `displayOrLogError()` use case instead.
     */
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
        const displayedError = action.payload[typedKey]
        assertNotNullish(displayedError)

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
