import { customDayjs } from '@mtes-mct/monitor-ui'
import { createSlice } from '@reduxjs/toolkit'

import type { Reporting } from './types'
import type { VesselIdentity } from '../../domain/entities/vessel/types'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ReportingState = {
  archivedReportingsFromDate: string
  editedReporting: Reporting.EditableReporting | undefined
  vesselIdentity: VesselIdentity | undefined
}
const INITIAL_STATE: ReportingState = {
  archivedReportingsFromDate: customDayjs().utc().subtract(5, 'year').startOf('year').toISOString(),
  editedReporting: undefined,
  vesselIdentity: undefined
}

const mainWindowReportingSlice = createSlice({
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
     * Set the edited reporting
     */
    setEditedReporting(state, action: PayloadAction<Reporting.EditableReporting | undefined>) {
      state.editedReporting = action.payload
    },

    setVesselIdentity(state, action: PayloadAction<VesselIdentity>) {
      state.vesselIdentity = action.payload
    }
  }
})

export const mainWindowReportingActions = mainWindowReportingSlice.actions
export const mainWindowReportingReducer = mainWindowReportingSlice.reducer
