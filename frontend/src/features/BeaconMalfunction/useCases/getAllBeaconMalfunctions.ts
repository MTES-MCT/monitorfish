import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'

import { setBeaconMalfunctions } from '../../../domain/shared_slices/BeaconMalfunction'
import { setError } from '../../../domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

export const getAllBeaconMalfunctions = (): MainAppThunk<Promise<void>> => async dispatch => {
  try {
    const beaconMalfunctions = await dispatch(
      beaconMalfunctionApi.endpoints.getAllBeaconMalfunctions.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()

    dispatch(setBeaconMalfunctions(beaconMalfunctions))
  } catch (err) {
    dispatch(setError(err))
  }
}
