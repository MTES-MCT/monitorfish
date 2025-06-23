import { COMMON_ALERT_TYPE_OPTION, PendingAlertValueType } from '../../../constants'

import type { PendingAlertValue } from '@features/Alert/types'

export const getAlertNameFromType = (
  type: PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT',
  value?: PendingAlertValue | undefined
) => {
  const name = COMMON_ALERT_TYPE_OPTION[type] ? COMMON_ALERT_TYPE_OPTION[type].name : 'Alerte inconnue'

  if (
    (!!value && type === PendingAlertValueType.BOTTOM_TRAWL_800_METERS_FISHING_ALERT) ||
    type === PendingAlertValueType.BOTTOM_GEAR_VME_FISHING_ALERT
  ) {
    return `${name} (${value?.depth}m)`
  }

  return name
}
