import { logbookActions } from '@features/Logbook/slice'
import { binarySearchLine } from '@features/Logbook/useCases/displayedLogbookOverlays/utils'
import { getActivityDateTimeFromMessage, getLogbookMessageType } from '@features/Logbook/utils'
import { LayerProperties } from '@features/Map/constants'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'
import { getFishingActivityCircleStyle } from '@features/Vessel/layers/VesselsTracksLayer/vesselTrack.style'
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
    fishingActivities: { fishingActivities }
  } = getState()
  if (!fishingActivities) {
    return
  }

  await dispatch(logbookActions.setAreFishingActivitiesShowedOnMap(true))

  const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()

  const displayedLogbookOverlays = fishingActivities.logbookMessages
    .filter(fishingActivity => !fishingActivity.isCorrectedByNewerMessage)
    .map(fishingActivity => ({
      activityDateTime: customDayjs(getActivityDateTimeFromMessage(fishingActivity)),
      id: fishingActivity.operationNumber ?? '',
      isDeleted: fishingActivity.isDeleted,
      isNotAcknowledged: !fishingActivity.acknowledgment?.isSuccess,
      name: getLogbookMessageType(fishingActivity)
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
    (acc: { displayedLogbookOverlays: any[]; features: Feature<Geometry>[] }, fishingActivity) => {
      const { activityDateTime, id } = fishingActivity

      const lineOfFishingActivity = binarySearchLine(activityDateTime, linesByTimestamp)

      if (lineOfFishingActivity) {
        const featureAndCoordinates = getFishingActivityFeatureOnTrackLine(id, lineOfFishingActivity, activityDateTime)

        acc.displayedLogbookOverlays.push({ ...fishingActivity, coordinates: featureAndCoordinates.coordinates })
        acc.features.push(featureAndCoordinates.feature)
      }

      return acc
    },
    { displayedLogbookOverlays: [], features: [] }
  )
}

export const getFishingActivityFeatureOnTrackLine = (
  id: string,
  vesselTrackIncludingActivity: Vessel.VesselLineFeature,
  fishingActivityDateTime: Dayjs
): {
  coordinates: Coordinates
  feature: Feature<Geometry>
} => {
  const firstPositionDate = customDayjs(vesselTrackIncludingActivity.firstPositionDate).valueOf()
  const secondPositionDate = customDayjs(vesselTrackIncludingActivity.secondPositionDate).valueOf()

  const totalDistance = secondPositionDate - firstPositionDate
  const fishingActivityDistanceFromFirstPoint = fishingActivityDateTime.valueOf() - firstPositionDate
  const distanceFraction = fishingActivityDistanceFromFirstPoint / totalDistance

  const coordinates = vesselTrackIncludingActivity.getGeometry()!.getCoordinateAt(distanceFraction) as Coordinates
  const feature = new Feature({
    geometry: new Point(coordinates)
  })
  feature.setStyle(getFishingActivityCircleStyle())
  feature.setId(`${LayerProperties.VESSEL_TRACK.code}:logbook:${id}`)

  return {
    coordinates,
    feature
  }
}
