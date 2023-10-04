import { setError } from '../../../domain/shared_slices/Global'
import { setAllVesselsAsUnfiltered, setFilteredVesselsFeatures } from '../../../domain/shared_slices/Vessel'
import { getFilteredVessels } from '../../../domain/use_cases/vessel/getFilteredVessels'
import NoVesselsInFilterError from '../../../errors/NoVesselsInFilterError'

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
