import { createSlice } from '@reduxjs/toolkit'

import type { GeoJSON } from '../../../../domain/types/GeoJSON'
import type { RegulatoryLawTypes } from '../../types'
import type { PayloadAction } from '@reduxjs/toolkit'

type ZoneSelected = {
  code: string
  feature: GeoJSON.Geometry
  name: string
}

type VesselListState = {
  advancedSearchIsOpen: boolean
  regulatoryLayersSearchResult: RegulatoryLawTypes | undefined
  zoneSelected: ZoneSelected | undefined
}
const INITIAL_STATE: VesselListState = {
  advancedSearchIsOpen: false,
  regulatoryLayersSearchResult: undefined,
  zoneSelected: undefined
}

const regulatoryLayerSearchSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'regulatoryLayerSearch',
  reducers: {
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
    }
  }
})

export const { resetZoneSelected, setAdvancedSearchIsOpen, setRegulatoryLayersSearchResult, setZoneSelected } =
  regulatoryLayerSearchSlice.actions

export const regulatoryLayerSearchReducer = regulatoryLayerSearchSlice.reducer
