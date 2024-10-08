import { addReportingFromAPI } from '@api/reporting'
import { getVesselReportings } from '@features/Reporting/useCases/getVesselReportings'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { addVesselReporting } from '../../Vessel/slice'
import { mainWindowReportingActions } from '../mainWindowReporting.slice'

import type { ReportingCreation } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const addReporting =
  (newReporting: ReportingCreation): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel

    try {
      const reporting = await addReportingFromAPI(newReporting)

      dispatch(mainWindowReportingActions.addReportingToCurrentReportings(reporting))
      dispatch(
        addVesselReporting({
          reportingType: newReporting?.type,
          vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
        })
      )
      dispatch(renderVesselFeatures())
      await dispatch(getVesselReportings(true))
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
