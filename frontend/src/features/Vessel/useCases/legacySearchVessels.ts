import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { Vessel } from '@features/Vessel/Vessel.types'
import { vesselApi } from '@features/Vessel/vesselApi'

import { setError } from '../../../domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

/** @deprecated Use Redux RTK `legacySearchVessels()` query. */
export const legacySearchVessels =
  (searched: string): MainAppThunk<Promise<Vessel.VesselIdentity[] | undefined>> =>
  async dispatch => {
    try {
      return await dispatch(
        vesselApi.endpoints.searchVessels.initiate({ searched }, RTK_FORCE_REFETCH_QUERY_OPTIONS)
      ).unwrap()
    } catch (error) {
      dispatch(setError(error))

      return undefined
    }
  }
