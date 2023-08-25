import { setError, setHealthcheckTextWarning } from '../../shared_slices/Global'
import * as timeago from 'timeago.js'
import { getHealthcheckFromAPI } from '../../../api/healthcheck'

const TEN_MINUTES = 10

const getHealthcheck = () => dispatch => {
  getHealthcheckFromAPI().then(healthCheck => {
    const now = Date.now()
    const logbookMessagesReceivedMinutesAgo = getMinutesAgo(now, healthCheck.dateLogbookMessageReceived)
    const lastPositionUpdatedByPrefectMinutesAgo = getMinutesAgo(now, healthCheck.dateLastPositionUpdatedByPrefect)
    const lastPositionReceivedByAPIMinutesAgo = getMinutesAgo(now, healthCheck.dateLastPositionReceivedByAPI)

    const warning = getWarningText(logbookMessagesReceivedMinutesAgo, lastPositionUpdatedByPrefectMinutesAgo, lastPositionReceivedByAPIMinutesAgo, healthCheck)
    dispatch(setHealthcheckTextWarning(warning))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

function getTimeAgo (timeAgo) {
  return timeago.format(timeAgo, 'fr').replace('il y a', '')
}

function getWarningText (logbookMessagesReceivedMinutesAgo, lastPositionUpdatedByPrefectMinutesAgo, lastPositionReceivedByAPIMinutesAgo, healthCheck) {
  if ((lastPositionReceivedByAPIMinutesAgo > TEN_MINUTES || lastPositionUpdatedByPrefectMinutesAgo > TEN_MINUTES) && logbookMessagesReceivedMinutesAgo > TEN_MINUTES) {
    let biggestDateValue = healthCheck.dateLogbookMessageReceived
    let timeAgo = logbookMessagesReceivedMinutesAgo

    if (lastPositionReceivedByAPIMinutesAgo > timeAgo) {
      biggestDateValue = healthCheck.dateLastPositionReceivedByAPI
    } else if (lastPositionUpdatedByPrefectMinutesAgo > timeAgo) {
      biggestDateValue = healthCheck.dateLastPositionUpdatedByPrefect
    }

    return `Les données VMS et JPE ne sont plus à jour dans MonitorFish depuis ${(getTimeAgo(biggestDateValue))}`
  } else if (logbookMessagesReceivedMinutesAgo > TEN_MINUTES) {
    return `Nous ne recevons plus aucun message JPE depuis ${getTimeAgo(healthCheck.dateLogbookMessageReceived)}.`
  } else if (lastPositionReceivedByAPIMinutesAgo > TEN_MINUTES) {
    return `Nous ne recevons plus aucune position VMS depuis ${getTimeAgo(healthCheck.dateLastPositionReceivedByAPI)}.`
  } else if (lastPositionUpdatedByPrefectMinutesAgo > TEN_MINUTES) {
    return `Les dernières positions des navires ne sont plus actualisées depuis ${getTimeAgo(healthCheck.dateLastPositionUpdatedByPrefect)} (ni sur la carte, ni dans la liste des navires).`
  }

  return undefined
}

function getMinutesAgo (now, dateToCompare) {
  const milliseconds = 1000
  const seconds = 60
  const diff = Math.abs(now - new Date(dateToCompare).getTime())

  return Math.floor((diff / milliseconds) / seconds)
}

export default getHealthcheck
