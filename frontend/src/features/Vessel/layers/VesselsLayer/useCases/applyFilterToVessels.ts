import { setError } from '../../../../../domain/shared_slices/Global'
import { getFilteredVessels } from '../../../../../domain/use_cases/vessel/getFilteredVessels'
import NoVesselsInFilterError from '../../../../../errors/NoVesselsInFilterError'
import { setAllVesselsAsUnfiltered, setFilteredVesselsFeatures, vesselsAdapter } from '../../../slice'

import type { MainAppThunk } from '@store'

export const applyFilterToVessels = (): MainAppThunk => async (dispatch, getState) => {
  const showedFilter = getState().filter?.filters?.find(filter => filter.showed)
  const vesselsSelector = getState().vessel.vessels
  if (!vesselsSelector) {
    return
  }
  const vessels = vesselsAdapter.getSelectors().selectAll(vesselsSelector)
  if (!showedFilter) {
    dispatch(setAllVesselsAsUnfiltered())
  }

  const filteredVessels = await dispatch(getFilteredVessels(vessels, showedFilter.filters))
  if (!filteredVessels?.length) {
    dispatch(setError(new NoVesselsInFilterError("Il n'y a pas de navire dans ce filtre")))
  }

  const filteredVesselsUids = filteredVessels.map(vessel => vessel.vesselFeatureId)
  dispatch(setFilteredVesselsFeatures(filteredVesselsUids))
}
