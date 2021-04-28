import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import { arraysEqual, calculatePointsDistance, calculateSplitPointCoords } from '../utils'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Layers from '../domain/entities/layers'
import { setArrowStyle, setCircleStyle } from './styles/featuresStyles'
import { getTrackTypeFromSpeed } from '../domain/entities/vesselTrack'
import LineString from 'ol/geom/LineString'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

const VesselTrackLayer = ({ map }) => {
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    className: Layers.VESSEL_TRACK.code,
    source: vectorSource,
    zIndex: Layers.VESSEL_TRACK.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    showVesselTrack()
  }, [selectedVessel, map])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  function showVesselTrack () {
    if (map && selectedVessel && selectedVessel.positions && selectedVessel.positions.length) {
      const vesselTrackVector = buildVesselTrackVector(selectedVessel)
      vectorSource.clear(true)
      vectorSource.addFeatures(vesselTrackVector)
    } else if (map && !selectedVessel) {
      vectorSource.clear(true)
    }
  }

  function buildVesselTrackVector (vessel) {
    const vesselTrackLines = buildVesselTrackLines(vessel)

    const circlePoints = buildCirclePoints(vesselTrackLines, vessel.positions)
    circlePoints.forEach(circlePoint => {
      vesselTrackLines.push(circlePoint)
    })

    const arrowPoints = buildArrowPoints(vesselTrackLines)
    arrowPoints.forEach(arrowPoint => {
      vesselTrackLines.push(arrowPoint)
    })

    return vesselTrackLines
  }

  function buildCirclePoints (vesselTrackLines, positions) {
    return vesselTrackLines.map((feature, index) => {
      const firstPointCoordinatesOfLine = feature.getGeometry().getCoordinates()[0]
      const positionsOnLine = positions.filter(position => {
        const point = transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
        return arraysEqual(firstPointCoordinatesOfLine, point)
      })

      let firstPositionOnLine
      if (positionsOnLine.length > 0 && positionsOnLine[0]) {
        firstPositionOnLine = positionsOnLine[0]
      } else {
        firstPositionOnLine = null
      }

      const circleFeature = new Feature({
        geometry: new Point(feature.getGeometry().getCoordinates()[0]),
        name: Layers.VESSEL_TRACK.code + ':position:' + index,
        course: firstPositionOnLine ? firstPositionOnLine.course : null,
        positionType: firstPositionOnLine ? firstPositionOnLine.positionType : null,
        speed: firstPositionOnLine ? firstPositionOnLine.speed : null,
        dateTime: firstPositionOnLine ? firstPositionOnLine.dateTime : null
      })

      circleFeature.setId(Layers.VESSEL_TRACK.code + ':position:' + index)
      const trackColor = getTrackTypeFromSpeed(feature.getProperties().speed).color
      setCircleStyle(trackColor, circleFeature)

      return circleFeature
    }).filter(circlePoint => circlePoint)
  }

  function buildArrowPoints (vesselTrackLines) {
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

  function buildVesselTrackLines (vessel) {
    return vessel.positions
      .filter(position => position)
      .map((position, index) => {
        const lastPoint = index + 1
        if (lastPoint === vessel.positions.length) {
          return null
        }

        // transform coord to EPSG 3857 standard Lat Long
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

  return null
}

export default VesselTrackLayer
