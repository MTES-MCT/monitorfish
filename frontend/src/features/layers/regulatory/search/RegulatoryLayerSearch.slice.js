import { createSlice } from '@reduxjs/toolkit'

const regulatoryLayerSearchSlice = createSlice({
  initialState: {
    advancedSearchIsOpen: false,

    /** @type RegulatoryLawTypes regulatoryLayersSearchResult */
    regulatoryLayersSearchResult: null,
    /** @type RegulatoryZone[] regulatoryZonesChecked */
    regulatoryZonesChecked: [],
    zoneSelected: null,
  },
  name: 'regulatoryLayerSearch',
  reducers: {
    /**
     * Add zones to regulatory zones selection in progress to add to "My Zones"
     * @param {Object=} state
     * @param {{
     *   topic: string,
     *   zone: string,
     *   id: string
     * }[]} action - The regulatory zones
     */
    checkRegulatoryZones(state, action) {
      state.regulatoryZonesChecked = state.regulatoryZonesChecked
        .concat(action.payload)
        // remove duplicates
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    },

    /**
     * Reset regulatory zones selection
     * @param {Object=} state
     */
    resetRegulatoryZonesChecked(state) {
      state.regulatoryZonesChecked = []
    },

    /**
     * Set the selected zone to filter regulations
     * @param {Object=} state
     */
    resetZoneSelected(state) {
      state.zoneSelected = null
    },

    /**
     * Set regulatory advanced search as open or closed
     * @param {Object=} state
     * @param {boolean} action - the open or close boolean
     */
    setAdvancedSearchIsOpen(state, action) {
      state.advancedSearchIsOpen = action.payload
    },

    /**
     * Set regulatory layers search result structured as
     * LawType: {
     *   Topic: Zone[]
     * }
     * @param {Object=} state
     * @param {RegulatoryLawTypes | null} action - The regulatory search result
     */
    setRegulatoryLayersSearchResult(state, action) {
      state.regulatoryLayersSearchResult = action.payload
    },

    /**
     * Set the selected zone to filter regulations
     * @param {Object=} state
     * @param {{
     * payload: {
     *  name: string,
     *  code: string,
     *  feature: GeoJSON
     * }}} action - The zone
     */
    setZoneSelected(state, action) {
      state.zoneSelected = action.payload
    },

    /**
     * Remove zones from regulatory zones selection in progress to add to "My Zones"
     * @param {Object=} state
     * @param {{
     *   topic: string,
     *   zone: string,
     *   id: string
     * }[]} action - The regulatory zones and topic
     */
    uncheckRegulatoryZones(state, action) {
      state.regulatoryZonesChecked = state.regulatoryZonesChecked.filter(
        zone => !action.payload.some(zoneToRemove => zoneToRemove.id === zone.id),
      )
    },
  },
})

export const {
  checkRegulatoryZones,
  resetRegulatoryZonesChecked,
  resetZoneSelected,
  setAdvancedSearchIsOpen,
  setRegulatoryLayersSearchResult,
  setZoneSelected,
  uncheckRegulatoryZones,
} = regulatoryLayerSearchSlice.actions

export default regulatoryLayerSearchSlice.reducer
