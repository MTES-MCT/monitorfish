import { createSlice } from '@reduxjs/toolkit'

import type { GeoJSON } from '../../domain/types/GeoJSON'

type ZoneSelected = {
  code: string
  feature: GeoJSON.GeoJson
  name: string
}

export type VesselListState = {
  zonesSelected: ZoneSelected[]
}
const INITIAL_STATE: VesselListState = {
  zonesSelected: []
}

const vesselListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselList',
  reducers: {
    /**
     * Add a selected zone to filter vessels or regulations
     */
    addZoneSelected(state, action) {
      if (!state.zonesSelected.find(zone => zone.code === action.payload.code)) {
        state.zonesSelected = state.zonesSelected.concat(action.payload)
      }
    },
    /**
     * Remove a selected zone
     */
    removeZoneSelected(state, action) {
      state.zonesSelected = state.zonesSelected.filter(zoneSelected => zoneSelected.code !== action.payload)
    },
    resetZonesSelected(state) {
      state.zonesSelected = []
    },
    setZonesSelected(state, action) {
      state.zonesSelected = action.payload
    }
  }
})

export const { addZoneSelected, removeZoneSelected, resetZonesSelected, setZonesSelected } = vesselListSlice.actions

export const vesselListReducer = vesselListSlice.reducer
