import { extend } from 'ol/extent'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'

import { getArrowStyle, getCircleStyle, getLineStyle } from '../../../layers/styles/vesselTrack.style'
import { arraysEqual, calculatePointsDistance, calculateSplitPointCoords } from '../../../utils'
import { Layer } from '../layers/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../map'
import { TRACK_TYPE_RECORD } from './constants'

import type { VesselId, VesselPosition } from '../../types/vessel'
import type { VesselArrowFeature, VesselLineFeature, VesselPointFeature } from './constants'
import type { Coordinate } from 'ol/coordinate'

const NUMBER_HOURS_TIME_ELLIPSIS = 4
const FIRST_POSITION = 0

/**
 * Get OpenLayers features from vessel positions
 *
 * {@see Feature}
 */
export function getFeaturesFromPositions(
  positions: VesselPosition[],
  vesselId: VesselId
): (VesselPointFeature | VesselArrowFeature | VesselLineFeature)[] {
  const hasOnlyOnePosition = positions?.length === 1
  if (hasOnlyOnePosition) {
    return getFirstPositionFeature(positions, vesselId)
  }

  let features: (VesselPointFeature | VesselArrowFeature | VesselLineFeature)[] = []
  const vesselTrackLineFeatures = buildLineStringFeatures(positions, vesselId)
  const lastTrackLineFeature = vesselTrackLineFeatures[vesselTrackLineFeatures.length - 1]
  if (lastTrackLineFeature) {
    features = vesselTrackLineFeatures.concat(lastTrackLineFeature)
  }

  const circlePointFeatures = buildPointFeatures(vesselTrackLineFeatures, positions, vesselId)
  circlePointFeatures.forEach(circlePoint => {
    features.push(circlePoint)
  })

  const arrowPointFeatures = buildArrowPointFeatures(vesselTrackLineFeatures, vesselId)
  arrowPointFeatures.forEach(arrowPoint => {
    features.push(arrowPoint)
  })

  return features
}

function getFirstPositionFeature(positions: VesselPosition[], vesselId: VesselId) {
  const position = positions[FIRST_POSITION]
  if (!position) {
    throw new Error('No position given')
  }

  const coordinates = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
  const feature = buildPointFeature(coordinates, FIRST_POSITION, position, vesselId)

  return [feature]
}

function buildPointFeatures(vesselTrackLines, positions, identity): VesselPointFeature[] {
  return vesselTrackLines
    .map((feature, index) => {
      const pointCoordinatesOfLine = getFirstOrLastPointCoordinateOfLine(feature, vesselTrackLines, index)

      const positionsOnLine = positions.filter(position => {
        const point = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

        return arraysEqual(pointCoordinatesOfLine, point)
      })

      let firstPositionOnLine
      if (positionsOnLine.length > 0 && positionsOnLine[0]) {
        ;[firstPositionOnLine] = positionsOnLine
      } else {
        firstPositionOnLine = null
      }

      return buildPointFeature(pointCoordinatesOfLine, index, firstPositionOnLine, identity, feature.isTimeEllipsis)
    })
    .filter(circlePoint => circlePoint)
}

function buildPointFeature(
  coordinates: Coordinate,
  index: number,
  position: VesselPosition,
  identity: VesselId,
  isTimeEllipsis?: boolean
): VesselPointFeature {
  const circleFeature = new Feature({
    geometry: new Point(coordinates)
  }) as VesselPointFeature
  circleFeature.name = `${Layer.VESSEL_TRACK.code}:position:${index}`
  circleFeature.course = position.course
  circleFeature.positionType = position.positionType
  circleFeature.speed = position.speed
  circleFeature.dateTime = position.dateTime

  circleFeature.setId(`${Layer.VESSEL_TRACK.code}:${identity}:position:${index}`)
  const trackColor = getTrackTypeFromSpeedAndEllipsis(position.speed, isTimeEllipsis).color
  circleFeature.setStyle(getCircleStyle(trackColor))

  return circleFeature
}

function getFirstOrLastPointCoordinateOfLine(feature, vesselTrackLines, index) {
  const [first, second] = feature.getGeometry().getCoordinates()
  let pointCoordinatesOfLine = first

  if (vesselTrackLines.length === index + 1) {
    pointCoordinatesOfLine = second
  }

  return pointCoordinatesOfLine
}

function buildArrowPointFeatures(vesselTrackLines, identity): VesselArrowFeature[] {
  return vesselTrackLines
    .map((feature, index) => {
      const pointsDistance = calculatePointsDistance(
        feature.getGeometry().getCoordinates()[0],
        feature.getGeometry().getCoordinates()[1]
      )
      const newPoint = calculateSplitPointCoords(
        feature.getGeometry().getCoordinates()[0],
        feature.getGeometry().getCoordinates()[1],
        pointsDistance,
        pointsDistance / 2
      )

      const arrowFeature = new Feature({
        geometry: new Point(newPoint)
      }) as VesselArrowFeature
      arrowFeature.name = `${Layer.VESSEL_TRACK.code}:arrow:${index}`
      arrowFeature.course = feature.course

      arrowFeature.setId(`${Layer.VESSEL_TRACK.code}:${identity}:arrow:${index}`)
      const trackArrow = getTrackTypeFromSpeedAndEllipsis(feature.speed, feature.isTimeEllipsis).arrow
      const arrowStyle = getArrowStyle(trackArrow, arrowFeature.course)

      arrowFeature.setStyle((_, resolution) => {
        arrowStyle[0].getImage().setScale(0.3 + 1 / resolution ** (1 / 6))

        return arrowStyle
      })

      return arrowFeature
    })
    .filter(arrowPoint => arrowPoint)
}

function buildLineStringFeatures(positions: VesselPosition[], vesselId: VesselId): VesselLineFeature[] {
  return positions
    .filter(position => position)
    .map((position, index) => {
      const lastPoint = index + 1
      if (lastPoint === positions.length) {
        return null
      }

      const secondPosition = positions[index + 1]
      if (!secondPosition) {
        return null
      }
      const firstPoint = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
      const secondPoint = transform(
        [secondPosition.longitude, secondPosition.latitude],
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      )
      if (!firstPoint[0] || !firstPoint[1] || !secondPoint[0] || !secondPoint[1]) {
        return null
      }

      const dx = secondPoint[0] - firstPoint[0]
      const dy = secondPoint[1] - firstPoint[1]
      const rotation = Math.atan2(dy, dx)

      const firstPositionDate = new Date(position.dateTime)
      const secondPositionDate = new Date(secondPosition.dateTime)
      const positionDateWithFourHoursOffset = new Date(firstPositionDate.getTime())
      positionDateWithFourHoursOffset.setHours(positionDateWithFourHoursOffset.getHours() + NUMBER_HOURS_TIME_ELLIPSIS)

      const isTimeEllipsis = positionDateWithFourHoursOffset.getTime() < secondPositionDate.getTime()
      const feature = new Feature({
        geometry: new LineString([firstPoint, secondPoint])
      }) as VesselLineFeature
      feature.firstPositionDate = firstPositionDate
      feature.secondPositionDate = secondPositionDate
      feature.isTimeEllipsis = isTimeEllipsis
      feature.trackType = getTrackTypeFromSpeedAndEllipsis(position.speed, isTimeEllipsis)
      feature.course = -rotation
      feature.speed = position.speed

      feature.setId(`${Layer.VESSEL_TRACK.code}:${vesselId}:line:${index}`)
      feature.setStyle(getLineStyle(feature.isTimeEllipsis, feature.trackType))

      return feature
    })
    .filter((lineString): lineString is VesselLineFeature => lineString !== null)
}

export function getTrackTypeFromSpeedAndEllipsis(speed, isTimeEllipsis) {
  if (isTimeEllipsis) {
    return TRACK_TYPE_RECORD.ELLIPSIS
  }
  if (speed >= 0 && speed <= 4.5) {
    return TRACK_TYPE_RECORD.FISHING
  }

  return TRACK_TYPE_RECORD.TRANSIT
}

export function getVesselTrackLines(features) {
  return features.filter(
    feature =>
      feature?.getId()?.toString()?.includes(Layer.VESSEL_TRACK.code) && feature?.getId()?.toString()?.includes('line')
  )
}

export function removeFishingActivitiesFeatures(features, vectorSource) {
  features
    .filter(
      feature =>
        feature?.getId()?.toString()?.includes(Layer.VESSEL_TRACK.code) &&
        feature?.getId()?.toString()?.includes('logbook')
    )
    .forEach(feature => vectorSource.removeFeature(feature))
}

export function removeVesselTrackFeatures(features, vectorSource, vesselId) {
  features
    .filter(feature => feature?.getId()?.toString()?.includes(vesselId))
    .map(feature => vectorSource.removeFeature(feature))
}

export function fishingActivityIsWithinTrackLineDates(fishingActivityDateTimestamp, line) {
  return (
    fishingActivityDateTimestamp > new Date(line.firstPositionDate).getTime() &&
    fishingActivityDateTimestamp < new Date(line.secondPositionDate).getTime()
  )
}

export function getVesselTrackExtent(vesselTrackFeatures, vesselId) {
  let vesselTrackExtent = vesselTrackFeatures[0].getGeometry().getExtent().slice(0)

  vesselTrackFeatures
    .filter(feature => feature.getId().includes(vesselId))
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
