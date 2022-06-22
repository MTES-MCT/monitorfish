export const ReportingType = {
  ALERT: {
    code: 'ALERT',
    name: 'ALERTE',
    inputName: null,
    isInfractionSuspicion: true
  },
  OBSERVATION: {
    code: 'OBSERVATION',
    name: 'OBSERVATION',
    inputName: 'Observation',
    isInfractionSuspicion: false
  },
  INFRACTION_SUSPICION: {
    code: 'INFRACTION_SUSPICION',
    name: 'SUSPICION d\'INFRACTION',
    inputName: 'Infraction (suspicion)',
    isInfractionSuspicion: true
  }
}

export const ReportingOriginActor = {
  OPS: {
    code: 'OPS',
    name: 'OPS'
  },
  SIP: {
    code: 'SIP',
    name: 'SIP'
  },
  UNIT: {
    code: 'UNIT',
    name: 'Unité'
  },
  DML: {
    code: 'DML',
    name: 'DML'
  },
  DIRM: {
    code: 'DIRM',
    name: 'DIRM'
  },
  OTHER: {
    code: 'OTHER',
    name: 'Autre'
  }
}

export const infractionSuspicionReportingTypes = Object.values(ReportingType)
  .filter(type => type.isInfractionSuspicion === true)
  .map(type => type.code)

export const reportingIsAnInfractionSuspicion = reportingType =>
  infractionSuspicionReportingTypes.indexOf(reportingType) >= 0

/**
 * Get reporting for each years : Years are keys and reporting are values
 * @memberOf Reporting
 * @param {Date} archivedReportingsFromDate - The date
 * @param {Reporting[]} reportingList
 * @returns {Object.<string, Reporting[]>} The reporting for all years
 */
export const getYearsToReportingList = (archivedReportingsFromDate, reportingList) => {
  const nextYearsToReporting = {}
  if (archivedReportingsFromDate) {
    let fromYear = archivedReportingsFromDate.getUTCFullYear() + 1
    const toYear = new Date().getUTCFullYear()
    while (fromYear <= toYear) {
      nextYearsToReporting[fromYear] = []
      fromYear += 1
    }
  }

  reportingList.forEach(reporting => {
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
