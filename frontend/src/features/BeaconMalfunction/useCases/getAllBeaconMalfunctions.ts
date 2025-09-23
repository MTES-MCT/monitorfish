import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { setBeaconMalfunctions } from '../../../domain/shared_slices/BeaconMalfunction'

import type { MainAppThunk } from '@store'

export const getAllBeaconMalfunctions = (): MainAppThunk<Promise<void>> => async dispatch => {
  try {
    const beaconMalfunctions = await dispatch(
      beaconMalfunctionApi.endpoints.getAllBeaconMalfunctions.initiate(undefined, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()

    dispatch(setBeaconMalfunctions(beaconMalfunctions))
  } catch (err) {
    dispatch(
      addSideWindowBanner({
        children: (err as Error).message,
        closingDelay: 3000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  }
}
