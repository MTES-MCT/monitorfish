export const reportingType = {
  ALERT: {
    code: 'ALERT',
    isInfractionSuspicion: true
  },
  OBSERVATION: {
    code: 'OBSERVATION',
    isInfractionSuspicion: false
  },
  INFRACTION_SUSPICION: {
    code: 'INFRACTION_SUSPICION',
    isInfractionSuspicion: true
  }
}

export const infractionSuspicionReportingTypes = Object.values(reportingType)
  .filter(type => type.isInfractionSuspicion === true)
  .map(type => type.code)
