import { ReportingOriginActor } from '@features/Reporting/types/ReportingOriginActor'
import { ReportingType } from '@features/Reporting/types/ReportingType'

import type { FormEditedReporting, InfractionSuspicion, Observation } from '@features/Reporting/types'

export function getFormFields(
  editedOrSavedReporting: InfractionSuspicion | Observation | undefined,
  type: ReportingType.OBSERVATION | ReportingType.INFRACTION_SUSPICION | undefined,
  expirationDate: string | undefined
): FormEditedReporting {
  const reportingType = type ?? ReportingType.INFRACTION_SUSPICION

  const base = {
    authorContact: editedOrSavedReporting?.authorContact ?? undefined,
    controlUnitId: editedOrSavedReporting?.controlUnitId ?? undefined,
    description: editedOrSavedReporting?.description,
    expirationDate,
    reportingActor: editedOrSavedReporting?.reportingActor ?? ReportingOriginActor.OPS,
    title: editedOrSavedReporting?.title ?? ''
  }

  if (reportingType === ReportingType.INFRACTION_SUSPICION) {
    return {
      ...base,
      threatHierarchy: (editedOrSavedReporting as InfractionSuspicion | undefined)?.threatHierarchy,
      type: ReportingType.INFRACTION_SUSPICION
    }
  }

  return {
    ...base,
    type: ReportingType.OBSERVATION
  }
}

export function updateReportingActor(
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<any> | Promise<void>
) {
  return nextReportingActor => {
    setFieldValue('reportingActor', nextReportingActor)

    switch (nextReportingActor) {
      case ReportingOriginActor.OPS: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorContact', undefined)
        break
      }
      case ReportingOriginActor.SIP: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorContact', undefined)
        break
      }
      case ReportingOriginActor.UNIT: {
        break
      }
      case ReportingOriginActor.DML: {
        setFieldValue('controlUnitId', undefined)
        break
      }
      case ReportingOriginActor.DIRM: {
        setFieldValue('controlUnitId', undefined)
        break
      }
      case ReportingOriginActor.OTHER: {
        setFieldValue('controlUnitId', undefined)
        break
      }
      default:
        throw Error('Should not happen')
    }
  }
}
