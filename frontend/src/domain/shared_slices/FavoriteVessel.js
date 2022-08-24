import { createSlice } from '@reduxjs/toolkit'

import { getLocalStorageState } from '../../utils'
import { getOnlyVesselIdentityProperties, getVesselId, vesselsAreEquals } from '../entities/vessel'

/* eslint-disable */
/** @namespace FavoriteVesselReducer */
const FavoriteVesselReducer = null
/* eslint-enable */

const favoriteVesselsLocalStorageKey = 'favoriteVessels'

const favoriteVesselsSlice = createSlice({
  initialState: {
    /** @type {Vessel[]} favorites */
    favorites: getLocalStorageState([], favoriteVesselsLocalStorageKey),
  },
  name: 'favoriteVessels',
  reducers: {
    /**
     * Add a new vessel to the favorite list
     * @function addVesselToFavorites
     * @memberOf FavoriteVesselReducer
     * @param {Object=} state
     * @param {{payload: Vessel}} action - The vessel
     */
    addVesselToFavorites(state, action) {
      const newFavorite = getOnlyVesselIdentityProperties(action.payload)

      // Remove vessel if found
      state.favorites = state.favorites.filter(favoriteVessel => !vesselsAreEquals(favoriteVessel, newFavorite))

      // Add vessel
      state.favorites = state.favorites.concat(newFavorite)
      window.localStorage.setItem(favoriteVesselsLocalStorageKey, JSON.stringify(state.favorites))
    },
    /**
     * Remove a given vessel from the favorite list
     * @function removeVesselToFavorites
     * @memberOf FavoriteVesselReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The vessel id
     */
    removeVesselFromFavorites(state, action) {
      state.favorites = state.favorites.filter(favoriteVessel => getVesselId(favoriteVessel) !== action.payload)
      window.localStorage.setItem(favoriteVesselsLocalStorageKey, JSON.stringify(state.favorites))
    },
  },
})

export const { addVesselToFavorites, removeVesselFromFavorites } = favoriteVesselsSlice.actions

export default favoriteVesselsSlice.reducer
