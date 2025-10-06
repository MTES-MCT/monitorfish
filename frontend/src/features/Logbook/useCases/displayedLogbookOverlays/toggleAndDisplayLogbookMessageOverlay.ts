import { logbookActions } from '@features/Logbook/slice'
import {
  getLogbookMessageFeatureOnTrackLine,
  getVesselTrackLines
} from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { binarySearchLine } from '@features/Logbook/useCases/displayedLogbookOverlays/utils'
import { getActivityDateTimeFromMessage, getLogbookMessageType } from '@features/Logbook/utils'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'

import type { MainAppThunk } from '@store'

export const toggleAndDisplayLogbookMessageOverlay =
  (operationNumber: string | undefined): MainAppThunk =>
  async (dispatch, getState) => {
    if (!operationNumber) {
      return
    }

    const {
      fishingActivities: { displayedLogbookOverlays, logbookMessages }
    } = getState()
    if (!logbookMessages || displayedLogbookOverlays.findIndex(message => message.id === operationNumber) !== -1) {
      return
    }

    const logbookMessage = logbookMessages.find(message => message.operationNumber === operationNumber)
    if (!logbookMessage) {
      return
    }
    assertNotNullish(logbookMessage.operationNumber)

    await dispatch(logbookActions.setAreFishingActivitiesShowedOnMap(true))

    const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()

    const lines = getVesselTrackLines(features)
    const linesByTimestamp = lines
      .map(line => ({
        end: customDayjs(line.secondPositionDate),
        line,
        start: customDayjs(line.firstPositionDate)
      }))
      .sort((a, b) => a.start.valueOf() - b.start.valueOf())

    const messageDateTime = customDayjs(getActivityDateTimeFromMessage(logbookMessage))
    const lineOfLogbookMessage = binarySearchLine(messageDateTime, linesByTimestamp)
    if (!lineOfLogbookMessage) {
      return
    }

    const featureData = getLogbookMessageFeatureOnTrackLine(
      logbookMessage.operationNumber,
      lineOfLogbookMessage,
      messageDateTime
    )

    const nextDisplayedLogbookOverlay = {
      coordinates: featureData.coordinates,
      id: logbookMessage.operationNumber,
      isDeleted: logbookMessage.isDeleted,
      isNotAcknowledged: !logbookMessage.acknowledgment?.isSuccess,
      messageDateTime,
      name: getLogbookMessageType(logbookMessage)
    }
    dispatch(logbookActions.displayLogbookOverlay(nextDisplayedLogbookOverlay))

    VESSEL_TRACK_VECTOR_SOURCE.addFeature(featureData.feature)
    VESSEL_TRACK_VECTOR_SOURCE.changed()
  }
