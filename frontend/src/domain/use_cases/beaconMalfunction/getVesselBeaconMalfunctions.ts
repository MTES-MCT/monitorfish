import openBeaconMalfunction from './openBeaconMalfunction'
import { getVesselBeaconsMalfunctionsFromAPI } from '../../../api/beaconMalfunction'
import { getOnlyVesselIdentityProperties } from '../../entities/vessel/vessel'
import {
  loadVesselBeaconMalfunctions,
  resetVesselBeaconMalfunctionsResumeAndHistory,
  setVesselBeaconMalfunctionsResumeAndHistory
} from '../../shared_slices/BeaconMalfunction'
import { setDisplayedErrors } from '../../shared_slices/DisplayedError'
import { removeError } from '../../shared_slices/Global'
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
    dispatch(setDisplayedErrors({ vesselSidebarError: null }))
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
        error as Error,
        {
          func: getVesselBeaconMalfunctions,
          parameters: [isFromUserAction]
        },
        isFromUserAction,
        'vesselSidebarError'
      )
    )
    dispatch(resetVesselBeaconMalfunctionsResumeAndHistory())
  }
}
