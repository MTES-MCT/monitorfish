import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import openBeaconMalfunction from './openBeaconMalfunction'
import { getVesselBeaconsMalfunctionsFromAPI } from '../../../api/beaconMalfunction'
import { removeError } from '../../../features/MainWindow/slice'
import { getOnlyVesselIdentityProperties } from '../../entities/vessel/vessel'
import {
  loadVesselBeaconMalfunctions,
  resetVesselBeaconMalfunctionsResumeAndHistory,
  setVesselBeaconMalfunctionsResumeAndHistory
} from '../../shared_slices/BeaconMalfunction'
import { displayedErrorActions } from '../../shared_slices/DisplayedError'
import { displayOrLogError } from '../error/displayOrLogError'

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
    const vesselBeaconsMalfunctions = await getVesselBeaconsMalfunctionsFromAPI(
      selectedVessel.vesselId,
      vesselBeaconMalfunctionsFromDate
    )
    dispatch(
      setVesselBeaconMalfunctionsResumeAndHistory({
        ...vesselBeaconsMalfunctions,
        vesselIdentity: getOnlyVesselIdentityProperties(selectedVessel)
      })
    )

    if (openedBeaconMalfunction) {
      dispatch(openBeaconMalfunction(openedBeaconMalfunction, isFromUserAction))
    }

    dispatch(removeError())
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
