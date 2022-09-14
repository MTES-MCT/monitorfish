// TODO Make this state name singular for consistency (even if wrong in English). Extend that principle to props.

import { createSlice } from '@reduxjs/toolkit'

import type { Specy, SpecyGroup } from '../types/specy'

export type SpecyState = {
  species: Specy[]
  // TODO Type this prop.
  speciesByCode: Record<string, Record<string, any>>
  speciesGroups: SpecyGroup[]
}
const INITIAL_STATE: SpecyState = {
  species: [],
  speciesByCode: {},
  speciesGroups: []
}

const speciesSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'species',
  reducers: {
    /**
     * Set the species FAO codes and species groups
     * @function setSpeciesAndSpeciesGroups
     * @memberOf SpeciesReducer
     * @param {Object=} state
     * @param {{payload: SpeciesAndSpeciesGroups}} action - the species
     */
    setSpeciesAndSpeciesGroups(state, action) {
      state.species = action.payload.species
      state.speciesByCode = action.payload.speciesByCode
      state.speciesGroups = action.payload.groups
    }
  }
})

export const { setSpeciesAndSpeciesGroups } = speciesSlice.actions

export const speciesReducer = speciesSlice.reducer
