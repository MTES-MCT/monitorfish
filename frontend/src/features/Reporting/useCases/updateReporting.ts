import { WindowContext } from '@api/constants'
import { ReportingType } from '@features/Reporting/types'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
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
    vesselIdentity: VesselIdentity,
    id: number,
    nextReportingFormData: EditedReporting,
    previousReportingType: ReportingType,
    windowContext: WindowContext
  ): MainAppThunk<Promise<void>> =>
  async dispatch => {
    try {
      await dispatch(
        reportingApi.endpoints.updateReporting.initiate({
          id,
          nextReportingFormData
        })
      ).unwrap()

      // We update the reportings of the last positions vessels state
      if (previousReportingType !== nextReportingFormData.type) {
        const vesselFeatureId = Vessel.getVesselFeatureId(vesselIdentity)

        dispatch(
          removeVesselReporting({
            reportingType: previousReportingType,
            vesselFeatureId
          })
        )
        dispatch(
          addVesselReporting({
            reportingType: nextReportingFormData.type,
            vesselFeatureId
          })
        )

        dispatch(renderVesselFeatures())
      }
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => updateReporting(vesselIdentity, id, nextReportingFormData, previousReportingType, windowContext),
          true,
          windowContext === WindowContext.MainWindow
            ? DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
            : DisplayedErrorKey.SIDE_WINDOW_REPORTING_FORM_ERROR
        )
      )
    }
  }
