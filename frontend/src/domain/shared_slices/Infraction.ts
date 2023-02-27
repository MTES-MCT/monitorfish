import { createSlice } from '@reduxjs/toolkit'

import type { MissionAction } from '../types/missionAction'

export type InfractionState = {
  infractions: MissionAction.Infraction[]
}
const INITIAL_STATE: InfractionState = {
  infractions: []
}

const infractionSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'infraction',
  reducers: {
    setInfractions(state, action) {
      state.infractions = action.payload
    }
  }
})

export const { setInfractions } = infractionSlice.actions

export const infractionReducer = infractionSlice.reducer
