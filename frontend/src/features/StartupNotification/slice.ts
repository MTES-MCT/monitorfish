import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export type StartupNotificationState = {
  isSurveyModalDisplayed: boolean
}
const INITIAL_STATE: StartupNotificationState = {
  isSurveyModalDisplayed: false
}

const startupNotificationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'startupNotification',
  reducers: {
    setIsSurveyModalDisplayed(state, action: PayloadAction<boolean>) {
      state.isSurveyModalDisplayed = action.payload
    }
  }
})

export const startupNotificationActions = startupNotificationSlice.actions
export const startupNotificationReducer = startupNotificationSlice.reducer
