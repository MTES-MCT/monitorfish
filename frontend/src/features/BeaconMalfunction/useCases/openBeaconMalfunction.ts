import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'

import { setOpenedBeaconMalfunction } from '../../../domain/shared_slices/BeaconMalfunction'

import type { BeaconMalfunctionResumeAndDetails } from '@features/BeaconMalfunction/types'
import type { MainAppThunk } from '@store'

export const openBeaconMalfunction =
  (beaconMalfunction: BeaconMalfunctionResumeAndDetails, isFromUserAction: boolean): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const previousBeaconMalfunction = getState().beaconMalfunction.openedBeaconMalfunction

    dispatch(
      setOpenedBeaconMalfunction({
        beaconMalfunction,
        showTab: isFromUserAction
      })
    )
    try {
      const beaconMalfunctionWithDetails = await dispatch(
        beaconMalfunctionApi.endpoints.getBeaconMalfunction.initiate(
          beaconMalfunction.beaconMalfunction?.id as number,
          RTK_FORCE_REFETCH_QUERY_OPTIONS
        )
      ).unwrap()

      dispatch(
        setOpenedBeaconMalfunction({
          beaconMalfunction: beaconMalfunctionWithDetails,
          showTab: isFromUserAction
        })
      )
    } catch (error) {
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 6000,
          isClosable: true,
          level: Level.ERROR,
          withAutomaticClosing: true
        })
      )
      dispatch(
        setOpenedBeaconMalfunction({
          beaconMalfunction: previousBeaconMalfunction,
          showTab: isFromUserAction
        })
      )
    }
  }
