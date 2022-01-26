import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'

/* eslint-disable */
/** @namespace FilterReducer */
const FilterReducer = null
/* eslint-enable */

const vesselsFiltersLocalStorageKey = 'vesselsFilters'
const nonFilteredVesselsAreHiddenLocalStorageKey = 'nonFilteredVesselsAreHidden'

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    /** @type {VesselFilter[]} filters */
    filters: getLocalStorageState([], vesselsFiltersLocalStorageKey),
    nonFilteredVesselsAreHidden: getLocalStorageState(false, nonFilteredVesselsAreHiddenLocalStorageKey)
  },
  reducers: {
    /**
     * Add a new filter
     * @function addFilter
     * @memberOf FilterReducer
     * @param {Object=} state
     * @param {{payload: VesselFilter}} action - The filter to add
     */
    addFilter (state, action) {
      state.filters = state.filters.map(filter => {
        filter.showed = false

        return filter
      })
      state.filters = state.filters.concat(action.payload)
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },
    /**
     * Delete a given filter
     * @function removeFilter
     * @memberOf FilterReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The filter UUID
     */
    removeFilter (state, action) {
      const uuidToRemove = action.payload
      state.filters = state.filters.filter(filter => filter.uuid !== uuidToRemove)
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },
    /**
     * Show a given filter
     * @function showFilter
     * @memberOf FilterReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The filter UUID
     */
    showFilter (state, action) {
      const uuidToShow = action.payload

      state.filters = state.filters.map(filter => {
        return { ...filter, showed: filter.uuid === uuidToShow }
      })
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },
    /**
     * Hide all filters
     * @function hideFilters
     * @memberOf FilterReducer
     * @param {Object=} state
     */
    hideFilters (state) {
      state.filters = state.filters.map(filter => {
        return { ...filter, showed: false }
      })
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
      // prevents no filters shown & nonFilteredVesselsAreHidden = true leading to empty map
      state.nonFilteredVesselsAreHidden = false
      window.localStorage.setItem(nonFilteredVesselsAreHiddenLocalStorageKey, JSON.stringify(state.nonFilteredVesselsAreHidden))
    },
    /**
     * Remove tag from a given filter and delete filter if the filter contains no tag
     * @function removeTagFromFilter
     * @memberOf FilterReducer
     * @param {Object=} state
     * @param {{
     * payload: {
     *  uuid: string,
     *  type: string,
     *  value: string
     * }}} action - The tag to remove object
     */
    removeTagFromFilter (state, action) {
      const filterUUID = action.payload.uuid
      const tagType = action.payload.type
      const tagValue = action.payload.value

      state.filters = state.filters.map(filter => {
        if (filter.uuid === filterUUID) {
          if (tagType === 'lastControlMonthsAgo') {
            filter.filters.lastControlMonthsAgo = null
          } else if (tagType === 'zonesSelected') {
            filter.filters[tagType] = filter.filters[tagType].filter(zone => zone.name !== tagValue)
          } else {
            filter.filters[tagType] = filter.filters[tagType].filter(tag => tag !== tagValue)
          }

          const filterHasNoTag = (!filter.filters.countriesFiltered || !filter.filters.countriesFiltered.length) &&
            (!filter.filters.fleetSegmentsFiltered || !filter.filters.fleetSegmentsFiltered.length) &&
            (!filter.filters.gearsFiltered || !filter.filters.gearsFiltered.length) &&
            (!filter.filters.speciesFiltered || !filter.filters.speciesFiltered.length) &&
            (!filter.filters.districtsFiltered || !filter.filters.districtsFiltered.length) &&
            (!filter.filters.vesselsSizeValuesChecked || !filter.filters.vesselsSizeValuesChecked.length) &&
            (!filter.filters.lastControlMonthsAgo) &&
            (!filter.filters.zonesSelected || !filter.filters.zonesSelected.length)

          if (filterHasNoTag) {
            return null
          }
        }
        return filter
      }).filter(vessel => vessel)

      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },
    /**
     * Hide non filtered vessels
     * @function setNonFilteredVesselsAreHidden
     * @memberOf FilterReducer
     * @param {Object=} state
     * @param {{
     * payload: boolean
     * }} action - The boolean
     */
    setNonFilteredVesselsAreHidden (state, action) {
      state.nonFilteredVesselsAreHidden = action.payload
      window.localStorage.setItem(nonFilteredVesselsAreHiddenLocalStorageKey, JSON.stringify(action.payload))
    }
  }
})

export const {
  addFilter,
  removeFilter,
  showFilter,
  hideFilters,
  removeTagFromFilter,
  setNonFilteredVesselsAreHidden
} = filterSlice.actions

export default filterSlice.reducer
