import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
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

      dispatch(
        removeVesselReporting({
          reportingType,
          vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
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
