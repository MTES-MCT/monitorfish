import { ReportingType } from '@features/Reporting/types/ReportingType'
import { customDayjs } from '@mtes-mct/monitor-ui'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import { type DisplayedReporting, type Reporting, ReportingTypeCharacteristics } from './types'

export function getDefaultReportingsStartDate(): Date {
  return customDayjs().utc().subtract(3, 'year').startOf('year').toDate()
}

// TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
export const infractionSuspicionReportingTypes = Object.values(ReportingTypeCharacteristics)
  .filter(type => type.isInfractionSuspicion)
  .map(type => type.code)

// TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
export const reportingIsAnInfractionSuspicion = (reportingType: ReportingType): boolean =>
  infractionSuspicionReportingTypes.indexOf(reportingType) >= 0

export function buildReportingFeature(reporting: DisplayedReporting): Reporting.ReportingFeature {
  /**
   * The feature does contain ONLY required properties, it does not contain all properties of Reporting.
   */
  const feature = new Feature({
    ...reporting,
    geometry: new Point(reporting.coordinates),
    isHovered: false,
    isSelected: false
  }) as Reporting.ReportingFeature
  feature.setId(reporting.featureId)

  return feature
}
