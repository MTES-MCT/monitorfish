// TODO Move that into Vessel slice, or into a User slice if there are other per-user customizable data.

import { extractVesselIdentityProps, getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { createSlice } from '@reduxjs/toolkit'

import { vesselsAreEquals } from '../../domain/entities/vessel/vessel'
import { getLocalStorageState } from '../../utils'

import type { Vessel } from '@features/Vessel/Vessel.types'

const FAVORITE_VESSELS_LOCAL_STORAGE_KEY = 'favoriteVessels'

export type FavoriteVesselState = {
  favorites: Vessel.VesselIdentity[]
}
const INITIAL_STATE: FavoriteVesselState = {
  favorites: getLocalStorageState([], FAVORITE_VESSELS_LOCAL_STORAGE_KEY)
}

const favoriteVesselSlice = createSlice({
  initialState: INITIAL_STATE,
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
      const newFavorite = extractVesselIdentityProps(action.payload)

      // Remove vessel if found
      state.favorites = state.favorites.filter(favoriteVessel => !vesselsAreEquals(favoriteVessel, newFavorite))

      // Add vessel
      state.favorites = state.favorites.concat(newFavorite)
      window.localStorage.setItem(FAVORITE_VESSELS_LOCAL_STORAGE_KEY, JSON.stringify(state.favorites))
    },
    /**
     * Remove a given vessel from the favorite list
     * @function removeVesselToFavorites
     * @memberOf FavoriteVesselReducer
     * @param {Object=} state
     * @param {{payload: string}} action - The vessel id
     */
    removeVesselFromFavorites(state, action) {
      state.favorites = state.favorites.filter(
        favoriteVessel => getVesselCompositeIdentifier(favoriteVessel) !== action.payload
      )
      window.localStorage.setItem(FAVORITE_VESSELS_LOCAL_STORAGE_KEY, JSON.stringify(state.favorites))
    }
  }
})

export const { addVesselToFavorites, removeVesselFromFavorites } = favoriteVesselSlice.actions

export const favoriteVesselReducer = favoriteVesselSlice.reducer
