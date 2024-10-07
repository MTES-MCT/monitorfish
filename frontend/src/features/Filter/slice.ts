import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'

import type { FilterTag, VesselFilter } from './types'
import type { PayloadAction } from '@reduxjs/toolkit'

/**
 * @deprecated Replaced by `persistReducer`.
 * See and `reducer.ts` and `MAIN_PERSISTOR_FILTER_MIGRATIONS`
 */
export const vesselsFiltersLocalStorageKey = 'vesselsFilters'

/**
 * @deprecated Replaced by `persistReducer`.
 * See and `reducer.ts` and `MAIN_PERSISTOR_FILTER_MIGRATIONS`
 */
export const nonFilteredVesselsAreHiddenLocalStorageKey = 'nonFilteredVesselsAreHidden'

export type FilterState = {
  filters: VesselFilter[]
  nonFilteredVesselsAreHidden: boolean
}
export const INITIAL_STATE: FilterState = {
  // TODO Remove after init of `persistReducer` (used for migration from localstorage).
  filters: getLocalStorageState([], vesselsFiltersLocalStorageKey),
  // TODO Remove after init of `persistReducer` (used for migration from localstorage).
  nonFilteredVesselsAreHidden: getLocalStorageState(false, nonFilteredVesselsAreHiddenLocalStorageKey)
}
const filterSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'filter',
  reducers: {
    filterAdded(state, action: PayloadAction<VesselFilter>) {
      state.filters = state.filters.map(filter => {
        filter.showed = false

        return filter
      })
      state.filters = state.filters.concat(action.payload)
    },

    filterRemoved(state, action: PayloadAction<string>) {
      const uuidToRemove = action.payload
      state.filters = state.filters.filter(filter => filter.uuid !== uuidToRemove)
    },

    filtersHidden(state) {
      state.filters = state.filters.map(filter => ({ ...filter, showed: false }))

      // prevents no filters shown & nonFilteredVesselsAreHidden = true leading to empty map
      state.nonFilteredVesselsAreHidden = false
    },

    filterShowed(state, action: PayloadAction<string>) {
      const uuidToShow = action.payload

      state.filters = state.filters.map(filter => ({ ...filter, showed: filter.uuid === uuidToShow }))
    },

    /**
     * Remove tag from a given filter and delete filter if the filter contains no tag
     */
    filterTagRemoved(state, action: PayloadAction<FilterTag>) {
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
    },

    setNonFilteredVesselsAreHidden(state, action: PayloadAction<boolean>) {
      state.nonFilteredVesselsAreHidden = action.payload
    }
  }
})

export const {
  filterAdded,
  filterRemoved,
  filtersHidden,
  filterShowed,
  filterTagRemoved,
  setNonFilteredVesselsAreHidden
} = filterSlice.actions

export const filterReducer = filterSlice.reducer
