import { logbookActions } from '@features/Logbook/slice'
import { binarySearchLine } from '@features/Logbook/useCases/displayedLogbookOverlays/utils'
import { getActivityDateTimeFromMessage, getLogbookMessageType } from '@features/Logbook/utils'
import { LayerProperties } from '@features/Map/constants'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'
import { getLogbookMessageCircleStyle } from '@features/Vessel/layers/VesselsTracksLayer/vesselTrack.style'
import { removeFishingActivitiesFeatures } from '@features/Vessel/types/track'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import Point from 'ol/geom/Point'

import type { Coordinates } from '@mtes-mct/monitor-ui'
import type { MainAppThunk } from '@store'
import type { Dayjs } from 'dayjs'
import type { Geometry } from 'ol/geom'

export const displayLogbookMessageOverlays = (): MainAppThunk => async (dispatch, getState) => {
  const {
    fishingActivities: { areFishingActivitiesShowedOnMap, logbookMessages }
  } = getState()
  if (!logbookMessages || !areFishingActivitiesShowedOnMap) {
    return
  }

  const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()

  const displayedLogbookOverlays = logbookMessages
    .filter(logbookMessage => !logbookMessage.isCorrectedByNewerMessage)
    .map(logbookMessage => ({
      activityDateTime: customDayjs(getActivityDateTimeFromMessage(logbookMessage)),
      id: logbookMessage.operationNumber ?? '',
      isDeleted: logbookMessage.isDeleted,
      isNotAcknowledged: !logbookMessage.acknowledgment?.isSuccess,
      name: getLogbookMessageType(logbookMessage)
    }))

  const lines = getVesselTrackLines(features)
  const linesByTimestamp = lines
    .map(line => ({
      end: customDayjs(line.secondPositionDate),
      line,
      start: customDayjs(line.firstPositionDate)
    }))
    .sort((a, b) => a.start.valueOf() - b.start.valueOf())

  const result = getFeatureAndOverlays(displayedLogbookOverlays, linesByTimestamp)

  removeFishingActivitiesFeatures(features, VESSEL_TRACK_VECTOR_SOURCE)

  VESSEL_TRACK_VECTOR_SOURCE.addFeatures(result.features)
  VESSEL_TRACK_VECTOR_SOURCE.changed()

  dispatch(logbookActions.displayLogbookOverlays(result.displayedLogbookOverlays))
}

export function getVesselTrackLines(features) {
  return features.filter(
    feature =>
      feature?.getId()?.toString()?.includes(LayerProperties.VESSEL_TRACK.code) &&
      feature?.getId()?.toString()?.includes('line')
  )
}

function getFeatureAndOverlays(
  displayedLogbookOverlays,
  linesByTimestamp
): { displayedLogbookOverlays: any[]; features: Feature<Geometry>[] } {
  return displayedLogbookOverlays.reduce(
    (acc: { displayedLogbookOverlays: any[]; features: Feature<Geometry>[] }, logbookMessage) => {
      const { activityDateTime, id } = logbookMessage

      const lineOfLogbookMessage = binarySearchLine(activityDateTime, linesByTimestamp)

      if (lineOfLogbookMessage) {
        const featureAndCoordinates = getLogbookMessageFeatureOnTrackLine(id, lineOfLogbookMessage, activityDateTime)

        acc.displayedLogbookOverlays.push({ ...logbookMessage, coordinates: featureAndCoordinates.coordinates })
        acc.features.push(featureAndCoordinates.feature)
      }

      return acc
    },
    { displayedLogbookOverlays: [], features: [] }
  )
}

export const getLogbookMessageFeatureOnTrackLine = (
  id: string,
  vesselTrackIncludingActivity: Vessel.VesselLineFeature,
  logbookMessageDateTime: Dayjs
): {
  coordinates: Coordinates
  feature: Feature<Geometry>
} => {
  const firstPositionDate = customDayjs(vesselTrackIncludingActivity.firstPositionDate).valueOf()
  const secondPositionDate = customDayjs(vesselTrackIncludingActivity.secondPositionDate).valueOf()

  const totalDistance = secondPositionDate - firstPositionDate
  const logbookMessageDistanceFromFirstPoint = logbookMessageDateTime.valueOf() - firstPositionDate
  const distanceFraction = logbookMessageDistanceFromFirstPoint / totalDistance

  const coordinates = vesselTrackIncludingActivity.getGeometry()!.getCoordinateAt(distanceFraction) as Coordinates
  const feature = new Feature({
    geometry: new Point(coordinates)
  })
  feature.setStyle(getLogbookMessageCircleStyle())
  feature.setId(`${LayerProperties.VESSEL_TRACK.code}:logbook:${id}`)

  return {
    coordinates,
    feature
  }
}
