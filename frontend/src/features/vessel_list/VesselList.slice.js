import { createSlice } from '@reduxjs/toolkit'

const vesselListSlice = createSlice({
  initialState: {
    zonesSelected: [],
  },
  name: 'vesselList',
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
    addZoneSelected(state, action) {
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
    removeZoneSelected(state, action) {
      state.zonesSelected = state.zonesSelected.filter(zoneSelected => zoneSelected.code !== action.payload)
    },
    resetZonesSelected(state) {
      state.zonesSelected = []
    },
    setZonesSelected(state, action) {
      state.zonesSelected = action.payload
    },
  },
})

export const { addZoneSelected, removeZoneSelected, resetZonesSelected, setZonesSelected } = vesselListSlice.actions

export default vesselListSlice.reducer
