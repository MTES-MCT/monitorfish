import { createSlice } from '@reduxjs/toolkit'

const regulatoryLayerSearchSlice = createSlice({
  name: 'regulatoryLayerSearch',
  initialState: {
    /** @type SelectedRegulatoryZone[] regulatoryZonesChecked */
    regulatoryZonesChecked: [],
    /** @type RegulatoryLawTypes regulatoryLayersSearchResult */
    regulatoryLayersSearchResult: null
  },
  reducers: {
    /**
     * Add zones to regulatory zones selection in progress to add to "My Zones"
     * @param {Object=} state
     * @param {SelectedRegulatoryZone[]} action - The regulatory zones
     */
    checkRegulatoryZones (state, action) {
      state.regulatoryZonesChecked = state.regulatoryZonesChecked.concat(action.payload)
        // remove duplicates
        .filter((v, i, a) => a.findIndex(t => (t.zone === v.zone)) === i)
    },
    /**
     * Remove zones from regulatory zones selection in progress to add to "My Zones"
     * @param {Object=} state
     * @param {string[]} action - The regulatory zones' names
     */
    uncheckRegulatoryZones (state, action) {
      state.regulatoryZonesChecked = state.regulatoryZonesChecked
        .filter(zone => !action.payload.some(zoneName => zoneName === zone.zone))
    },
    /**
     * Reset regulatory zones selection
     * @param {Object=} state
     */
    resetRegulatoryZonesChecked (state) {
      state.regulatoryZonesChecked = []
    },
    /**
     * Set regulatory layers search result structured as
     * LawType: {
     *   Topic: Zone[]
     * }
     * @param {Object=} state
     * @param {RegulatoryLawTypes | null} action - The regulatory search result
     */
    setRegulatoryLayersSearchResult (state, action) {
      state.regulatoryLayersSearchResult = action.payload
    }
  }
})

export const {
  checkRegulatoryZones,
  uncheckRegulatoryZones,
  resetRegulatoryZonesChecked,
  setRegulatoryLayersSearchResult
} = regulatoryLayerSearchSlice.actions

export default regulatoryLayerSearchSlice.reducer
