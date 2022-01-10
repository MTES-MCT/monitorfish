import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace BeaconStatusReducer */
const BeaconStatusReducer = null
/* eslint-enable */

const beaconStatusSlice = createSlice({
  name: 'beaconStatus',
  initialState: {
    beaconStatuses: []
  },
  reducers: {
    setBeaconStatuses (state, action) {
      state.beaconStatuses = action.payload
    },
    /**
     * update a single beacon status
     * @function updateLocalBeaconStatus
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatus}} action - the beacon status to update
     */
    updateLocalBeaconStatus (state, action) {
      const nextBeaconStatuses = state.beaconStatuses.filter(beaconStatus => beaconStatus.id !== action.payload.id)

      state.beaconStatuses = [
        action.payload,
        ...nextBeaconStatuses
      ]
    }
  }
})

export const {
  setBeaconStatuses,
  updateLocalBeaconStatus
} = beaconStatusSlice.actions

export default beaconStatusSlice.reducer
