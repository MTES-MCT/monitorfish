import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Draw from 'ol/interaction/Draw'
import { unByKey } from 'ol/Observable'
import LineString from 'ol/geom/LineString'
import { getLength } from 'ol/sphere'
import { addMeasurementDrawed, removeMeasurementDrawed, resetMeasurementTypeToAdd } from '../domain/reducers/Map'
import VectorLayer from 'ol/layer/Vector'
import Circle from 'ol/geom/Circle'
import { circular, fromCircle } from 'ol/geom/Polygon'
import Feature from 'ol/Feature'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import GeoJSON from 'ol/format/GeoJSON'
import MeasurementOverlay from '../components/overlays/MeasurementOverlay'
import { measurementStyle } from './styles/featuresStyles'

const MeasurementLayer = ({ map }) => {
  const measurementType = useSelector(state => state.map.measurementTypeToAdd)
  const measurementsDrawed = useSelector(state => state.map.measurementsDrawed)
  const circleMeasurementToAdd = useSelector(state => state.map.circleMeasurementToAdd)
  const dispatch = useDispatch()

  const [measurementInProgress, _setMeasurementInProgress] = useState(null)
  const measurementInProgressRef = useRef(measurementInProgress)
  const setMeasurementInProgress = value => {
    measurementInProgressRef.current = value
    _setMeasurementInProgress(value)
  }
  const [noDeleteAvailable, setNoDeleteAvailable] = useState(false)
  const [drawObject, setDrawObject] = useState(null)
  const [vectorSource] = useState(new VectorSource({ wrapX: false, projection: OPENLAYERS_PROJECTION }))
  const [vectorLayer] = useState(new VectorLayer({
    source: vectorSource,
    style: measurementStyle,
    renderBuffer: 7,
    updateWhileAnimating: true,
    updateWhileInteracting: true
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
    if (drawObject) {
      let listener

      drawObject.on('drawstart', event => {
        listener = startDrawing(event)
      })

      drawObject.on('drawabort', event => {
        abortDrawing(event, listener)
      })

      drawObject.on('drawend', event => {
        endDrawing(event, listener)
      })
    }
  }, [drawObject])

  function addLayerToMap () {
    if (map && vectorLayer) {
      map.getLayers().push(vectorLayer)
    }
  }

  function drawExistingFeaturesOnMap () {
    if (measurementsDrawed && map) {
      measurementsDrawed.forEach((measurement, index) => {
        const measurementDrawed = measurementsDrawed[index]

        const feature = new GeoJSON({
          featureProjection: 'EPSG:3857'
        }).readFeature(measurementDrawed.feature)

        feature.setId(measurement.feature.id)
        vectorSource.addFeature(feature)
      })
    }
  }

  function removeInteraction () {
    if (!measurementType && drawObject) {
      map.removeInteraction(drawObject)
      setDrawObject(null)
      setMeasurementInProgress(null)
    }
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
      circleMeasurementToAdd.circleCoordinatesToAdd.length &&
      circleMeasurementToAdd.circleRadiusToAdd) {
      const radiusInMeters = METERS_PER_UNIT.m * circleMeasurementToAdd.circleRadiusToAdd * metersForOneNauticalMile

      const coordinates = [circleMeasurementToAdd.circleCoordinatesToAdd[longitude], circleMeasurementToAdd.circleCoordinatesToAdd[latitude]]
      const circleFeature = new Feature({
        geometry: circular(coordinates, radiusInMeters, numberOfVertices).transform(WSG84_PROJECTION, OPENLAYERS_PROJECTION),
        style: measurementStyle
      })

      circleFeature.setId(circleFeature.ol_uid)

      const tooltipCoordinates = circleFeature.getGeometry().getLastCoordinate()
      dispatch(addMeasurementDrawed({
        feature: getGeoJSONFromFeature(circleFeature),
        measurement: `r = ${circleMeasurementToAdd.circleRadiusToAdd} nm`,
        coordinates: tooltipCoordinates
      }))
    }
  }

  function getGeoJSONFromFeature (feature) {
    const parser = new GeoJSON()
    return parser.writeFeatureObject(feature, { featureProjection: OPENLAYERS_PROJECTION })
  }

  function saveMeasurement (feature, measurement) {
    const geoJSONFeature = getGeoJSONFromFeature(feature)

    const tooltipCoordinates = feature.getGeometry().getLastCoordinate()
    dispatch(addMeasurementDrawed({
      feature: geoJSONFeature,
      measurement: measurement,
      coordinates: tooltipCoordinates
    }))
  }

  function deleteFeature (featureId) {
    const feature = vectorSource.getFeatureById(featureId)
    if (feature) {
      setNoDeleteAvailable(true)
      vectorSource.removeFeature(feature)
      vectorSource.changed()
    }

    vectorSource.once("change", () => setNoDeleteAvailable(false))
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
      onNewPoint(changeEvent, firstTooltipCoordinates)
    })
  }

  function abortDrawing (event, listener) {
    unByKey(listener)
    dispatch(resetMeasurementTypeToAdd())
    setMeasurementInProgress(null)
  }

  function endDrawing (event, listener) {
    event.feature.setId(event.feature.ol_uid)

    if (event.feature.getGeometry() instanceof Circle) {
      event.feature.setGeometry(fromCircle(event.feature.getGeometry()))
    }

    saveMeasurement(event.feature, measurementInProgressRef.current.measurement)
    setMeasurementInProgress(null)
    unByKey(listener)
    dispatch(resetMeasurementTypeToAdd())
  }

  function onNewPoint (event, tooltipCoordinates) {
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

  function getNauticalMilesRadiusFromPolygon (polygon) {
    const length = getLength(polygon)
    const radius = length / (2 * Math.PI)

    return `r = ${Math.round((radius / 1000) * 100 * 0.539957) / 100} nm`
  }

  const getNauticalMilesRadiusOfCircle = circle => {
    const poly = fromCircle(circle)
    return getNauticalMilesRadiusFromPolygon(poly)
  }

  const getNauticalMilesOfLine = line => {
    const length = getLength(line)

    return `${Math.round((length / 1000) * 100 * 0.539957) / 100} nm`
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
            noDeleteAvailable={noDeleteAvailable}
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
