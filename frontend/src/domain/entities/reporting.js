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
