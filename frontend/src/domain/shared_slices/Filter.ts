import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'

import type { VesselFilter } from '../types/filter'
import type { PayloadAction } from '@reduxjs/toolkit'

const vesselsFiltersLocalStorageKey = 'vesselsFilters'
const nonFilteredVesselsAreHiddenLocalStorageKey = 'nonFilteredVesselsAreHidden'

export type FilterState = {
  filters: VesselFilter[]
  nonFilteredVesselsAreHidden: boolean
}
const INITIAL_STATE: FilterState = {
  filters: getLocalStorageState([], vesselsFiltersLocalStorageKey),
  nonFilteredVesselsAreHidden: getLocalStorageState(false, nonFilteredVesselsAreHiddenLocalStorageKey)
}

const filterSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'filter',
  reducers: {
    /**
     * Add a new filter
     * @function addFilter
     * @memberOf FilterReducer
     * @param {Object=} state
     * @param {{payload: VesselFilter}} action - The filter to add
     */
    addFilter(state, action) {
      state.filters = state.filters.map(filter => {
        filter.showed = false

        return filter
      })
      state.filters = state.filters.concat(action.payload)
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },

    /**
     * Hide all filters
     * @function hideFilters
     * @memberOf FilterReducer
     * @param {Object=} state
     */
    hideFilters(state) {
      state.filters = state.filters.map(filter => ({ ...filter, showed: false }))
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
      // prevents no filters shown & nonFilteredVesselsAreHidden = true leading to empty map
      state.nonFilteredVesselsAreHidden = false
      window.localStorage.setItem(
        nonFilteredVesselsAreHiddenLocalStorageKey,
        JSON.stringify(state.nonFilteredVesselsAreHidden)
      )
    },

    /**
     * Delete a given filter
     * @function removeFilter
     * @memberOf FilterReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The filter UUID
     */
    removeFilter(state, action) {
      const uuidToRemove = action.payload
      state.filters = state.filters.filter(filter => filter.uuid !== uuidToRemove)
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    },

    /**
     * Remove tag from a given filter and delete filter if the filter contains no tag
     */
    removeTagFromFilter(
      state,
      action: PayloadAction<{
        type: string
        uuid: string
        value: string
      }>
    ) {
      const filterUUID = action.payload.uuid
      const tagType = action.payload.type
      const tagValue = action.payload.value

      state.filters = state.filters.reduce<VesselFilter[]>((filtersPile, filter) => {
        if (filter.uuid === filterUUID) {
          if (tagType === 'lastControlMonthsAgo') {
            filter.filters.lastControlMonthsAgo = null
          } else if (tagType === 'zonesSelected') {
            filter.filters[tagType] = filter.filters[tagType].filter(zone => zone.name !== tagValue)
          } else {
            filter.filters[tagType] = filter.filters[tagType].filter(tag => tag !== tagValue)
          }

          const filterHasNoTag =
            (!filter.filters.countriesFiltered || !filter.filters.countriesFiltered.length) &&
            (!filter.filters.fleetSegmentsFiltered || !filter.filters.fleetSegmentsFiltered.length) &&
            (!filter.filters.gearsFiltered || !filter.filters.gearsFiltered.length) &&
            (!filter.filters.speciesFiltered || !filter.filters.speciesFiltered.length) &&
            (!filter.filters.districtsFiltered || !filter.filters.districtsFiltered.length) &&
            (!filter.filters.vesselsSizeValuesChecked || !filter.filters.vesselsSizeValuesChecked.length) &&
            !filter.filters.lastControlMonthsAgo &&
            (!filter.filters.zonesSelected || !filter.filters.zonesSelected.length)

          if (filterHasNoTag) {
            return filtersPile
          }
        }

        return [...filtersPile, filter as VesselFilter]
      }, [])

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
    setNonFilteredVesselsAreHidden(state, action) {
      state.nonFilteredVesselsAreHidden = action.payload
      window.localStorage.setItem(nonFilteredVesselsAreHiddenLocalStorageKey, JSON.stringify(action.payload))
    },

    /**
     * Show a given filter
     * @function showFilter
     * @memberOf FilterReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The filter UUID
     */
    showFilter(state, action) {
      const uuidToShow = action.payload

      state.filters = state.filters.map(filter => ({ ...filter, showed: filter.uuid === uuidToShow }))
      window.localStorage.setItem(vesselsFiltersLocalStorageKey, JSON.stringify(state.filters))
    }
  }
})

export const { addFilter, hideFilters, removeFilter, removeTagFromFilter, setNonFilteredVesselsAreHidden, showFilter } =
  filterSlice.actions

export const filterReducer = filterSlice.reducer
