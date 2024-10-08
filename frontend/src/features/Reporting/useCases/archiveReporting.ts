import { RtkCacheTagType } from '@api/constants'
import { archiveReportingFromAPI } from '@api/reporting'
import { ReportingType } from '@features/Reporting/types'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { vesselApi } from '@features/Vessel/vesselApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { removeVesselReporting } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { MainAppThunk } from '@store'

export const archiveReporting =
  (id: number, type: ReportingType): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel

    try {
      await archiveReportingFromAPI(id)
      dispatch(reportingApi.util.invalidateTags([RtkCacheTagType.Reportings]))
      dispatch(vesselApi.util.invalidateTags([RtkCacheTagType.Reportings]))

      dispatch(
        removeVesselReporting({
          reportingType: type,
          vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
        })
      )

      dispatch(renderVesselFeatures())
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => archiveReporting(id, type),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
    }
  }
