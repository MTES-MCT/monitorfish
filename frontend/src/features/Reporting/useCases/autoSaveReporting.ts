import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { addReporting } from '@features/Reporting/useCases/addReporting'
import { buildReportingCreation } from '@features/Reporting/useCases/utils'
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
    const identity = autoSavedReporting ? extractVesselIdentityProps(autoSavedReporting) : vesselIdentity
    const previousType = autoSavedReporting?.type ?? nextReporting.type

    if (effectiveId && identity) {
      return await dispatch(updateReporting(identity, effectiveId, nextReporting, previousType, windowContext))
    }

    return await dispatch(addReporting(buildReportingCreation(nextReporting, vesselIdentity)))
  }
