import { getFilteredVessels } from './getFilteredVessels'
import { setError } from '../../../domain/shared_slices/Global'
import { NoVesselsInFilterError } from '../../../errors/NoVesselsInFilterError'
import { setAllVesselsAsUnfiltered, setFilteredVesselsFeatures, vesselSelectors } from '../slice'

import type { MainAppThunk } from '@store'

export const applyFilterToVessels = (): MainAppThunk => async (dispatch, getState) => {
  const showedFilter = getState().filter?.filters?.find(filter => filter.showed)
  const vessels = vesselSelectors.selectAll(getState().vessel.vessels)
  if (!showedFilter) {
    dispatch(setAllVesselsAsUnfiltered())

    return
  }

  const filteredVessels = await dispatch(getFilteredVessels(vessels, showedFilter.filters))
  if (!filteredVessels?.length) {
    dispatch(setError(new NoVesselsInFilterError("Il n'y a pas de navire dans ce filtre")))

    return
  }

  const filteredVesselsUids = filteredVessels.map(vessel => vessel.vesselFeatureId)
  dispatch(setFilteredVesselsFeatures(filteredVesselsUids))
}
