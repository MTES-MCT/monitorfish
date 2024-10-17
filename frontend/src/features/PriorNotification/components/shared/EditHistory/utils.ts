import { customDayjs } from '@mtes-mct/monitor-ui'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

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
