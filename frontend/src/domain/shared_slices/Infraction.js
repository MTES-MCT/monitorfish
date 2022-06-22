import { createSlice } from '@reduxjs/toolkit'

const infractionSlice = createSlice({
  name: 'infraction',
  initialState: {
    infractions: []
  },
  reducers: {
    setInfractions (state, action) {
      state.infractions = action.payload
    }
  }
})

export const {
  setInfractions
} = infractionSlice.actions

export default infractionSlice.reducer
