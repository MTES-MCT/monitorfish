import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { reportingApi } from '@features/Reporting/reportingApi'
import { buildReportingCreation } from '@features/Reporting/useCases/utils'
import { addVesselReporting } from '@features/Vessel/slice'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { extractVesselIdentityProps } from '@features/Vessel/utils'

import { updateReporting } from './updateReporting'

import type { WindowContext } from '@api/constants'
import type { FormEditedReporting, Reporting } from '@features/Reporting/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

export const autoSaveReporting =
  (
    nextReporting: FormEditedReporting,
    autoSavedReporting: Reporting.Reporting | undefined,
    editedReportingId: number | undefined,
    vesselIdentity: Vessel.VesselIdentity | undefined,
    windowContext: WindowContext
  ): MainAppThunk<Promise<Reporting.Reporting | undefined>> =>
  async dispatch => {
    if (!CreateOrEditReportingSchema.safeParse(nextReporting).success) {
      return undefined
    }

    const effectiveId = editedReportingId ?? autoSavedReporting?.id
    const effectiveSource = autoSavedReporting

    if (effectiveId && effectiveSource) {
      await dispatch(
        updateReporting(
          extractVesselIdentityProps(effectiveSource),
          effectiveId,
          nextReporting,
          effectiveSource.type,
          windowContext
        )
      )

      return effectiveSource
    }

    if (effectiveId && !effectiveSource) {
      await dispatch(
        reportingApi.endpoints.updateReporting.initiate({
          id: effectiveId,
          nextReportingFormData: nextReporting
        })
      ).unwrap()

      return undefined
    }

    const created = await dispatch(
      reportingApi.endpoints.createReporting.initiate(buildReportingCreation(nextReporting, vesselIdentity))
    ).unwrap()

    dispatch(
      addVesselReporting({
        reportingType: created.type,
        vesselFeatureId: VesselFeature.getVesselFeatureId(vesselIdentity ?? null)
      })
    )
    dispatch(renderVesselFeatures())

    return created
  }
