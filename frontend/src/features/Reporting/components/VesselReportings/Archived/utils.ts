import { sortByValidationOrCreationDateDesc } from '@features/Reporting/components/VesselReportings/Current/utils'
import { assertNotNullish } from '@utils/assertNotNullish'
import { pushToObjectAtIndex } from '@utils/pushToObjectAtIndex'
import { flatMap, maxBy } from 'lodash'

import { ReportingType } from '../../../../../domain/types/reporting'

import type { PendingAlertValueType } from '../../../../../domain/entities/alerts/types'
import type { Reporting } from '../../../../../domain/types/reporting'
import type { ReportingAndOccurrences } from '@features/Reporting/components/VesselReportings/Archived/types'

export function getSortedReportingsAndOccurrences(reportings: Reporting[]): ReportingAndOccurrences[] {
  const reportingsWithoutAlerts: ReportingAndOccurrences[] = reportings
    .filter(reporting => reporting.type !== ReportingType.ALERT)
    .map(reporting => ({
      otherOccurrences: [],
      reporting
    }))

  const alertTypeToAlertsOccurrences: Record<PendingAlertValueType, Reporting[]> = reportings
    .filter(reporting => reporting.type === ReportingType.ALERT)
    .reduce(
      (alertAccumulated, alertReporting) => {
        pushToObjectAtIndex(alertAccumulated, alertReporting.value.type, alertReporting)

        return alertAccumulated
      },
      {
        FRENCH_EEZ_FISHING_ALERT: [],
        MISSING_FAR_48_HOURS_ALERT: [],
        MISSING_FAR_ALERT: [],
        THREE_MILES_TRAWLING_ALERT: [],
        TWELVE_MILES_FISHING_ALERT: []
      }
    )

  const alertTypeToLastAlertAndOccurrences: ReportingAndOccurrences[] = flatMap(
    alertTypeToAlertsOccurrences,
    alerts => {
      const lastAlert = maxBy(alerts, 'validationDate')
      assertNotNullish(lastAlert)
      const otherOccurrences = alerts.filter(alert => alert.id !== lastAlert.id)

      return {
        otherOccurrences,
        reporting: lastAlert
      }
    }
  )

  return reportingsWithoutAlerts
    .concat(alertTypeToLastAlertAndOccurrences)
    .sort((a, b) => sortByValidationOrCreationDateDesc(a.reporting, b.reporting))
}
