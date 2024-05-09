import { ReportingTypeCharacteristics } from '@features/Reporting/types'
import { range } from 'lodash'

import type { Reporting, ReportingType } from '../../domain/types/reporting'

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
export const getYearsToReportings = (
  archivedReportingsFromDate: Date,
  reportings: Reporting[]
): Record<string, Reporting[]> => {
  const years = yearsRange(archivedReportingsFromDate)

  return years.reduce(
    (acc, year) => {
      const yearReportings = reportings.filter(reporting => {
        const reportingYear = new Date(reporting.validationDate || reporting.creationDate).getUTCFullYear()

        return reportingYear === year
      })

      acc[String(year)] = yearReportings

      return acc
    },
    {} as Record<string, Reporting[]>
  )
}

function yearsRange(fromDate: Date) {
  const fromYear = fromDate.getUTCFullYear() + 1
  const toYear = new Date().getUTCFullYear()

  return range(fromYear, toYear + 1)
}
