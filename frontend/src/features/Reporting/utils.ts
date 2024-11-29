import { customDayjs } from '@mtes-mct/monitor-ui'

import { ReportingType, ReportingTypeCharacteristics } from './types'

export function getDefaultReportingsStartDate(): Date {
  return customDayjs().utc().subtract(5, 'year').startOf('year').toDate()
}

// TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
export const infractionSuspicionReportingTypes = Object.values(ReportingTypeCharacteristics)
  .filter(type => type.isInfractionSuspicion)
  .map(type => type.code)

// TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
export const reportingIsAnInfractionSuspicion = (reportingType: ReportingType): boolean =>
  infractionSuspicionReportingTypes.indexOf(reportingType) >= 0
