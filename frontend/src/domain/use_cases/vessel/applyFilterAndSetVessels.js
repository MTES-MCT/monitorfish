import { setError } from '../../shared_slices/Global'
import { setVesselsFromAPI, setAllVesselsAsUnfiltered, setFilteredVesselsFeatures } from '../../shared_slices/Vessel'
import getFilteredVessels from './getFilteredVessels'
import NoVesselsInFilterError from '../../../errors/NoVesselsInFilterError'

export const loadVesselsFromAPIAndApplyFilter = vessels => (dispatch, getState) => {
  dispatch(setVesselsFromAPI(vessels))
  dispatch(applyFilterToVessels())
}

export const applyFilterToVessels = () => (dispatch, getState) => {
  const state = getState()
  const _showedFilter = state.filter?.filters?.find(filter => filter.showed)
  const { vessels } = state.vessel
  if (!_showedFilter) {
    return dispatch(setAllVesselsAsUnfiltered())
  }

  return dispatch(getFilteredVessels(vessels, _showedFilter.filters))
    .then(filteredVessels => {
      if (!filteredVessels?.length) {
        dispatch(setError(new NoVesselsInFilterError('Il n\'y a pas de navire dans ce filtre')))
      }
      const filteredVesselsUids = filteredVessels.map(vessel => vessel.vesselFeatureId)
      dispatch(setFilteredVesselsFeatures(filteredVesselsUids))
    })
}
