import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace SpeciesReducer */
const SpeciesReducer = null
/* eslint-enable */

const speciesSlice = createSlice({
  initialState: {
    /** @type {Species[]} */
    species: [],

    /** @type {Map<string, Species>} */
    speciesByCode: {},
    speciesGroups: [],
  },
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
    },
  },
})

export const { setSpeciesAndSpeciesGroups } = speciesSlice.actions

export default speciesSlice.reducer
