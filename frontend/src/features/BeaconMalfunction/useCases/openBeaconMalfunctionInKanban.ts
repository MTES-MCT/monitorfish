import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { setOpenedBeaconMalfunctionsInKanban } from '../../../domain/shared_slices/BeaconMalfunction'

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
      dispatch(
        addSideWindowBanner({
          children: (error as Error).message,
          closingDelay: 3000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
