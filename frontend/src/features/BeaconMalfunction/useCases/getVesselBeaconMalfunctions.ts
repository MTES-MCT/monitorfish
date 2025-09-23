import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { openBeaconMalfunction } from './openBeaconMalfunction'
import {
  loadVesselBeaconMalfunctions,
  resetVesselBeaconMalfunctionsResumeAndHistory,
  setVesselBeaconMalfunctionsResumeAndHistory
} from '../../../domain/shared_slices/BeaconMalfunction'
import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'

export const getVesselBeaconMalfunctions = (isFromUserAction: boolean) => async (dispatch, getState) => {
  const { selectedVessel } = getState().vessel

  const { loadingVesselBeaconMalfunctions, openedBeaconMalfunction, vesselBeaconMalfunctionsFromDate } =
    getState().beaconMalfunction

  if (!selectedVessel?.vesselId || !vesselBeaconMalfunctionsFromDate || loadingVesselBeaconMalfunctions) {
    dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())

    return
  }

  if (isFromUserAction) {
    dispatch(loadVesselBeaconMalfunctions())
    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
  }

  try {
    const vesselBeaconsMalfunctions = await dispatch(
      beaconMalfunctionApi.endpoints.getVesselBeaconsMalfunctions.initiate(
        { fromDate: vesselBeaconMalfunctionsFromDate, vesselId: selectedVessel.vesselId },
        RTK_FORCE_REFETCH_QUERY_OPTIONS
      )
    ).unwrap()

    dispatch(
      setVesselBeaconMalfunctionsResumeAndHistory({
        ...vesselBeaconsMalfunctions,
        vesselIdentity: extractVesselIdentityProps(selectedVessel)
      })
    )

    if (openedBeaconMalfunction) {
      dispatch(openBeaconMalfunction(openedBeaconMalfunction, isFromUserAction))
    }
  } catch (error) {
    dispatch(
      displayOrLogError(
        error,
        () => getVesselBeaconMalfunctions(isFromUserAction),
        isFromUserAction,
        DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
      )
    )
    dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  }
}
