import { deleteReportingFromAPI } from '@api/reporting'
import { ReportingType } from '@features/Reporting/types'
import { getVesselReportings } from '@features/Reporting/useCases/getVesselReportings'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { removeVesselReporting } from '../../../domain/shared_slices/Vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { removeReportingsIdsFromCurrentReportings } from '../slice'

import type { MainAppThunk } from '@store'

export const deleteReporting =
  (id: number, reportingType: ReportingType): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel

    try {
      await deleteReportingFromAPI(id)

      dispatch(removeReportingsIdsFromCurrentReportings([id]))
      dispatch(
        removeVesselReporting({
          reportingType,
          vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
        })
      )

      await dispatch(getVesselReportings(true))
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => deleteReporting(id, reportingType),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
    }
  }
