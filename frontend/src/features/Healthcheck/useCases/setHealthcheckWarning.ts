import * as timeago from 'timeago.js'

import { setHealthcheckTextWarning } from '../../../domain/shared_slices/Global'

import type { Healthcheck } from '../types'

const TEN_MINUTES = 10

export const setHealthcheckWarning = (healthcheck: Healthcheck) => dispatch => {
  const now = Date.now()
  const logbookMessagesReceivedMinutesAgo = getMinutesAgo(now, healthcheck.dateLogbookMessageReceived)
  const lastPositionUpdatedByPrefectMinutesAgo = getMinutesAgo(now, healthcheck.dateLastPositionUpdatedByPrefect)
  const lastPositionReceivedByAPIMinutesAgo = getMinutesAgo(now, healthcheck.dateLastPositionReceivedByAPI)

  const warning = getWarningText(
    logbookMessagesReceivedMinutesAgo,
    lastPositionUpdatedByPrefectMinutesAgo,
    lastPositionReceivedByAPIMinutesAgo,
    healthcheck
  )
  dispatch(setHealthcheckTextWarning(warning))
}

function getTimeAgo(timeAgo) {
  return timeago.format(timeAgo, 'fr').replace('il y a', '')
}

function getWarningText(
  logbookMessagesReceivedMinutesAgo,
  lastPositionUpdatedByPrefectMinutesAgo,
  lastPositionReceivedByAPIMinutesAgo,
  healthCheck
) {
  if (
    (lastPositionReceivedByAPIMinutesAgo > TEN_MINUTES || lastPositionUpdatedByPrefectMinutesAgo > TEN_MINUTES) &&
    logbookMessagesReceivedMinutesAgo > TEN_MINUTES
  ) {
    let biggestDateValue = healthCheck.dateLogbookMessageReceived
    const timeAgo = logbookMessagesReceivedMinutesAgo

    if (lastPositionReceivedByAPIMinutesAgo > timeAgo) {
      biggestDateValue = healthCheck.dateLastPositionReceivedByAPI
    } else if (lastPositionUpdatedByPrefectMinutesAgo > timeAgo) {
      biggestDateValue = healthCheck.dateLastPositionUpdatedByPrefect
    }

    return `Les données VMS et JPE ne sont plus à jour dans MonitorFish depuis ${getTimeAgo(biggestDateValue)}`
  }
  if (logbookMessagesReceivedMinutesAgo > TEN_MINUTES) {
    return `Nous ne recevons plus aucun message JPE depuis ${getTimeAgo(healthCheck.dateLogbookMessageReceived)}.`
  }
  if (lastPositionReceivedByAPIMinutesAgo > TEN_MINUTES) {
    return `Nous ne recevons plus aucune position VMS depuis ${getTimeAgo(healthCheck.dateLastPositionReceivedByAPI)}.`
  }
  if (lastPositionUpdatedByPrefectMinutesAgo > TEN_MINUTES) {
    return `Les dernières positions des navires ne sont plus actualisées depuis ${getTimeAgo(
      healthCheck.dateLastPositionUpdatedByPrefect
    )} (ni sur la carte, ni dans la liste des navires).`
  }

  return undefined
}

function getMinutesAgo(now, dateToCompare) {
  const milliseconds = 1000
  const seconds = 60
  const diff = Math.abs(now - new Date(dateToCompare).getTime())

  return Math.floor(diff / milliseconds / seconds)
}
