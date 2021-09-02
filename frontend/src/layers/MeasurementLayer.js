import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Draw from 'ol/interaction/Draw'
import { unByKey } from 'ol/Observable'
import LineString from 'ol/geom/LineString'
import { getLength } from 'ol/sphere'
import { removeMeasurementDrawed, resetMeasurementTypeToAdd } from '../domain/shared_slices/Map'
import VectorLayer from 'ol/layer/Vector'
import Circle from 'ol/geom/Circle'
import { circular, fromCircle } from 'ol/geom/Polygon'
import Feature from 'ol/Feature'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import GeoJSON from 'ol/format/GeoJSON'
import MeasurementOverlay from '../features/map/overlays/MeasurementOverlay'
import { getNauticalMilesFromMeters } from '../utils'
import saveMeasurement from '../domain/use_cases/saveMeasurement'
import { measurementStyle } from './styles/measurement.style'

const DRAW_START_EVENT = 'drawstart'
const DRAW_ABORT_EVENT = 'drawabort'
const DRAW_END_EVENT = 'drawend'

const MeasurementLayer = ({ map }) => {
  const dispatch = useDispatch()

  const {
    measurementType,
    measurementsDrawed,
    circleMeasurementToAdd
  } = useSelector(state => state.map)

  const [measurementInProgress, _setMeasurementInProgress] = useState(null)
  const measurementInProgressRef = useRef(measurementInProgress)
  const setMeasurementInProgress = value => {
    measurementInProgressRef.current = value
    _setMeasurementInProgress(value)
  }
  const [drawObject, setDrawObject] = useState(null)
  const [vectorSource] = useState(new VectorSource({ wrapX: false, projection: OPENLAYERS_PROJECTION }))
  const [vectorLayer] = useState(new VectorLayer({
    source: vectorSource,
    renderBuffer: 7,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: measurementStyle
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map, vectorLayer])

  useEffect(() => {
    drawExistingFeaturesOnMap()
  }, [measurementsDrawed, map])

  useEffect(() => {
    if (map && measurementType) {
      addEmptyNextMeasurement()
      drawNewFeatureOnMap()
    }
  }, [map, measurementType])

  useEffect(() => {
    removeInteraction()
  }, [measurementType])

  useEffect(() => {
    addCustomCircleMeasurement()
  }, [circleMeasurementToAdd])

  useEffect(() => {
    handleDrawEvents()
  }, [drawObject])

  function addLayerToMap () {
    if (map && vectorLayer) {
      map.getLayers().push(vectorLayer)
    }

    return () => {
      if (map) {
        map.removeLayer(vectorLayer)
      }
    }
  }

  function handleDrawEvents () {
    if (drawObject) {
      let listener

      drawObject.on(DRAW_START_EVENT, event => {
        listener = startDrawing(event)
      })

      drawObject.on(DRAW_ABORT_EVENT, () => {
        unByKey(listener)
        dispatch(resetMeasurementTypeToAdd())
        setMeasurementInProgress(null)
      })

      drawObject.on(DRAW_END_EVENT, event => {
        dispatch(saveMeasurement(event.feature, measurementInProgressRef.current.measurement))

        unByKey(listener)
        dispatch(resetMeasurementTypeToAdd())
        setMeasurementInProgress(null)
      })
    }
  }

  function drawExistingFeaturesOnMap () {
    if (measurementsDrawed && map) {
      measurementsDrawed.forEach(measurement => {
        const feature = new GeoJSON({
          featureProjection: OPENLAYERS_PROJECTION
        }).readFeature(measurement.feature)

        vectorSource.addFeature(feature)
      })
    }
  }

  function removeInteraction () {
    if (!measurementType && drawObject) {
      setDrawObject(null)
      setMeasurementInProgress(null)

      waitForUnwantedZoomAndQuitInteraction()
    }
  }

  function waitForUnwantedZoomAndQuitInteraction () {
    setTimeout(() => {
      map.removeInteraction(drawObject)
    }, 300)
  }

  function addEmptyNextMeasurement () {
    setMeasurementInProgress({
      feature: null,
      measurement: null,
      coordinates: null
    })
  }

  function addCustomCircleMeasurement () {
    const metersForOneNauticalMile = 1852
    const longitude = 1
    const latitude = 0
    const numberOfVertices = 64

    if (circleMeasurementToAdd &&
      circleMeasurementToAdd.circleCoordinatesToAdd.length === 2 &&
      circleMeasurementToAdd.circleRadiusToAdd) {
      const radiusInMeters = METERS_PER_UNIT.m * circleMeasurementToAdd.circleRadiusToAdd * metersForOneNauticalMile

      const coordinates = [circleMeasurementToAdd.circleCoordinatesToAdd[longitude], circleMeasurementToAdd.circleCoordinatesToAdd[latitude]]
      const circleFeature = new Feature({
        geometry: circular(coordinates, radiusInMeters, numberOfVertices).transform(WSG84_PROJECTION, OPENLAYERS_PROJECTION),
        style: measurementStyle
      })

      dispatch(saveMeasurement(circleFeature, `r = ${circleMeasurementToAdd.circleRadiusToAdd} nm`))
    }
  }

  function deleteFeature (featureId) {
    const feature = vectorSource.getFeatureById(featureId)
    if (feature) {
      vectorSource.removeFeature(feature)
      vectorSource.changed()
    }

    dispatch(removeMeasurementDrawed(featureId))
  }

  function drawNewFeatureOnMap () {
    const draw = new Draw({
      source: vectorSource,
      type: measurementType,
      style: measurementStyle
    })

    map.addInteraction(draw)
    setDrawObject(draw)
  }

  function startDrawing (event) {
    const firstTooltipCoordinates = event.coordinate

    setMeasurementInProgress({
      measurement: 0,
      coordinates: event.feature.getGeometry().getLastCoordinate()
    })

    return event.feature.getGeometry().on('change', changeEvent => {
      updateMeasurementOnNewPoint(changeEvent, firstTooltipCoordinates)
    })
  }

  function updateMeasurementOnNewPoint (event, tooltipCoordinates) {
    const geom = event.target

    if (geom instanceof LineString) {
      const nextMeasurementOutput = getNauticalMilesOfLine(geom)
      tooltipCoordinates = geom.getLastCoordinate()

      setMeasurementInProgress({
        measurement: nextMeasurementOutput,
        coordinates: tooltipCoordinates
      })
    } else if (geom instanceof Circle) {
      const nextMeasurementOutput = getNauticalMilesRadiusOfCircle(geom)
      tooltipCoordinates = geom.getLastCoordinate()

      setMeasurementInProgress({
        measurement: nextMeasurementOutput,
        coordinates: tooltipCoordinates
      })
    }
  }

  const getNauticalMilesRadiusOfCircle = circle => {
    const polygon = fromCircle(circle)

    return getNauticalMilesRadiusOfCircularPolygon(polygon)
  }

  const getNauticalMilesOfLine = line => {
    const length = getLength(line)

    return `${getNauticalMilesFromMeters(length)} nm`
  }

  function getNauticalMilesRadiusOfCircularPolygon (polygon) {
    const length = getLength(polygon)
    const radius = length / (2 * Math.PI)

    return `r = ${getNauticalMilesFromMeters(radius)} nm`
  }

  return (
    <>
      {
        measurementsDrawed.map(measurement => {
          return <MeasurementOverlay
            id={measurement.feature.id}
            key={measurement.feature.id}
            map={map}
            measurement={measurement.measurement}
            coordinates={measurement.coordinates}
            deleteFeature={deleteFeature}
          />
        })
      }

      <div>
        {
          measurementInProgress
            ? <MeasurementOverlay
              map={map}
              measurement={measurementInProgressRef.current.measurement}
              coordinates={measurementInProgressRef.current.coordinates}
            />
            : null
        }
      </div>
    </>
  )
}

export default MeasurementLayer
