import { COMMON_ALERT_TYPE_OPTION, PendingAlertValueType } from '../../../constants'

export const getAlertNameFromType = (type: PendingAlertValueType | 'PNO_LAN_WEIGHT_TOLERANCE_ALERT') =>
  COMMON_ALERT_TYPE_OPTION[type] ? COMMON_ALERT_TYPE_OPTION[type].name : 'Alerte inconnue'
