import { PendingAlertValueType } from '@features/Alert/constants'
import { ReportingType } from '@features/Reporting/types'
import { deleteReporting } from '@features/Reporting/useCases/deleteReporting'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { removeVesselReporting } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { Reporting } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const archiveReporting =
  (reporting: Reporting.Reporting): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel

    try {
      if (
        reporting.type === ReportingType.ALERT &&
        reporting.value.type === PendingAlertValueType.MISSING_FAR_48_HOURS_ALERT
      ) {
        await dispatch(deleteReporting(reporting.id, reporting.type))

        return
      }

      await dispatch(reportingApi.endpoints.archiveReporting.initiate(reporting.id)).unwrap()

      dispatch(
        removeVesselReporting({
          reportingType: reporting.type,
          vesselFeatureId: VesselFeature.getVesselFeatureId(selectedVesselIdentity)
        })
      )

      dispatch(renderVesselFeatures())
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => archiveReporting(reporting),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
    }
  }
