import { getVesselReportingsFromAPI } from '@api/vessel'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { removeError } from '../../../domain/shared_slices/Global'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { loadReporting, resetSelectedVesselReportings, setSelectedVesselReportings } from '../slice'

export const getVesselReportings = (isLoaderShowed: boolean) => async (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel
  const { archivedReportingsFromDate, isLoadingReporting } = getState().reporting
  if (!selectedVesselIdentity || isLoadingReporting) {
    return
  }

  if (isLoaderShowed) {
    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
    dispatch(loadReporting())
  }

  try {
    const nextSelectedVesselReportings = await getVesselReportingsFromAPI(
      selectedVesselIdentity,
      archivedReportingsFromDate
    )
    dispatch(
      setSelectedVesselReportings({
        selectedVesselReportings: nextSelectedVesselReportings,
        vesselIdentity: selectedVesselIdentity
      })
    )

    dispatch(removeError())
  } catch (error) {
    dispatch(
      displayOrLogError(
        error as Error,
        () => getVesselReportings(isLoaderShowed),
        isLoaderShowed,
        DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
      )
    )
    dispatch(resetSelectedVesselReportings())
  }
}
