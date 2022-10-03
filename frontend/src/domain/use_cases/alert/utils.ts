import { PendingAlertValue, PendingAlertValueType } from '../../types/alert'

import type { Reporting } from '../../types/reporting'

const PENDING_ALERT_VALUE_TYPES = Object.values(PendingAlertValueType)

export function isReportingWithPendingAlert(reporting: Reporting): reporting is Reporting<PendingAlertValue> {
  return PENDING_ALERT_VALUE_TYPES.includes((reporting.value as PendingAlertValue).type)
}
