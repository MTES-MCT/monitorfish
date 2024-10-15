import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { addVesselReporting } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { ReportingCreation } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const addReporting =
  (newReporting: ReportingCreation): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel

    try {
      await dispatch(reportingApi.endpoints.createReporting.initiate(newReporting)).unwrap()

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
