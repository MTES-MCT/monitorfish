import { customDayjs } from '@mtes-mct/monitor-ui'
import * as timeago from 'timeago.js'

import type { Healthcheck } from './types'

const TEN_MINUTES = 10

export function getHealthcheckWarnings(healthcheck: Healthcheck): string[] {
  const now = customDayjs()

  const logbookMessagesReceivedMinutesAgo = getMinutesDifference(now, healthcheck.dateLogbookMessageReceived)
  const lastPositionUpdatedByPrefectMinutesAgo = getMinutesDifference(now, healthcheck.dateLastPositionUpdatedByPrefect)
  const lastPositionReceivedByAPIMinutesAgo = getMinutesDifference(now, healthcheck.dateLastPositionReceivedByAPI)

  const warnings = [
    {
      isWarn: lastPositionReceivedByAPIMinutesAgo > TEN_MINUTES,
      message: `Nous ne recevons plus aucune position VMS depuis ${getTimeAgo(
        healthcheck.dateLastPositionReceivedByAPI
      )}.`
    },
    {
      isWarn: lastPositionUpdatedByPrefectMinutesAgo > TEN_MINUTES,
      message: `La dernière position des navires n'est plus actualisée depuis ${getTimeAgo(
        healthcheck.dateLastPositionUpdatedByPrefect
      )} (ni sur la carte, ni dans la liste des navires).`
    },
    {
      isWarn: logbookMessagesReceivedMinutesAgo > TEN_MINUTES,
      message: `Nous ne recevons plus aucun message JPE depuis ${getTimeAgo(healthcheck.dateLogbookMessageReceived)}.`
    },
    {
      isWarn: healthcheck.suddenDropOfPositionsReceived,
      message: 'Nous recevons 30% de données VMS en moins.'
    }
  ]

  return warnings
    .map(({ isWarn, message }) => {
      if (!isWarn) {
        return undefined
      }

      return message
    })
    .filter((message): message is string => Boolean(message))
}

function getTimeAgo(timeAgo): string {
  return timeago.format(timeAgo, 'fr').replace('il y a ', '').replace(' ago', '')
}

function getMinutesDifference(now, dateToCompare): number {
  const MILLISECONDS = 1000
  const SECONDS = 60

  const date = customDayjs(dateToCompare).valueOf()

  const millisecondsDifference = Math.abs(now - date)

  // Conversion to minutes
  return Math.floor(millisecondsDifference / MILLISECONDS / SECONDS)
}
