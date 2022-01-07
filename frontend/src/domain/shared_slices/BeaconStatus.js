import { createSlice } from '@reduxjs/toolkit'

const beaconStatusSlice = createSlice({
  name: 'beaconStatus',
  initialState: {
    beaconStatuses: []
  },
  reducers: {
    setBeaconStatuses (state, action) {
      state.beaconStatuses = action.payload
    }
  }
})

export const {
  setBeaconStatuses
} = beaconStatusSlice.actions

export default beaconStatusSlice.reducer
