import { RtkCacheTagType } from '@api/constants'
import { addReportingFromAPI } from '@api/reporting'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { vesselApi } from '@features/Vessel/vesselApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { addVesselReporting } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { ReportingCreation } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const addReporting =
  (newReporting: ReportingCreation): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel

    try {
      await addReportingFromAPI(newReporting)
      dispatch(reportingApi.util.invalidateTags([RtkCacheTagType.Reportings]))
      dispatch(vesselApi.util.invalidateTags([RtkCacheTagType.Reportings]))

      dispatch(
        addVesselReporting({
          reportingType: newReporting?.type,
          vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
        })
      )

      dispatch(renderVesselFeatures())
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => addReporting(newReporting),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
    }
  }
