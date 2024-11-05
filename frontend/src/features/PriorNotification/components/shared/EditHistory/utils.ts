import { customDayjs } from '@mtes-mct/monitor-ui'
import dayjs, { isDayjs } from 'dayjs'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import type { Dayjs } from 'dayjs'

function getCreatedByLabel(priorNotificationDetail: PriorNotification.Detail) {
  if (!priorNotificationDetail.isManuallyCreated) {
    return undefined
  }

  return (
    priorNotificationDetail.logbookMessage.message.createdBy ??
    priorNotificationDetail.logbookMessage.message.authorTrigram
  )
}

export function getCreationLabel(priorNotificationDetail: PriorNotification.Detail) {
  const createdByLabel = getCreatedByLabel(priorNotificationDetail)

  return [
    'Créé',
    createdByLabel ? `par ${createdByLabel}` : '',
    customDayjs(priorNotificationDetail.createdAt).fromNow()
  ]
    .join(' ')
    .concat('.')
}

export function getLasUpdateLabel(priorNotificationDetail: PriorNotification.Detail) {
  if (isDateCloseTo(priorNotificationDetail.createdAt, priorNotificationDetail.updatedAt, 1)) {
    return undefined
  }

  const updatedByLabel =
    priorNotificationDetail.logbookMessage.message.updatedBy ??
    priorNotificationDetail.logbookMessage.message.authorTrigram

  return [
    'Dernière mise à jour',
    updatedByLabel ? `par ${updatedByLabel}` : '',
    customDayjs(priorNotificationDetail.updatedAt).fromNow()
  ]
    .join(' ')
    .concat('.')
}

export function isDateCloseTo(
  leftDate: string | Date | Dayjs,
  rightDate: string | Date | Dayjs,
  thresholdInSeconds: number
): boolean {
  const leftDateAsDayjs: Dayjs = isDayjs(leftDate) ? leftDate : dayjs(leftDate)
  const rightDateAsDayjs: Dayjs = isDayjs(rightDate) ? rightDate : dayjs(rightDate)

  return Math.abs(leftDateAsDayjs.diff(rightDateAsDayjs, 'second')) <= thresholdInSeconds
}
