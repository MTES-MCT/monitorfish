import { updateReportingFromAPI } from '@api/reporting'
import { ReportingType } from '@features/Reporting/types'
import { getVesselReportings } from '@features/Reporting/useCases/getVesselReportings'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { addVesselReporting, removeVesselReporting } from '../../../domain/shared_slices/Vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { removeCurrentReporting, updateCurrentReporting } from '../slice'

import type { VesselIdentity } from '../../../domain/entities/vessel/types'
import type { EditedReporting, InfractionSuspicionReporting } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const updateReporting =
  (
    selectedVesselIdentity: VesselIdentity,
    id: number,
    nextReporting: EditedReporting,
    previousReportingType: ReportingType,
    isFromSideWindow: boolean
  ): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { vesselIdentity } = getState().reporting

    try {
      const updatedReporting = await updateReportingFromAPI(id, nextReporting)

      if (nextReporting.type === ReportingType.INFRACTION_SUSPICION) {
        dispatch(updateCurrentReporting(updatedReporting as InfractionSuspicionReporting))
      }

      if (
        nextReporting.type === ReportingType.OBSERVATION &&
        previousReportingType === ReportingType.INFRACTION_SUSPICION
      ) {
        dispatch(removeCurrentReporting(id))
      }

      // We update the reportings of the last positions vessels state
      if (previousReportingType !== nextReporting.type) {
        const vesselFeatureId = Vessel.getVesselFeatureId(selectedVesselIdentity)

        dispatch(
          removeVesselReporting({
            reportingType: previousReportingType,
            vesselFeatureId
          })
        )
        dispatch(
          addVesselReporting({
            reportingType: nextReporting.type,
            vesselFeatureId
          })
        )
      }

      // If the update is done from the Reporting tab of the vessel sidebar
      if (vesselIdentity) {
        await dispatch(getVesselReportings(true))
      }
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => updateReporting(selectedVesselIdentity, id, nextReporting, previousReportingType, isFromSideWindow),
          true,
          isFromSideWindow ? DisplayedErrorKey.SIDE_WINDOW_REPORTING_FORM_ERROR : DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
    }
  }
