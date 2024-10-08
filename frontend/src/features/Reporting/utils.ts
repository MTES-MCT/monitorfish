import {
  ReportingType,
  ReportingTypeCharacteristics,
  type InfractionSuspicionReporting,
  type PendingAlertReporting,
  type Reporting
} from './types'

// TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
export const infractionSuspicionReportingTypes = Object.values(ReportingTypeCharacteristics)
  .filter(type => type.isInfractionSuspicion)
  .map(type => type.code)

// TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
export const reportingIsAnInfractionSuspicion = (reportingType: ReportingType): boolean =>
  infractionSuspicionReportingTypes.indexOf(reportingType) >= 0

export function isNotObservationReporting(
  reporting: Reporting.Reporting
): reporting is InfractionSuspicionReporting | PendingAlertReporting {
  return reporting.type !== ReportingType.OBSERVATION
}
