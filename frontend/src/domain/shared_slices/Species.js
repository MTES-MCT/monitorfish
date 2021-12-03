import { createSlice } from '@reduxjs/toolkit'

/* eslint-disable */
/** @namespace SpeciesReducer */
const SpeciesReducer = null
/* eslint-enable */

const speciesSlice = createSlice({
  name: 'species',
  initialState: {
    species: [],
    speciesGroups: []
  },
  reducers: {
    /**
     * Set the species FAO codes and species groups
     * @function setSpeciesAndSpeciesGroups
     * @memberOf SpeciesReducer
     * @param {Object=} state
     * @param {{payload: SpeciesAndSpeciesGroups}} action - the species
     */
    setSpeciesAndSpeciesGroups (state, action) {
      state.species = action.payload.species
      state.speciesGroups = action.payload.groups
    }
  }
})

export const {
  setSpeciesAndSpeciesGroups
} = speciesSlice.actions

export default speciesSlice.reducer
