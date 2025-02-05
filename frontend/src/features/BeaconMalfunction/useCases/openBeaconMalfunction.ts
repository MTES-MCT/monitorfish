import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'

import { setOpenedBeaconMalfunction } from '../../../domain/shared_slices/BeaconMalfunction'
import { setError } from '../../../domain/shared_slices/Global'

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
      dispatch(setError(error))
      dispatch(
        setOpenedBeaconMalfunction({
          beaconMalfunction: previousBeaconMalfunction,
          showTab: isFromUserAction
        })
      )
    }
  }
