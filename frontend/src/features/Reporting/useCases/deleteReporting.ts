import { RtkCacheTagType } from '@api/constants'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { vesselApi } from '@features/Vessel/vesselApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { removeVesselReporting } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { ReportingType } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const deleteReporting =
  (id: number, reportingType: ReportingType): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel

    try {
      await dispatch(reportingApi.endpoints.deleteReporting.initiate(id)).unwrap()

      dispatch(vesselApi.util.invalidateTags([RtkCacheTagType.Reportings]))

      dispatch(
        removeVesselReporting({
          reportingType,
          vesselFeatureId: VesselFeature.getVesselFeatureId(selectedVesselIdentity)
        })
      )

      dispatch(renderVesselFeatures())
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
