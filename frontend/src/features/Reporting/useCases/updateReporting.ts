import { RtkCacheTagType } from '@api/constants'
import { updateReportingFromAPI } from '@api/reporting'
import { ReportingType } from '@features/Reporting/types'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { vesselApi } from '@features/Vessel/vesselApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { Vessel } from '../../../domain/entities/vessel/vessel'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { addVesselReporting, removeVesselReporting } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { VesselIdentity } from '../../../domain/entities/vessel/types'
import type { EditedReporting } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const updateReporting =
  (
    selectedVesselIdentity: VesselIdentity,
    id: number,
    nextReporting: EditedReporting,
    previousReportingType: ReportingType,
    isFromSideWindow: boolean
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await updateReportingFromAPI(id, nextReporting)
      dispatch(reportingApi.util.invalidateTags([RtkCacheTagType.Reportings]))
      dispatch(vesselApi.util.invalidateTags([RtkCacheTagType.Reportings]))

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

        dispatch(renderVesselFeatures())
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
