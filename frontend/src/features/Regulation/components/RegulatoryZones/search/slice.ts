import { createSlice } from '@reduxjs/toolkit'

import type { GeoJSON } from '../../../../../domain/types/GeoJSON'
import type { RegulatoryLawTypes, RegulatoryZone } from '../../../types'
import type { PayloadAction } from '@reduxjs/toolkit'

type ZoneSelected = {
  code: string
  feature: GeoJSON.Geometry
  name: string
}

type VesselListState = {
  advancedSearchIsOpen: boolean
  regulatoryLayersSearchResult: RegulatoryLawTypes | undefined
  regulatoryZonesChecked: RegulatoryZone[]
  zoneSelected: ZoneSelected | undefined
}
const INITIAL_STATE: VesselListState = {
  advancedSearchIsOpen: false,
  regulatoryLayersSearchResult: undefined,
  regulatoryZonesChecked: [],
  zoneSelected: undefined
}

const regulatoryLayerSearchSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulatoryLayerSearch',
  reducers: {
    /**
     * Add zones to regulatory zones selection in progress to add to "My Zones"
     */
    checkRegulatoryZones(state, action: PayloadAction<RegulatoryZone[]>) {
      state.regulatoryZonesChecked = state.regulatoryZonesChecked
        .concat(action.payload)
        // remove duplicates
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    },

    /**
     * Reset regulatory zones selection
     */
    resetRegulatoryZonesChecked(state) {
      state.regulatoryZonesChecked = []
    },

    /**
     * Set the selected zone to filter regulations
     * @param {Object=} state
     */
    resetZoneSelected(state) {
      state.zoneSelected = undefined
    },

    /**
     * Set regulatory advanced search as open or closed
     */
    setAdvancedSearchIsOpen(state, action: PayloadAction<boolean>) {
      state.advancedSearchIsOpen = action.payload
    },

    /**
     * Set regulatory layers search result structured as
     * LawType: {
     *   Topic: Zone[]
     * }
     */
    setRegulatoryLayersSearchResult(state, action: PayloadAction<RegulatoryLawTypes | undefined>) {
      state.regulatoryLayersSearchResult = action.payload
    },

    /**
     * Set the selected zone to filter regulations
     */
    setZoneSelected(state, action: PayloadAction<ZoneSelected>) {
      state.zoneSelected = action.payload
    },

    /**
     * Remove zones from regulatory zones selection in progress to add to "My Zones"
     */
    uncheckRegulatoryZones(state, action: PayloadAction<RegulatoryZone[]>) {
      state.regulatoryZonesChecked = state.regulatoryZonesChecked.filter(
        zone => !action.payload.some(zoneToRemove => zoneToRemove.id === zone.id)
      )
    }
  }
})

export const {
  checkRegulatoryZones,
  resetRegulatoryZonesChecked,
  resetZoneSelected,
  setAdvancedSearchIsOpen,
  setRegulatoryLayersSearchResult,
  setZoneSelected,
  uncheckRegulatoryZones
} = regulatoryLayerSearchSlice.actions

export const regulatoryLayerSearchReducer = regulatoryLayerSearchSlice.reducer
