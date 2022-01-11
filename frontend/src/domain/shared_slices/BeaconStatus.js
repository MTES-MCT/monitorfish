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
     * @function updateLocalBeaconStatus
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatus}} action - the beacon status to update
     */
    updateLocalBeaconStatus (state, action) {
      const id = action.payload?.id
      const nextBeaconStatuses = state.beaconStatuses.filter(beaconStatus => beaconStatus.id !== id)

      state.beaconStatuses = [
        action.payload,
        ...nextBeaconStatuses
      ]

      if (state.openedBeaconStatus?.id === id) {
        state.openedBeaconStatus = action.payload
      }
    },
    /**
     * Open a single beacon status
     * @function selectBeaconStatus
     * @memberOf BeaconStatusReducer
     * @param {Object=} state
     * @param {{payload: BeaconStatusWithDetails}} action - the beacon status to open
     */
    selectBeaconStatus (state, action) {
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
  updateLocalBeaconStatus,
  selectBeaconStatus,
  closeBeaconStatus
} = beaconStatusSlice.actions

export default beaconStatusSlice.reducer
