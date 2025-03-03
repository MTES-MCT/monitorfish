import { logbookActions } from '@features/Logbook/slice'
import {
  getFishingActivityFeatureOnTrackLine,
  getVesselTrackLines
} from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { binarySearchLine } from '@features/Logbook/useCases/displayedLogbookOverlays/utils'
import { getActivityDateTimeFromMessage, getLogbookMessageType } from '@features/Logbook/utils'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'

import type { MainAppThunk } from '@store'

export const displayLogbookMessageOverlay =
  (operationNumber: string | undefined): MainAppThunk =>
  async (dispatch, getState) => {
    if (!operationNumber) {
      return
    }

    const {
      fishingActivities: { displayedLogbookOverlays, fishingActivities }
    } = getState()
    if (!fishingActivities || displayedLogbookOverlays.findIndex(activity => activity.id === operationNumber) !== -1) {
      return
    }

    const fishingActivity = fishingActivities.logbookMessages.find(
      activity => activity.operationNumber === operationNumber
    )
    if (!fishingActivity) {
      return
    }
    assertNotNullish(fishingActivity.operationNumber)

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

    const activityDateTime = customDayjs(getActivityDateTimeFromMessage(fishingActivity))
    const lineOfFishingActivity = binarySearchLine(activityDateTime, linesByTimestamp)
    if (!lineOfFishingActivity) {
      return
    }

    const featureData = getFishingActivityFeatureOnTrackLine(
      fishingActivity.operationNumber,
      lineOfFishingActivity,
      activityDateTime
    )

    const nextDisplayedLogbookOverlay = {
      activityDateTime,
      coordinates: featureData.coordinates,
      id: fishingActivity.operationNumber,
      isDeleted: fishingActivity.isDeleted,
      isNotAcknowledged: !fishingActivity.acknowledgment?.isSuccess,
      name: getLogbookMessageType(fishingActivity)
    }
    dispatch(logbookActions.displayLogbookOverlay(nextDisplayedLogbookOverlay))

    VESSEL_TRACK_VECTOR_SOURCE.addFeature(featureData.feature)
    VESSEL_TRACK_VECTOR_SOURCE.changed()
  }
