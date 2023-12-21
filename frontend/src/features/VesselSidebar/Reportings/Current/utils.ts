import { customDayjs } from '@mtes-mct/monitor-ui'

import { ReportingOriginActor } from '../../../../domain/entities/reporting'
import { Reporting } from '../../../../domain/types/reporting'

import type { LegacyControlUnit } from '../../../../domain/types/legacyControlUnit'
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

export const mapControlUnitsToUniqueSortedIdsAsOptions = (
  controlUnits: LegacyControlUnit.LegacyControlUnit[]
): Option<number>[] =>
  Array.from(controlUnits)
    .sort((a, b) => Number(b.name) - Number(a.name))
    .map(controlUnit => ({
      label: `${controlUnit.name} (${controlUnit.administration})`,
      value: controlUnit.id
    }))

/**
 * Returns:
 * -  `1`: the second argument is before the second argument
 * - `-1`: the first argument is before the second argument
 */
export function sortByValidationOrCreationDateDesc(a: Reporting, b: Reporting) {
  if (a.validationDate && b.validationDate) {
    return customDayjs(a.validationDate).isBefore(customDayjs(b.validationDate)) ? 1 : -1
  }

  return customDayjs(a.creationDate).isBefore(customDayjs(b.creationDate)) ? 1 : -1
}
