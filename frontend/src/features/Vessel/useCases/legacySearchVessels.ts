import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Vessel } from '@features/Vessel/Vessel.types'
import { vesselApi } from '@features/Vessel/vesselApi'
import { Level } from '@mtes-mct/monitor-ui'

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
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 3000,
          isClosable: true,
          isFixed: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )

      return undefined
    }
  }
