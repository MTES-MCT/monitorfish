import Fuse from 'fuse.js'
import _ from 'lodash'

import { getAlertNameFromType } from '../../features/side_window/alerts_reportings/utils'
import { Reporting, ReportingType } from '../types/reporting'

type ReportingTypeCharacteristic = {
  code: ReportingType
  inputName: string | null
  // TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
  isInfractionSuspicion: boolean
  // TODO It should be useless now that types are discriminated.
  name: string
}

export const ReportingTypeCharacteristics: Record<ReportingType, ReportingTypeCharacteristic> = {
  ALERT: {
    code: ReportingType.ALERT,
    inputName: null,
    isInfractionSuspicion: true,
    name: 'ALERTE'
  },
  INFRACTION_SUSPICION: {
    code: ReportingType.INFRACTION_SUSPICION,
    inputName: 'Infraction (suspicion)',
    isInfractionSuspicion: true,
    name: "SUSPICION d'INFRACTION"
  },
  OBSERVATION: {
    code: ReportingType.OBSERVATION,
    inputName: 'Observation',
    isInfractionSuspicion: false,
    name: 'OBSERVATION'
  }
}

export const ReportingOriginActor = {
  DIRM: {
    code: 'DIRM',
    name: 'DIRM'
  },
  DML: {
    code: 'DML',
    name: 'DML'
  },
  OPS: {
    code: 'OPS',
    name: 'OPS'
  },
  OTHER: {
    code: 'OTHER',
    name: 'Autre'
  },
  SIP: {
    code: 'SIP',
    name: 'SIP'
  },
  UNIT: {
    code: 'UNIT',
    name: 'Unité'
  }
}

// TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
export const infractionSuspicionReportingTypes = Object.values(ReportingTypeCharacteristics)
  .filter(type => type.isInfractionSuspicion === true)
  .map(type => type.code)

// TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
export const reportingIsAnInfractionSuspicion = (reportingType: ReportingType): boolean =>
  infractionSuspicionReportingTypes.indexOf(reportingType) >= 0

/**
 * Get reporting for each years : Years are keys and reporting are values
 */
// TODO Make that functional.
// TODO Use an object with string keys instead of number ones.
export const getYearsToReportingList = (
  archivedReportingsFromDate: Date,
  reportings: Reporting[]
): Record<number, Reporting> => {
  const nextYearsToReporting = {}
  if (archivedReportingsFromDate) {
    let fromYear = archivedReportingsFromDate.getUTCFullYear() + 1
    const toYear = new Date().getUTCFullYear()
    while (fromYear <= toYear) {
      nextYearsToReporting[fromYear] = []
      fromYear += 1
    }
  }

  reportings.forEach(reporting => {
    if (reporting?.creationDate) {
      const year = new Date(reporting.validationDate || reporting.creationDate).getUTCFullYear()

      if (nextYearsToReporting[year] && nextYearsToReporting[year].length) {
        nextYearsToReporting[year] = nextYearsToReporting[year].concat(reporting)
      } else {
        nextYearsToReporting[year] = [reporting]
      }
    }
  })

  return nextYearsToReporting
}

export const FrenchDMLs = [
  'DML 62/80',
  'DML 76',
  'DML 14',
  'DML 50',
  'DML 35',
  'DML 22',
  'DML 29',
  'DML 56',
  'DML 44',
  'DML 17',
  'DML 33',
  'DML 85',
  'DML 64/40',
  'DML 66/11',
  'DML 34/30',
  'DML 13',
  'DML 83',
  'DML 06',
  'DML 2a',
  'DML 2b',
  'DML 76/27'
]

// TODO Improve typings logic to avoid double switch.
export const getReportingOrigin = (reporting: Reporting, isHovering: boolean): string => {
  if (reporting.type === ReportingType.ALERT) {
    return 'Alerte auto.'
  }

  // eslint-disable-next-line default-case
  switch (reporting.value.reportingActor) {
    case ReportingOriginActor.UNIT.code:
      return `${reporting.value.unit}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.OPS.code:
      return `Pôle OPS (${reporting.value.authorTrigram})`
    case ReportingOriginActor.SIP.code:
      return `Pôle SIP (${reporting.value.authorTrigram})`
  }

  if (reporting.type !== ReportingType.INFRACTION_SUSPICION) {
    return ''
  }

  switch (reporting.value.reportingActor) {
    case ReportingOriginActor.UNIT.code:
      return `${reporting.value.unit}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.OPS.code:
      return `Pôle OPS (${reporting.value.authorTrigram})`
    case ReportingOriginActor.SIP.code:
      return `Pôle SIP (${reporting.value.authorTrigram})`
    case ReportingOriginActor.DIRM.code:
      return `${reporting.value.dml}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.DML.code:
      return `${reporting.value.dml}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    case ReportingOriginActor.OTHER.code:
      return `${reporting.value.dml}${isHovering ? `: ${reporting.value.authorContact}` : ''}`
    default:
      return ''
  }
}

export function getReportingTitle(reporting: Reporting, isHovering: boolean = false): string {
  if (reporting.type === ReportingType.ALERT) {
    return getAlertNameFromType(reporting.value.type)
  }

  return isHovering ? `${reporting.value.title}: ${reporting.value.description}` : reporting.value.title
}

export const reportingSearchOptions: Fuse.IFuseOptions<Reporting> = {
  distance: 50,
  getFn: (reporting, path) => {
    const value = Fuse.config.getFn(reporting, path)

    if (_.isEqual(path, ['reportingTitle'])) {
      return getReportingTitle(reporting)
    }

    return value
  },
  includeScore: true,
  keys: ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'ircs', 'dml', 'reportingTitle'],
  threshold: 0.4
}
