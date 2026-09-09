import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export type StartupNotificationState = {
  dismissedIds: string[]
}
const INITIAL_STATE: StartupNotificationState = {
  dismissedIds: []
}

const startupNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'startupNotification',
  reducers: {
    dismiss(state, action: PayloadAction<string>) {
      if (state.dismissedIds.includes(action.payload)) {
        return
      }

      state.dismissedIds = state.dismissedIds.concat(action.payload)
    }
  }
})

export const startupNotificationActions = startupNotificationSlice.actions
export const startupNotificationReducer = startupNotificationSlice.reducer
