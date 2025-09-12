import { COMMON_ALERT_TYPE_OPTION, PendingAlertValueType } from '../../../constants'

import type { PendingAlertValue } from '@features/Alert/types'

export const getAlertRuleFromType = (type: PendingAlertValueType, value?: PendingAlertValue | undefined) => {
  if (type !== PendingAlertValueType.POSITION_ALERT) {
    return COMMON_ALERT_TYPE_OPTION[type] ? COMMON_ALERT_TYPE_OPTION[type].rules.replace(/_/g, '') : 'Alerte inconnue'
  }

  return value?.name
}
