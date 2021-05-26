import { createSlice } from '@reduxjs/toolkit'
import { getLocalStorageState } from '../../utils'

const vesselsFiltersLocalStorageKey = 'vesselsFilters'
const nonFilteredVesselsAreHiddenLocalStorageKey = 'nonFilteredVesselsAreHidden'

/**
 * @typedef Filter
 * @property {FilterValues} filters
 * @property {string} name
 * @property {string} color
 * @property {boolean} showed
 * @property {string} uuid
 */

/**
 * @typedef FilterValues
 * @property {string[]} countriesFiltered
 * @property {string[]} fleetSegmentsFiltered
 * @property {string[]} gearsFiltered
 * @property {string[]} speciesFiltered
 * @property {string[]} districtsFiltered
 * @property {string[]} vesselsSizeValuesChecked
 * @property {{
 *      name: string,
 *      code: string,
 *      feature: GeoJSONGeometry
 *    }[]} zonesSelected
 */

/**
 * @typedef GeoJSONGeometry
 * @property {{type: string, coordinates: Object}} geometry
 */

const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    filters: getLocalStorageState([], vesselsFiltersLocalStorageKey),
    nonFilteredVesselsAreHidden: getLocalStorageState(false, nonFilteredVesselsAreHiddenLocalStorageKey)
  },
  reducers: {
    /**
     * Add a new filter
     * @param {Object=} state
     * @param {{payload: Filter}} action - The filter to add
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
     * @param {Object=} state
     * @param {{payload: string}} action - The filter UUID
     */
    showFilter (state, action) {
      const uuidToShow = action.payload

      state.filters = state.filters.map(filter => {
        filter.showed = filter.uuid === uuidToShow

        return filter
      })
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },
    /**
     * Hide all filters
     * @param {Object=} state
     */
    hideFilters (state) {
      state.filters = state.filters.map(filter => {
        filter.showed = false

        return filter
      })
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },
    /**
     * Remove tag from a given filter
     * @param {Object=} state
     * @param {{
     * payload: {
     *  uuid: string,
     *  type: string,
     *  value: string
     * }}} action - The tag to remove object
     */
    removeTagFromFilter (state, action) {
      console.log(action.payload)
      const filterUUID = action.payload.uuid
      const tagType = action.payload.type
      const tagValue = action.payload.value

      state.filters = state.filters.map(filter => {
        if (filter.uuid === filterUUID) {
          filter.filters[tagType] = filter.filters[tagType].filter(tag => tag !== tagValue)
        }

        return filter
      })
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },
    /**
     * Hide non filtered vessels
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
