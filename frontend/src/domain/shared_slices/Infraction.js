import { createSlice } from '@reduxjs/toolkit'

const infractionSlice = createSlice({
  initialState: {
    infractions: [],
  },
  name: 'infraction',
  reducers: {
    setInfractions(state, action) {
      state.infractions = action.payload
    },
  },
})

export const { setInfractions } = infractionSlice.actions

export default infractionSlice.reducer
