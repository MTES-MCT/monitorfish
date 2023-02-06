import { Reporting, ReportingType } from '../types/reporting'

type ReportingTypeCharacteristic = {
  // TODO It should be useless now that types are discriminated.
  code: ReportingType
  inputName: string | null
  // TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
  isInfractionSuspicion: boolean
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
  .filter(type => type.isInfractionSuspicion)
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
