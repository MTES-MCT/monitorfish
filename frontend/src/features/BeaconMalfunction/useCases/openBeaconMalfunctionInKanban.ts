import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'

import { setOpenedBeaconMalfunctionsInKanban } from '../../../domain/shared_slices/BeaconMalfunction'
import { setError } from '../../../domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

export const openBeaconMalfunctionInKanban =
  (id: number): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      const beaconMalfunctionWithDetails = await dispatch(
        beaconMalfunctionApi.endpoints.getBeaconMalfunction.initiate(id, RTK_FORCE_REFETCH_QUERY_OPTIONS)
      ).unwrap()

      dispatch(setOpenedBeaconMalfunctionsInKanban(beaconMalfunctionWithDetails))
    } catch (error) {
      dispatch(setError(error))
    }
  }
