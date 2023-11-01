import { createSlice } from '@reduxjs/toolkit'

import type { Infraction } from '../types/infraction'

export type InfractionState = {
  infractions: Infraction[]
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
