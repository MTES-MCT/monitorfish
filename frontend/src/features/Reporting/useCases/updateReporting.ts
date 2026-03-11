import { WindowContext } from '@api/constants'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { Vessel } from '@features/Vessel/Vessel.types'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { addVesselReporting, removeVesselReporting } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import {type FormEditedReporting, type Reporting} from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const updateReporting =
  (
    vesselIdentity: Vessel.VesselIdentity,
    id: number,
    nextReportingFormData: FormEditedReporting,
    previousReportingType: ReportingType,
    windowContext: WindowContext
  ): MainAppThunk<Promise<Reporting.Reporting | undefined>> =>
  async dispatch => {
    try {
      const { isUnknownVessel: _isUnknownVessel, ...reportingData } = nextReportingFormData
      const updatedReporting = await dispatch(
        reportingApi.endpoints.updateReporting.initiate({
          id,
          nextReportingFormData: reportingData as FormEditedReporting
        })
      ).unwrap()

      // We update the reportings of the last positions vessels state
      if (previousReportingType !== nextReportingFormData.type) {
        const vesselFeatureId = VesselFeature.getVesselFeatureId(vesselIdentity)

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

      return updatedReporting
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => updateReporting(vesselIdentity, id, nextReportingFormData, previousReportingType, windowContext),
          true,
          windowContext === WindowContext.MainWindow
            ? DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
            : DisplayedErrorKey.SIDE_WINDOW_REPORTING_FORM_ERROR,
          windowContext
        )
      )

      return undefined
    }
  }
