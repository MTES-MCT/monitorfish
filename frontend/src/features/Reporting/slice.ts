import { createSlice } from '@reduxjs/toolkit'

import type { Reporting } from './types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ReportingState = {
  editedReporting: Reporting.EditableReporting | undefined
}
const INITIAL_STATE: ReportingState = {
  editedReporting: undefined
}

const reportingSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reporting',
  reducers: {
    setEditedReporting(state, action: PayloadAction<Reporting.EditableReporting>) {
      state.editedReporting = action.payload
    },

    unsetEditedReporting(state) {
      state.editedReporting = undefined
    }
  }
})

export const reportingActions = reportingSlice.actions
export const reportingReducer = reportingSlice.reducer
