import { ReportingOriginActor } from '../../../../domain/entities/reporting'

import type { ControlUnit } from '../../../../domain/types/controlUnit'
import type { ReportingUpdate } from '../../../../domain/types/reporting'
import type { Option } from '@mtes-mct/monitor-ui'

export function getReportingValueErrors(reportingValue: ReportingUpdate) {
  const {
    authorContact: authorContactField,
    authorTrigram: authorTrigramField,
    controlUnitId: controlUnitIdField,
    reportingActor: reportingActorField,
    title: titleField
  } = reportingValue

  let nextErrorsFields: string[] = []

  if (!titleField) {
    nextErrorsFields = nextErrorsFields.concat('title')
  }

  if (!authorTrigramField) {
    nextErrorsFields = nextErrorsFields.concat('authorTrigram')
  }

  switch (reportingActorField) {
    case ReportingOriginActor.UNIT.code: {
      if (!controlUnitIdField) {
        nextErrorsFields = nextErrorsFields.concat('controlUnitId')
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

export const mapControlUnitsToUniqueSortedIdsAsOptions = (controlUnits: ControlUnit[]): Option<number>[] =>
  Array.from(controlUnits)
    .sort((a, b) => Number(b.name) - Number(a.name))
    .map(controlUnit => ({
      label: `${controlUnit.name} (${controlUnit.administration})`,
      value: controlUnit.id
    }))
