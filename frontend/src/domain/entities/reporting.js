export const ReportingType = {
  ALERT: {
    code: 'ALERT',
    name: 'ALERTE',
    isInfractionSuspicion: true
  },
  OBSERVATION: {
    code: 'OBSERVATION',
    name: 'OBSERVATION',
    isInfractionSuspicion: false
  },
  INFRACTION_SUSPICION: {
    code: 'INFRACTION_SUSPICION',
    name: 'SUSPICION d\'INFRACTION',
    isInfractionSuspicion: true
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
 * @param {Date} archivedReportingFromDate - The date
 * @param {Reporting[]} reportingList
 * @returns {Object.<string, Reporting[]>} The reporting for all years
 */
export const getYearsToReportingList = (archivedReportingFromDate, reportingList) => {
  const nextYearsToReporting = {}
  if (archivedReportingFromDate) {
    let fromYear = archivedReportingFromDate.getUTCFullYear() + 1
    const toYear = new Date().getUTCFullYear()
    while (fromYear <= toYear) {
      nextYearsToReporting[fromYear] = []
      fromYear += 1
    }
  }

  reportingList.forEach(reporting => {
    if (reporting?.validationDate) {
      const year = new Date(reporting.validationDate).getUTCFullYear()

      if (nextYearsToReporting[year] && nextYearsToReporting[year].length) {
        nextYearsToReporting[year] = nextYearsToReporting[year].concat(reporting)
      } else {
        nextYearsToReporting[year] = [reporting]
      }
    }
  })

  return nextYearsToReporting
}
