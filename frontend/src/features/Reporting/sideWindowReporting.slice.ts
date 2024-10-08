import { customDayjs } from '@mtes-mct/monitor-ui'
import { createSlice } from '@reduxjs/toolkit'

import type { Reporting } from './types'
import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ReportingState = {
  archivedReportingsFromDate: string
  currentReportings: Reporting.Reporting[]
  editedReporting: Reporting.EditableReporting | undefined
  vesselIdentity: VesselIdentity | undefined
}
const INITIAL_STATE: ReportingState = {
  archivedReportingsFromDate: customDayjs().utc().subtract(5, 'year').startOf('year').toISOString(),
  currentReportings: [],
  editedReporting: undefined,
  vesselIdentity: undefined
}

const sideWindowReportingSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'reporting',
  reducers: {
    resetSelectedVesselReportings(state) {
      state.vesselIdentity = undefined
    },

    /**
     * Set the date since archived reporting are fetched
     */
    setArchivedReportingsFromDate(state, action: PayloadAction<string>) {
      state.archivedReportingsFromDate = action.payload
    },

    /**
     * Set current reporting
     */
    setCurrentReportings(state, action: PayloadAction<Reporting.Reporting[]>) {
      state.currentReportings = action.payload
    },

    /**
     * Set the edited reporting
     */
    setEditedReporting(state, action: PayloadAction<Reporting.EditableReporting>) {
      state.editedReporting = action.payload
    },

    unsetEditedReporting(state) {
      state.editedReporting = undefined
    }
  }
})

export const sideWindowReportingActions = sideWindowReportingSlice.actions
export const sideWindowReportingReducer = sideWindowReportingSlice.reducer
