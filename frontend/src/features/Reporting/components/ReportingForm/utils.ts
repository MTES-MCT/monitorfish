import { ReportingOriginActor } from '@features/Reporting/types'

import { ReportingType } from '../../../../domain/types/reporting'

import type { EditedReporting, InfractionSuspicion, Observation } from '../../../../domain/types/reporting'

export function getFormFields(
  editedOrSavedReporting: InfractionSuspicion | Observation | undefined,
  type: ReportingType.OBSERVATION | ReportingType.INFRACTION_SUSPICION | undefined
): EditedReporting {
  const base = {
    authorContact: editedOrSavedReporting?.authorContact ?? undefined,
    authorTrigram: editedOrSavedReporting?.authorTrigram ?? undefined,
    controlUnitId: editedOrSavedReporting?.controlUnitId ?? undefined,
    description: editedOrSavedReporting?.description,
    reportingActor: editedOrSavedReporting?.reportingActor ?? ReportingOriginActor.OPS,
    title: editedOrSavedReporting?.title ?? '',
    type: type ?? ReportingType.INFRACTION_SUSPICION
  }

  if (base.type === ReportingType.INFRACTION_SUSPICION) {
    return {
      ...base,
      natinfCode: (editedOrSavedReporting as InfractionSuspicion)?.natinfCode
    }
  }

  return base
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
        setFieldValue('authorTrigram', undefined)
        break
      }
      case ReportingOriginActor.DML: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorTrigram', undefined)
        break
      }
      case ReportingOriginActor.DIRM: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorTrigram', undefined)
        break
      }
      case ReportingOriginActor.OTHER: {
        setFieldValue('controlUnitId', undefined)
        setFieldValue('authorTrigram', undefined)
        break
      }
      default:
        throw Error('Should not happen')
    }
  }
}

export function getReportingValue(editedReporting: EditedReporting): EditedReporting {
  if (editedReporting.type === ReportingType.INFRACTION_SUSPICION) {
    return {
      ...(editedReporting as InfractionSuspicion),
      natinfCode: (editedReporting as InfractionSuspicion).natinfCode
    }
  }

  return editedReporting
}
