import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Vessel } from '@features/Vessel/Vessel.types'

export type LiveVesselConfirmationState = {
  /** The vessel opened from live data (an alert, a prior notification...) while positions are replayed. */
  vesselIdentity: Vessel.VesselIdentity | undefined
}
const INITIAL_STATE: LiveVesselConfirmationState = {
  vesselIdentity: undefined
}

const liveVesselConfirmationSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'liveVesselConfirmation',
  reducers: {
    ask(_state, action: PayloadAction<Vessel.VesselIdentity>) {
      return { vesselIdentity: action.payload }
    },

    close() {
      return INITIAL_STATE
    }
  }
})

export const liveVesselConfirmationActions = liveVesselConfirmationSlice.actions
export const liveVesselConfirmationReducer = liveVesselConfirmationSlice.reducer
