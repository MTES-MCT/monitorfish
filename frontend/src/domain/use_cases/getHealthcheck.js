import { getHealthcheckFromAPI } from '../../api/fetch'
import { setError, setHealthcheckTextWarning } from '../reducers/Global'

const FIVE_MINUTES = 5

const getHealthcheck = () => dispatch => {
  getHealthcheckFromAPI().then(healthCheck => {
    const now = Date.now()
    const ersMessagesReceivedMinutesAgo = getMinutesAgoFromNow(now, healthCheck.dateERSMessageReceived)
    const positionsReceivedMinutesAgo = getMinutesAgoFromNow(now, healthCheck.datePositionReceived)
    const lastPositionsMinutesAgo = getMinutesAgoFromNow(now, healthCheck.dateLastPosition)

    const warning = getWarningText(ersMessagesReceivedMinutesAgo, positionsReceivedMinutesAgo, lastPositionsMinutesAgo)
    dispatch(setHealthcheckTextWarning(warning))
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  })
}

function getWarningText (ersMessagesReceivedMinutesAgo, positionsReceivedMinutesAgo, lastPositionsMinutesAgo) {
  if ((lastPositionsMinutesAgo > FIVE_MINUTES || positionsReceivedMinutesAgo > FIVE_MINUTES) && ersMessagesReceivedMinutesAgo > FIVE_MINUTES) {
    let timeAgo = ersMessagesReceivedMinutesAgo
    if (lastPositionsMinutesAgo > timeAgo) {
      timeAgo = lastPositionsMinutesAgo
    } else if (positionsReceivedMinutesAgo > timeAgo) {
      timeAgo = positionsReceivedMinutesAgo
    }

    return `Les données VMS et JPE ne sont plus à jour dans MonitorFish depuis ${timeAgo} minutes`
  } else if (ersMessagesReceivedMinutesAgo > FIVE_MINUTES) {
    return `Nous ne recevons plus aucun message JPE depuis ${ersMessagesReceivedMinutesAgo} minutes.`
  } else if (positionsReceivedMinutesAgo > FIVE_MINUTES) {
    return `Nous ne recevons plus aucune position VMS depuis ${positionsReceivedMinutesAgo} minutes.`
  } else if (lastPositionsMinutesAgo > FIVE_MINUTES) {
    return `Les dernières positions des navires ne sont plus actualisées depuis ${lastPositionsMinutesAgo} minutes (ni sur la carte, ni dans la liste des navires).`
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
