import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { addReporting } from '@features/Reporting/useCases/addReporting'
import { buildReportingCreation } from '@features/Reporting/useCases/utils'

import { updateReporting } from './updateReporting'

import type { WindowContext } from '@api/constants'
import type { FormEditedReporting, Reporting } from '@features/Reporting/types'
import type { MainAppThunk } from '@store'

export const autoSaveReporting =
  (
    nextReporting: FormEditedReporting,
    autoSavedReporting: Reporting.Reporting | undefined,
    editedReportingId: number | undefined,
    windowContext: WindowContext,
    isIUU = false
  ): MainAppThunk<Promise<Reporting.Reporting | undefined>> =>
  async dispatch => {
    if (!CreateOrEditReportingSchema.safeParse(nextReporting).success) {
      return undefined
    }
    const reportingId = editedReportingId ?? autoSavedReporting?.id
    const previousType = autoSavedReporting?.type ?? nextReporting.type

    if (reportingId) {
      return dispatch(updateReporting(reportingId, nextReporting, previousType, windowContext))
    }

    return dispatch(addReporting(buildReportingCreation(nextReporting, isIUU)))
  }
