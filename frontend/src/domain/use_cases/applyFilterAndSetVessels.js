import { setError } from '../shared_slices/Global'
import { setUnfilteredVessels, setFilteredVesselsFeatures } from '../shared_slices/Vessel'
import getFilteredVessels from './getFilteredVessels'
import NoVesselsInFilterError from '../../errors/NoVesselsInFilterError'

export const loadVesselsAndApplyFilter = (vessels) => (dispatch, getState) => {
  dispatch(setUnfilteredVessels(vessels))
  dispatch(applyFilterToVessels())
}

export const applyFilterToVessels = () => (dispatch, getState) => {
  const state = getState()
  const _showedFilter = state.filter?.filters?.find(filter => filter.showed)
  const vessels = state.vessel.vesselsgeojson
  if (!_showedFilter) {
    // TODO: just update isFiltered, don't recompute new attributes
    return dispatch(setUnfilteredVessels(vessels))
  }

  return dispatch(getFilteredVessels(vessels, _showedFilter.filters))
    .then(filteredVessels => {
      if (!filteredVessels?.length) {
        dispatch(setError(new NoVesselsInFilterError('Il n\'y a pas de navire dans ce filtre')))
      }
      const filteredVesselsUids = filteredVessels.map(vessel => vessel.vesselId)
      dispatch(setFilteredVesselsFeatures(filteredVesselsUids))
    })
}
