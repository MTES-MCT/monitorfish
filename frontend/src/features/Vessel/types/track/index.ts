import { LayerProperties, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import {
  getArrowStyle,
  getCircleStyle,
  getLineStyle
} from '@features/Vessel/layers/VesselsTracksLayer/vesselTrack.style'
import { type Coordinates, customDayjs } from '@mtes-mct/monitor-ui'
import { isEqual, uniqWith } from 'lodash-es'
import { extend } from 'ol/extent'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'

import { TRACK_TYPE_RECORD } from './constants'
import { calculatePointsDistance, calculateSplitPointCoordinates } from '../../../../utils'

import type { Vessel } from '@features/Vessel/Vessel.types'

const NUMBER_HOURS_TIME_ELLIPSIS = 4
const FIRST_POSITION = 0

/**
 * Get OpenLayers features from vessel positions
 *
 * {@see Feature}
 */
export function getFeaturesFromPositions(
  positions: Vessel.VesselPosition[],
  vesselCompositeIdentifier: Vessel.VesselCompositeIdentifier
): (Vessel.VesselPointFeature | Vessel.VesselArrowFeature | Vessel.VesselLineFeature)[] {
  const hasOnlyOnePosition = positions?.length === 1
  if (hasOnlyOnePosition) {
    return getPositionFeatureOfIndex(positions, vesselCompositeIdentifier, FIRST_POSITION)
  }

  const uniquePositions = uniqWith(
    positions,
    (a, b) => isEqual(a.latitude, b.latitude) && isEqual(a.longitude, b.longitude)
  )
  const hasOnlyOneUniquePosition = uniquePositions?.length === 1
  if (hasOnlyOneUniquePosition) {
    // Get last position
    return getPositionFeatureOfIndex(positions, vesselCompositeIdentifier, positions.length - 1)
  }

  let features: (Vessel.VesselPointFeature | Vessel.VesselArrowFeature | Vessel.VesselLineFeature)[] = []
  const positionsPointFeatures = buildPointFeatures(positions, vesselCompositeIdentifier)
  features = features.concat(positionsPointFeatures)

  const vesselTrackLineFeatures = buildLineStringFeatures(positions, vesselCompositeIdentifier)
  features = features.concat(vesselTrackLineFeatures)

  const arrowPointFeatures = buildArrowPointFeatures(vesselTrackLineFeatures, vesselCompositeIdentifier)
  features = features.concat(arrowPointFeatures)

  return features
}

function getPositionFeatureOfIndex(
  positions: Vessel.VesselPosition[],
  vesselCompositeIdentifier: Vessel.VesselCompositeIdentifier,
  index: number
) {
  const position = positions[index]
  if (!position) {
    throw new Error('No position given')
  }

  const coordinates = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
  const feature = buildPointFeature(coordinates as Coordinates, FIRST_POSITION, position, vesselCompositeIdentifier)

  return [feature]
}

function buildPointFeatures(
  positions: Vessel.VesselPosition[],
  vesselCompositeIdentifier: Vessel.VesselCompositeIdentifier
): Vessel.VesselPointFeature[] {
  return positions
    .map((position, currentIndex) => {
      const coordinates = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

      return buildPointFeature(coordinates as Coordinates, currentIndex, position, vesselCompositeIdentifier)
    })
    .filter((circlePoint): circlePoint is Vessel.VesselPointFeature => circlePoint !== null)
}

function buildPointFeature(
  coordinates: Coordinates,
  index: number,
  position: Vessel.VesselPosition,
  vesselCompositeIdentifier: Vessel.VesselCompositeIdentifier
): Vessel.VesselPointFeature {
  const pointFeature = new Feature({
    geometry: new Point(coordinates)
  }) as Vessel.VesselPointFeature
  // TODO Properties are removed when included directly in the `geometryOrProperties` of the Feature instantiation
  pointFeature.name = `${LayerProperties.VESSEL_TRACK.code}:position:${index}`
  pointFeature.course = position.course
  pointFeature.positionType = position.positionType
  pointFeature.speed = position.speed
  pointFeature.dateTime = position.dateTime

  pointFeature.setId(`${LayerProperties.VESSEL_TRACK.code}:${vesselCompositeIdentifier}:position:${index}`)
  const trackColor = getTrackType([position], false).color
  pointFeature.setStyle(getCircleStyle(trackColor))

  return pointFeature
}

function buildArrowPointFeatures(
  vesselTrackLines,
  vesselCompositeIdentifier: Vessel.VesselCompositeIdentifier
): Vessel.VesselArrowFeature[] {
  return vesselTrackLines
    .map((feature, index) => {
      const pointsDistance = calculatePointsDistance(
        feature.getGeometry().getCoordinates()[0],
        feature.getGeometry().getCoordinates()[1]
      )
      const arrowPointCoordinates = calculateSplitPointCoordinates(
        feature.getGeometry().getCoordinates()[0],
        feature.getGeometry().getCoordinates()[1],
        pointsDistance,
        pointsDistance / 2
      )

      const arrowFeature = new Feature({
        geometry: new Point(arrowPointCoordinates)
      }) as Vessel.VesselArrowFeature
      // TODO Properties are removed when included directly in the `geometryOrProperties` of the Feature instantiation
      arrowFeature.name = `${LayerProperties.VESSEL_TRACK.code}:arrow:${index}`
      arrowFeature.course = feature.course

      arrowFeature.setId(`${LayerProperties.VESSEL_TRACK.code}:${vesselCompositeIdentifier}:arrow:${index}`)
      const trackArrow = TRACK_TYPE_RECORD[feature.trackType.code].arrow
      const arrowStyle = getArrowStyle(trackArrow, arrowFeature.course)

      arrowFeature.setStyle((_, resolution) => {
        arrowStyle[0].getImage().setScale(0.3 + 1 / resolution ** (1 / 6))

        return arrowStyle
      })

      return arrowFeature
    })
    .filter(arrowPoint => arrowPoint)
}

function buildLineStringFeatures(
  positions: Vessel.VesselPosition[],
  vesselCompositeIdentifier: Vessel.VesselCompositeIdentifier
): Vessel.VesselLineFeature[] {
  return positions
    .filter(position => position)
    .map((firstPosition, index) => {
      const lastPointIndex = index + 1
      if (positions.length === lastPointIndex) {
        return null
      }

      const secondPosition = positions[index + 1]
      if (!secondPosition) {
        return null
      }
      const firstPoint = transform(
        [firstPosition.longitude, firstPosition.latitude],
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      )
      const secondPoint = transform(
        [secondPosition.longitude, secondPosition.latitude],
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      )

      if (isEqual(firstPoint, secondPoint)) {
        return null
      }

      const rotation = calculateCourse(secondPoint, firstPoint)
      const firstPositionDate = new Date(firstPosition.dateTime)
      const secondPositionDate = new Date(secondPosition.dateTime)
      const isTimeEllipsis = isTimeEllipsisBetweenPositions(firstPositionDate, secondPositionDate)

      const feature = new Feature({
        geometry: new LineString([firstPoint, secondPoint])
      }) as Vessel.VesselLineFeature
      // TODO Properties are removed when included directly in the `geometryOrProperties` of the Feature instantiation
      feature.firstPositionDate = firstPositionDate
      feature.secondPositionDate = secondPositionDate
      feature.isTimeEllipsis = isTimeEllipsis
      feature.trackType = getTrackType([firstPosition, secondPosition], isTimeEllipsis)
      if (rotation) {
        feature.course = -rotation
      }
      feature.speed = firstPosition.speed

      feature.setId(`${LayerProperties.VESSEL_TRACK.code}:${vesselCompositeIdentifier}:line:${index}`)
      feature.setStyle(getLineStyle(feature.isTimeEllipsis, feature.trackType))

      return feature
    })
    .filter((lineString): lineString is Vessel.VesselLineFeature => lineString !== null)
}

export function getTrackType(positions: Vessel.VesselPosition[], isTimeEllipsis) {
  const [firstPosition, secondPosition] = positions

  if (isTimeEllipsis) {
    return TRACK_TYPE_RECORD.ELLIPSIS
  }

  const isFeatureLine = !!(firstPosition && secondPosition)
  switch (isFeatureLine) {
    case true: {
      if (firstPosition?.isFishing && secondPosition?.isFishing) {
        return TRACK_TYPE_RECORD.FISHING
      }

      break
    }
    case false: {
      if (firstPosition?.isFishing) {
        return TRACK_TYPE_RECORD.FISHING
      }

      break
    }
    default:
      throw Error('Should not happen')
  }

  return TRACK_TYPE_RECORD.TRANSIT
}

function calculateCourse(secondPoint: Array<number>, firstPoint: Array<number>): number | undefined {
  if (!firstPoint[0] || !firstPoint[1] || !secondPoint[0] || !secondPoint[1]) {
    return undefined
  }

  const dx = secondPoint[0] - firstPoint[0]
  const dy = secondPoint[1] - firstPoint[1]

  return Math.atan2(dy, dx)
}

function isTimeEllipsisBetweenPositions(firstPositionDate: Date, secondPositionDate: Date) {
  const positionDateWithFourHoursOffset = customDayjs(new Date(firstPositionDate.getTime()))
    .add(NUMBER_HOURS_TIME_ELLIPSIS, 'hours')
    .toDate()

  return positionDateWithFourHoursOffset.getTime() < secondPositionDate.getTime()
}

export function removeFishingActivitiesFeatures(features, vectorSource) {
  features
    .filter(
      feature =>
        feature?.getId()?.toString()?.includes(LayerProperties.VESSEL_TRACK.code) &&
        feature?.getId()?.toString()?.includes('logbook')
    )
    .forEach(feature => vectorSource.removeFeature(feature))
}

export function removeVesselTrackFeatures(features, vectorSource, vesselCompositeIdentifier) {
  features
    .filter(feature => feature?.getId()?.toString()?.includes(vesselCompositeIdentifier))
    .map(feature => vectorSource.removeFeature(feature))
}

export function getVesselTrackExtent(vesselTrackFeatures, vesselCompositeIdentifier) {
  let vesselTrackExtent = vesselTrackFeatures[0].getGeometry().getExtent().slice(0)

  vesselTrackFeatures
    .filter(feature => feature.getId().includes(vesselCompositeIdentifier))
    .forEach(feature => {
      vesselTrackExtent = extend(vesselTrackExtent, feature.getGeometry().getExtent())
    })

  return vesselTrackExtent
}

export function updateTrackCircleStyle(features, vesselTrackCircle, radius) {
  if (vesselTrackCircle) {
    const feature = features.find(_feature => _feature.dateTime === vesselTrackCircle.dateTime)

    if (feature) {
      const featureColor = feature?.getStyle()[0].getImage()?.getFill()?.getColor()

      feature.setStyle(getCircleStyle(featureColor, radius))
    }
  }
}
