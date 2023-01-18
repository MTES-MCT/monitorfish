import { SilencedAlertPeriod } from './constants'
import { getDate } from '../../../utils'

import type { SilencedAlertPeriodRequest } from './types'

export const getSilencedAlertPeriodText = (silencedAlertPeriodRequest: SilencedAlertPeriodRequest): string => {
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
      return `jusqu'au ${getDate(silencedAlertPeriodRequest.beforeDateTime)}`

    default:
      throw new Error('This should never happen.')
  }
}
