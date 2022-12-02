import NoVesselsInFilterError from '../../../errors/NoVesselsInFilterError'
import { setError } from '../../shared_slices/Global'
import { setAllVesselsAsUnfiltered, setFilteredVesselsFeatures, setVesselsFromAPI } from '../../shared_slices/Vessel'
import getFilteredVessels from './getFilteredVessels'

export const loadVesselsFromAPIAndApplyFilter = lastPositions => dispatch => {
  dispatch(setVesselsFromAPI(lastPositions))
  dispatch(applyFilterToVessels())
}

export const applyFilterToVessels = () => (dispatch, getState) => {
  const showedFilter = getState().filter?.filters?.find(filter => filter.showed)
  const { vessels } = getState().vessel
  if (!showedFilter) {
    return dispatch(setAllVesselsAsUnfiltered())
  }

  return dispatch(getFilteredVessels(vessels, showedFilter.filters)).then(filteredVessels => {
    if (!filteredVessels?.length) {
      dispatch(setError(new NoVesselsInFilterError("Il n'y a pas de navire dans ce filtre")))
    }
    const filteredVesselsUids = filteredVessels.map(vessel => vessel.vesselFeatureId)
    dispatch(setFilteredVesselsFeatures(filteredVesselsUids))
  })
}
