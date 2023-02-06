import { ReportingOriginActor } from '../../../../domain/entities/reporting'

import type { ReportingUpdate } from '../../../../domain/types/reporting'

export function getReportingValueErrors(reportingValue: ReportingUpdate) {
  const {
    authorContact: authorContactField,
    authorTrigram: authorTrigramField,
    reportingActor: reportingActorField,
    title: titleField,
    unit: unitField
  } = reportingValue

  let nextErrorsFields: string[] = []

  if (!titleField) {
    nextErrorsFields = nextErrorsFields.concat('title')
  }

  if (!authorTrigramField) {
    nextErrorsFields = nextErrorsFields.concat('authorTrigramField')
  }

  switch (reportingActorField) {
    case ReportingOriginActor.UNIT.code: {
      if (!unitField) {
        nextErrorsFields = nextErrorsFields.concat('unit')
      }
      break
    }
    case ReportingOriginActor.DML.code: {
      if (!authorContactField) {
        nextErrorsFields = nextErrorsFields.concat('authorContact')
      }
      break
    }
    case ReportingOriginActor.DIRM.code: {
      if (!authorContactField) {
        nextErrorsFields = nextErrorsFields.concat('authorContact')
      }
      break
    }
    case ReportingOriginActor.OTHER.code: {
      if (!authorContactField) {
        nextErrorsFields = nextErrorsFields.concat('authorContact')
      }
      break
    }
    default:
  }

  return nextErrorsFields
}
