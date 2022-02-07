import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace BeaconStatusReducer */
const BeaconStatusReducer = null
/* eslint-enable */

const beaconStatusSlice = createSlice({
  name: 'beaconStatus',
  initialState: {
    beaconStatuses: [],
    openedBeaconStatus: null
  },
  reducers: {
    setBeaconStatuses (state, action) {
      state.beaconStatuses = action.payload
    },
    /**
     * Update a single beacon status
     * @function updateLocalBeaconStatuses
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatus}} action - the beacon status to update
     */
    updateLocalBeaconStatuses (state, action) {
      const id = action.payload?.id
      const nextBeaconStatuses = state.beaconStatuses.filter(beaconStatus => beaconStatus.id !== id)

      state.beaconStatuses = [
        action.payload,
        ...nextBeaconStatuses
      ]
    },
    /**
     * Open a beacon status
     * @function setOpenedBeaconStatus
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatusWithDetails}} action - the beacon status to open
     */
    setOpenedBeaconStatus (state, action) {
      state.openedBeaconStatus = action.payload
    },
    /**
     * Close a single beacon status
     * @function closeBeaconStatus
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     */
    closeBeaconStatus (state) {
      state.openedBeaconStatus = null
    }
  }
})

export const {
  setBeaconStatuses,
  updateLocalBeaconStatuses,
  setOpenedBeaconStatus,
  closeBeaconStatus
} = beaconStatusSlice.actions

export default beaconStatusSlice.reducer
