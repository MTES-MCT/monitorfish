import { COMMON_ALERT_TYPE_OPTION, SilencedAlertPeriod } from '../../../domain/entities/alerts/constants'
import { getDate } from '../../../utils'

import type { PendingAlertValueType, SilencedAlertPeriodRequest } from '../../../domain/types/alert'

export const getAlertNameFromType = (type: PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT') =>
  COMMON_ALERT_TYPE_OPTION[type] ? COMMON_ALERT_TYPE_OPTION[type].name : 'Alerte inconnue'

export function getSilencedAlertPeriodText(silencedAlertPeriodRequest: SilencedAlertPeriodRequest): string {
  switch (silencedAlertPeriodRequest.silencedAlertPeriod) {
    case SilencedAlertPeriod.THIS_OCCURRENCE:
      return 'pour cette occurence'

    case SilencedAlertPeriod.ONE_HOUR:
      return 'pendant 1 heure'

    case SilencedAlertPeriod.TWO_HOURS:
      return 'pendant 2 heures'

    case SilencedAlertPeriod.SIX_HOURS:
      return 'pendant 6 heures'

    case SilencedAlertPeriod.TWELVE_HOURS:
      return 'pendant 12 heures'

    case SilencedAlertPeriod.ONE_DAY:
      return 'pendant 24 heures'

    case SilencedAlertPeriod.ONE_WEEK:
      return 'pendant 1 semaine'

    case SilencedAlertPeriod.ONE_MONTH:
      return 'pendant 1 mois'

    case SilencedAlertPeriod.ONE_YEAR:
      return 'pendant 1 année'

    case SilencedAlertPeriod.CUSTOM:
      return `du ${getDate(silencedAlertPeriodRequest.afterDateTime)} au ${getDate(
        silencedAlertPeriodRequest.beforeDateTime
      )}`

    default:
      throw new Error('This should never happen.')
  }
}
