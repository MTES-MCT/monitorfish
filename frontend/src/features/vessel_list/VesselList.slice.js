import { createSlice } from '@reduxjs/toolkit'

const vesselListSlice = createSlice({
  name: 'vesselList',
  initialState: {
    zonesSelected: []
  },
  reducers: {
    /**
     * Add a selected zone to filter vessels or regulations
     * @param {Object=} state
     * @param {{
     * payload: {
     *  name: string,
     *  code: string,
     *  feature: GeoJSON
     * }}} action - The zone to add
     */
    addZoneSelected (state, action) {
      if (!state.zonesSelected.find(zone => zone.code === action.payload.code)) {
        state.zonesSelected = state.zonesSelected.concat(action.payload)
      }
    },
    /**
     * Remove a selected zone
     * @param {Object=} state
     * @param {{
     * payload: string}} action - The name of the zone
     */
    removeZoneSelected (state, action) {
      state.zonesSelected = state.zonesSelected.filter(zoneSelected => {
        return zoneSelected.code !== action.payload
      })
    },
    setZonesSelected (state, action) {
      state.zonesSelected = action.payload
    },
    resetZonesSelected (state) {
      state.zonesSelected = []
    }
  }
})

export const {
  addZoneSelected,
  setZonesSelected,
  removeZoneSelected,
  resetZonesSelected
} = vesselListSlice.actions

export default vesselListSlice.reducer
