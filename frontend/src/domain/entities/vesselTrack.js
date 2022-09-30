import { extend } from 'ol/extent'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'

import { COLORS } from '../../constants/constants'
import { getLineStyle, getArrowStyle, getCircleStyle } from '../../layers/styles/vesselTrack.style'
import { arraysEqual, calculatePointsDistance, calculateSplitPointCoords } from '../../utils'
import Layers from './layers'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'

const NUMBER_HOURS_TIME_ELLIPSIS = 4

export class VesselTrack {
  /**
   * Vessel track object for building OpenLayers vessel track features
   * @param {VesselPosition[]} positions
   * @param {VesselId} vesselId
   */
  constructor(positions, vesselId) {
    let vesselTrackLineFeatures = this.buildVesselTrackLineFeatures(positions, vesselId)

    const hasMoreThanOnePoint = vesselTrackLineFeatures?.length
    const hasOnlyOnePoint = positions?.length

    if (hasMoreThanOnePoint) {
      const lastTrackLineFeature = vesselTrackLineFeatures[vesselTrackLineFeatures.length - 1]
      if (lastTrackLineFeature) {
        vesselTrackLineFeatures = vesselTrackLineFeatures.concat(lastTrackLineFeature)
      }

      const circlePointFeatures = this.buildCirclePointFeatures(vesselTrackLineFeatures, positions, vesselId)
      circlePointFeatures.forEach(circlePoint => {
        vesselTrackLineFeatures.push(circlePoint)
      })

      const arrowPointFeatures = this.buildArrowPointFeatures(vesselTrackLineFeatures, vesselId)
      arrowPointFeatures.forEach(arrowPoint => {
        vesselTrackLineFeatures.push(arrowPoint)
      })

      this.lastPositionCoordinates = circlePointFeatures[circlePointFeatures.length - 1].getGeometry().getCoordinates()
    } else if (hasOnlyOnePoint) {
      const position = positions[0]
      const point = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

      const circle = this.buildCircleFeature(point, 1, position, position.speed)

      this.lastPositionCoordinates = point
      this.features = [circle]
    }

    this.features = vesselTrackLineFeatures
  }

  buildCirclePointFeatures(vesselTrackLines, positions, identity) {
    return vesselTrackLines
      .map((feature, index) => {
        const pointCoordinatesOfLine = this.getFirstOrLastPointCoordinateOfLine(feature, vesselTrackLines, index)

        const positionsOnLine = positions.filter(position => {
          const point = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

          return arraysEqual(pointCoordinatesOfLine, point)
        })

        let firstPositionOnLine
        if (positionsOnLine.length > 0 && positionsOnLine[0]) {
          firstPositionOnLine = positionsOnLine[0]
        } else {
          firstPositionOnLine = null
        }

        return this.buildCircleFeature(
          pointCoordinatesOfLine,
          index,
          firstPositionOnLine,
          feature.speed,
          feature.isTimeEllipsis,
          identity
        )
      })
      .filter(circlePoint => circlePoint)
  }

  buildCircleFeature(coordinates, index, position, speed, isTimeEllipsis, identity) {
    const circleFeature = new Feature({
      geometry: new Point(coordinates)
    })
    circleFeature.name = `${Layers.VESSEL_TRACK.code}:position:${index}`
    circleFeature.course = position.course
    circleFeature.positionType = position.positionType
    circleFeature.speed = position.speed
    circleFeature.dateTime = position.dateTime

    circleFeature.setId(`${Layers.VESSEL_TRACK.code}:${identity}:position:${index}`)
    const trackColor = getTrackTypeFromSpeedAndEllipsis(speed, isTimeEllipsis).color
    circleFeature.setStyle(getCircleStyle(trackColor))

    return circleFeature
  }

  getFirstOrLastPointCoordinateOfLine(feature, vesselTrackLines, index) {
    let pointCoordinatesOfLine = feature.getGeometry().getCoordinates()[0]

    if (vesselTrackLines.length === index + 1) {
      pointCoordinatesOfLine = feature.getGeometry().getCoordinates()[1]
    }

    return pointCoordinatesOfLine
  }

  buildArrowPointFeatures(vesselTrackLines, identity) {
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
          geometry: new Point(newPoint),
          name: `${Layers.VESSEL_TRACK.code}:arrow:${index}`
        })
        arrowFeature.course = feature.course

        arrowFeature.setId(`${Layers.VESSEL_TRACK.code}:${identity}:arrow:${index}`)
        const trackArrow = getTrackTypeFromSpeedAndEllipsis(feature.speed, feature.isTimeEllipsis).arrow
        const arrowStyle = getArrowStyle(trackArrow, arrowFeature.course)

        arrowFeature.setStyle((feature, resolution) => {
          arrowStyle[0].getImage().setScale(0.3 + 1 / resolution ** (1 / 6))

          return arrowStyle
        })

        return arrowFeature
      })
      .filter(arrowPoint => arrowPoint)
  }

  buildVesselTrackLineFeatures(positions, vesselId) {
    return positions
      .filter(position => position)
      .map((position, index) => {
        const lastPoint = index + 1
        if (lastPoint === positions.length) {
          return null
        }

        const secondPosition = positions[index + 1]
        const firstPoint = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
        const secondPoint = transform(
          [secondPosition.longitude, secondPosition.latitude],
          WSG84_PROJECTION,
          OPENLAYERS_PROJECTION
        )

        const dx = secondPoint[0] - firstPoint[0]
        const dy = secondPoint[1] - firstPoint[1]
        const rotation = Math.atan2(dy, dx)

        const firstPositionDate = new Date(position.dateTime)
        const secondPositionDate = new Date(secondPosition.dateTime)
        const positionDateWithFourHoursOffset = new Date(firstPositionDate.getTime())
        positionDateWithFourHoursOffset.setHours(
          positionDateWithFourHoursOffset.getHours() + NUMBER_HOURS_TIME_ELLIPSIS
        )

        const feature = new Feature({
          geometry: new LineString([firstPoint, secondPoint])
        })
        feature.firstPositionDate = firstPositionDate
        feature.secondPositionDate = secondPositionDate
        feature.isTimeEllipsis = positionDateWithFourHoursOffset.getTime() < secondPositionDate.getTime()
        feature.trackType = getTrackTypeFromSpeedAndEllipsis(position.speed, feature.isTimeEllipsis)
        feature.course = -rotation
        feature.speed = position.speed

        feature.setId(`${Layers.VESSEL_TRACK.code}:${vesselId}:line:${index}`)
        feature.setStyle(getLineStyle(feature.isTimeEllipsis, feature.trackType))

        return feature
      })
      .filter(lineString => lineString)
  }
}

export const trackTypes = {
  ELLIPSIS: {
    arrow: 'arrow_gray.png',
    code: 'ELLIPSIS',
    color: COLORS.slateGrayLittleOpacity,
    description: '🕐 entre deux positions > 4h'
  },
  FISHING: {
    arrow: 'arrow_blue.png',
    code: 'FISHING',
    color: COLORS.trackFishing,
    description: 'En pêche (vitesse <= 4.5 Nds)'
  },
  TRANSIT: {
    arrow: 'arrow_green.png',
    code: 'TRANSIT',
    color: COLORS.trackTransit,
    description: 'En transit (vitesse > 4.5 Nds)'
  }
}

export function getTrackTypeFromSpeedAndEllipsis(speed, isTimeEllipsis) {
  if (isTimeEllipsis) {
    return trackTypes.ELLIPSIS
  }
  if (speed >= 0 && speed <= 4.5) {
    return trackTypes.FISHING
  }

  return trackTypes.TRANSIT
}

export function getVesselTrackLines(features) {
  return features.filter(
    feature =>
      feature?.getId()?.toString()?.includes(Layers.VESSEL_TRACK.code) && feature?.getId()?.toString()?.includes('line')
  )
}

export function removeFishingActivitiesFeatures(features, vectorSource) {
  features
    .filter(
      feature =>
        feature?.getId()?.toString()?.includes(Layers.VESSEL_TRACK.code) &&
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
    const feature = features.find(feature => feature.dateTime === vesselTrackCircle.dateTime)

    if (feature) {
      const featureColor = feature?.getStyle()[0].getImage()?.getFill()?.getColor()

      feature.setStyle(getCircleStyle(featureColor, radius))
    }
  }
}
