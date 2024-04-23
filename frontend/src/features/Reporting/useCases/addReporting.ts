import { addReportingFromAPI } from '@api/reporting'
import { getVesselReportings } from '@features/Reporting/useCases/getVesselReportings'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { logSoftError } from '@mtes-mct/monitor-ui'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { addVesselReporting } from '../../../domain/shared_slices/Vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { addReportingToCurrentReportings } from '../slice'

import type { ReportingCreation } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const addReporting =
  (newReporting: ReportingCreation): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel
    // TODO Can this case happen? Is it the right way to handle it?
    if (!selectedVesselIdentity) {
      logSoftError({
        message: '`selectedVesselIdentity` is null.',
        userMessage: 'Aucun navire sélectionné pour ajouter un signalement.'
      })

      return
    }

    try {
      const reporting = await addReportingFromAPI(newReporting)

      dispatch(addReportingToCurrentReportings(reporting))
      dispatch(
        addVesselReporting({
          reportingType: newReporting?.type,
          vesselFeatureId: Vessel.getVesselFeatureId(selectedVesselIdentity)
        })
      )
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
