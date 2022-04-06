import { setError, setHealthcheckTextWarning } from '../../shared_slices/Global'
import * as timeago from 'timeago.js'
import { getHealthcheckFromAPI } from '../../../api/healthcheck'

const TEN_MINUTES = 10

const getHealthcheck = () => dispatch => {
  getHealthcheckFromAPI().then(healthCheck => {
    const now = Date.now()
    const logbookMessagesReceivedMinutesAgo = getMinutesAgoFromNow(now, healthCheck.dateLogbookMessageReceived)
    const positionsReceivedMinutesAgo = getMinutesAgoFromNow(now, healthCheck.datePositionReceived)
    const lastPositionsMinutesAgo = getMinutesAgoFromNow(now, healthCheck.dateLastPosition)

    const warning = getWarningText(logbookMessagesReceivedMinutesAgo, positionsReceivedMinutesAgo, lastPositionsMinutesAgo)
    dispatch(setHealthcheckTextWarning(warning))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

function getTimeAgo (timeAgo) {
  return timeago.format(timeAgo, 'fr').replace('il y a', '')
}

function getWarningText (logbookMessagesReceivedMinutesAgo, positionsReceivedMinutesAgo, lastPositionsMinutesAgo) {
  if ((lastPositionsMinutesAgo > TEN_MINUTES || positionsReceivedMinutesAgo > TEN_MINUTES) && logbookMessagesReceivedMinutesAgo > TEN_MINUTES) {
    let timeAgo = logbookMessagesReceivedMinutesAgo
    if (lastPositionsMinutesAgo > timeAgo) {
      timeAgo = lastPositionsMinutesAgo
    } else if (positionsReceivedMinutesAgo > timeAgo) {
      timeAgo = positionsReceivedMinutesAgo
    }

    return `Les données VMS et JPE ne sont plus à jour dans MonitorFish depuis ${(getTimeAgo(timeAgo))}`
  } else if (logbookMessagesReceivedMinutesAgo > TEN_MINUTES) {
    return `Nous ne recevons plus aucun message JPE depuis ${getTimeAgo(logbookMessagesReceivedMinutesAgo)}.`
  } else if (positionsReceivedMinutesAgo > TEN_MINUTES) {
    return `Nous ne recevons plus aucune position VMS depuis ${getTimeAgo(positionsReceivedMinutesAgo)}.`
  } else if (lastPositionsMinutesAgo > TEN_MINUTES) {
    return `Les dernières positions des navires ne sont plus actualisées depuis ${getTimeAgo(lastPositionsMinutesAgo)} (ni sur la carte, ni dans la liste des navires).`
  }

  return null
}

function getMinutesAgoFromNow (now, dateToCompare) {
  const milliseconds = 1000
  const seconds = 60
  const diff = Math.abs(now - new Date(dateToCompare))

  return Math.floor((diff / milliseconds) / seconds)
}

export default getHealthcheck
