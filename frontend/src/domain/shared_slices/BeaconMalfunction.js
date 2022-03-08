import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace BeaconMalfunctionReducer */
const BeaconMalfunctionReducer = null
/* eslint-enable */

const beaconMalfunctionSlice = createSlice({
  name: 'beaconMalfunction',
  initialState: {
    beaconMalfunctions: [],
    openedBeaconMalfunction: null
  },
  reducers: {
    setBeaconMalfunctions (state, action) {
      state.beaconMalfunctions = action.payload
    },
    /**
     * Update a single beacon malfunction
     * @function updateLocalBeaconMalfunctions
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunction}} action - the beacon malfunction to update
     */
    updateLocalBeaconMalfunctions (state, action) {
      const id = action.payload?.id
      const nextBeaconMalfunctions = state.beaconMalfunctions.filter(beaconMalfunction => beaconMalfunction.id !== id)

      state.beaconMalfunctions = [
        action.payload,
        ...nextBeaconMalfunctions
      ]
    },
    /**
     * Open a beacon malfunction
     * @function setOpenedBeaconMalfunction
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     * @param {{payload: BeaconMalfunctionWithDetails}} action - the beacon malfunction to open
     */
    setOpenedBeaconMalfunction (state, action) {
      state.openedBeaconMalfunction = action.payload
    },
    /**
     * Close a single beacon malfunction
     * @function closeBeaconMalfunction
     * @memberOf BeaconMalfunctionReducer
     * @param {Object=} state
     */
    closeBeaconMalfunction (state) {
      state.openedBeaconMalfunction = null
    }
  }
})

export const {
  setBeaconMalfunctions,
  updateLocalBeaconMalfunctions,
  setOpenedBeaconMalfunction,
  closeBeaconMalfunction
} = beaconMalfunctionSlice.actions

export default beaconMalfunctionSlice.reducer
