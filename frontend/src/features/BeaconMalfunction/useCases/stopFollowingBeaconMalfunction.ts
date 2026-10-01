import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { removeLocalBeaconMalfunction } from '../../../domain/shared_slices/BeaconMalfunction'

import type { MainAppThunk } from '@store'

export const stopFollowingBeaconMalfunction =
  (beaconMalfunctionId: number): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await dispatch(
        beaconMalfunctionApi.endpoints.updateBeaconMalfunctionIsFollowed.initiate({
          id: beaconMalfunctionId,
          isFollowed: false
        })
      ).unwrap()

      dispatch(removeLocalBeaconMalfunction(beaconMalfunctionId))
    } catch (error) {
      dispatch(
        addSideWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
    }
  }
