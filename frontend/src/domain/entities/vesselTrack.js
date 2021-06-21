import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Layers from './layers'
import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './map'
import { arraysEqual, calculatePointsDistance, calculateSplitPointCoords } from '../../utils'
import { setArrowStyle, setCircleStyle } from '../../layers/styles/featuresStyles'
import LineString from 'ol/geom/LineString'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

export class VesselTrack {
  /**
   * Vessel track object for building OpenLayers vessel track features
   * @param {Vessel} vessel
   */
  constructor (vessel) {
    let vesselTrackLineFeatures = this.buildVesselTrackLineFeatures(vessel)

    const hasMoreThanOnePoint = vesselTrackLineFeatures && vesselTrackLineFeatures.length
    if (hasMoreThanOnePoint) {
      const lastTrackLineFeature = vesselTrackLineFeatures[vesselTrackLineFeatures.length - 1]
      if (lastTrackLineFeature) {
        vesselTrackLineFeatures = vesselTrackLineFeatures.concat(lastTrackLineFeature)
      }

      const circlePointFeatures = this.buildCirclePointFeatures(vesselTrackLineFeatures, vessel.positions)
      circlePointFeatures.forEach(circlePoint => {
        vesselTrackLineFeatures.push(circlePoint)
      })

      const arrowPointFeatures = this.buildArrowPointFeatures(vesselTrackLineFeatures)
      arrowPointFeatures.forEach(arrowPoint => {
        vesselTrackLineFeatures.push(arrowPoint)
      })

      this.lastPositionCoordinates = circlePointFeatures[circlePointFeatures.length - 1].getGeometry().getCoordinates()
    } else if (vessel.positions && vessel.positions.length) {
      const position = vessel.positions[0]
      const point = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

      const circle = this.buildCircleFeature(point, 1, position, position.speed)

      this.lastPositionCoordinates = point
      this.features = [circle]
    }

    this.features = vesselTrackLineFeatures
  }

  buildCirclePointFeatures (vesselTrackLines, positions) {
    return vesselTrackLines.map((feature, index) => {
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

      return this.buildCircleFeature(pointCoordinatesOfLine, index, firstPositionOnLine, feature.getProperties().speed)
    }).filter(circlePoint => circlePoint)
  }

  buildCircleFeature (coordinates, index, position, speed) {
    const circleFeature = new Feature({
      geometry: new Point(coordinates),
      name: Layers.VESSEL_TRACK.code + ':position:' + index,
      course: position ? position.course : null,
      positionType: position ? position.positionType : null,
      speed: position ? position.speed : null,
      dateTime: position ? position.dateTime : null
    })

    circleFeature.setId(Layers.VESSEL_TRACK.code + ':position:' + index)
    const trackColor = getTrackTypeFromSpeed(speed).color
    setCircleStyle(trackColor, circleFeature)
    return circleFeature
  }

  getFirstOrLastPointCoordinateOfLine (feature, vesselTrackLines, index) {
    let pointCoordinatesOfLine = feature.getGeometry().getCoordinates()[0]

    if (vesselTrackLines.length === index + 1) {
      pointCoordinatesOfLine = feature.getGeometry().getCoordinates()[1]
    }

    return pointCoordinatesOfLine
  }

  buildArrowPointFeatures (vesselTrackLines) {
    return vesselTrackLines.map((feature, index) => {
      const pointsDistance = calculatePointsDistance(feature.getGeometry().getCoordinates()[0], feature.getGeometry().getCoordinates()[1])
      const newPoint = calculateSplitPointCoords(feature.getGeometry().getCoordinates()[0], feature.getGeometry().getCoordinates()[1], pointsDistance, pointsDistance / 2)

      const arrowFeature = new Feature({
        geometry: new Point(newPoint),
        name: Layers.VESSEL_TRACK.code + ':arrow:' + index,
        course: feature.getProperties().course
      })

      arrowFeature.setId(Layers.VESSEL_TRACK.code + ':arrow:' + index)
      const trackArrow = getTrackTypeFromSpeed(feature.getProperties().speed).arrow
      setArrowStyle(trackArrow, arrowFeature)

      return arrowFeature
    }).filter(arrowPoint => arrowPoint)
  }

  buildVesselTrackLineFeatures (vessel) {
    return vessel.positions
      .filter(position => position)
      .map((position, index) => {
        const lastPoint = index + 1
        if (lastPoint === vessel.positions.length) {
          return null
        }

        const firstPoint = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
        const secondPoint = transform([vessel.positions[index + 1].longitude, vessel.positions[index + 1].latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

        const dx = secondPoint[0] - firstPoint[0]
        const dy = secondPoint[1] - firstPoint[1]
        const rotation = Math.atan2(dy, dx)

        const trackType = getTrackTypeFromSpeed(position.speed)

        const feature = new Feature({
          geometry: new LineString([firstPoint, secondPoint]),
          trackType: trackType,
          course: -rotation,
          speed: position.speed
        })

        feature.setId(`${Layers.VESSEL_TRACK.code}:line:${index}`)
        feature.setStyle(new Style({
          fill: new Fill({ color: trackType.color, weight: 4 }),
          stroke: new Stroke({ color: trackType.color, width: 3 })
        }))

        return feature
      }).filter(lineString => lineString)
  }
}

export const trackTypes = {
  TRANSIT: {
    code: 'TRANSIT',
    color: '#3A9885',
    arrow: 'arrow_green.png',
    description: 'En transit (vitesse > 4.5 Nds)'
  },
  FISHING: {
    code: 'FISHING',
    color: '#05055E',
    arrow: 'arrow_blue.png',
    description: 'En pêche (vitesse <= 4.5 Nds)'
  }
}

export function getTrackTypeFromSpeed (speed) {
  if (speed >= 0 && speed <= 4.5) {
    return trackTypes.FISHING
  } else {
    return trackTypes.TRANSIT
  }
}
