import Draw from 'ol/interaction/Draw'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { MeasurementTypes, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'

import { unByKey } from 'ol/Observable'
import LineString from 'ol/geom/LineString'
import { getLength } from 'ol/sphere'

import {
  removeMeasurementDrawed,
  resetMeasurementTypeToAdd,
  setCircleMeasurementInDrawing,
} from '../domain/shared_slices/Measurement'

import VectorLayer from 'ol/layer/Vector'
import Circle from 'ol/geom/Circle'
import { circular, fromCircle } from 'ol/geom/Polygon'
import Feature from 'ol/Feature'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import GeoJSON from 'ol/format/GeoJSON'

import saveMeasurement from '../domain/use_cases/measurement/saveMeasurement'
import MeasurementOverlay from '../features/map/overlays/MeasurementOverlay'
import { getNauticalMilesFromMeters } from '../utils'
import { measurementStyle, measurementStyleWithCenter } from './styles/measurement.style'

import { transform } from 'ol/proj'
import { getCenter } from 'ol/extent'

import Layers from '../domain/entities/layers'

const DRAW_START_EVENT = 'drawstart'
const DRAW_ABORT_EVENT = 'drawabort'
const DRAW_END_EVENT = 'drawend'

const getNauticalMilesRadiusOfCircle = circle => {
  const polygon = fromCircle(circle)

  return getNauticalMilesRadiusOfCircularPolygon(polygon)
}

const getNauticalMilesOfLine = line => {
  const length = getLength(line)

  return `${getNauticalMilesFromMeters(length)} nm`
}

function getNauticalMilesRadiusOfCircularPolygon(polygon) {
  const length = getLength(polygon)
  const radius = length / (2 * Math.PI)

  return `r = ${getNauticalMilesFromMeters(radius)} nm`
}

function MeasurementLayer({ map }) {
  const dispatch = useDispatch()

  const { measurementTypeToAdd, measurementsDrawed, circleMeasurementToAdd } = useSelector(state => state.measurement)

  const [measurementInProgress, _setMeasurementInProgress] = useState(null)
  const measurementInProgressRef = useRef(measurementInProgress)
  const setMeasurementInProgress = value => {
    measurementInProgressRef.current = value
    _setMeasurementInProgress(value)
  }
  const [drawObject, setDrawObject] = useState(null)
  const [vectorSource] = useState(
    new VectorSource({
      wrapX: false,
      projection: OPENLAYERS_PROJECTION,
    }),
  )
  const [vectorLayer] = useState(
    new VectorLayer({
      source: vectorSource,
      renderBuffer: 7,
      updateWhileAnimating: true,
      style: [measurementStyle, measurementStyleWithCenter],
    updateWhileInteracting: true,
      className: Layers.MEASUREMENT.code,
      zIndex: Layers.MEASUREMENT.zIndex,
    }),
  )

  useEffect(() => {
    function addLayerToMap() {
      if (map && vectorLayer) {
        map.getLayers().push(vectorLayer)
      }

      return () => {
        if (map) {
          map.removeLayer(vectorLayer)
        }
      }
    }

    addLayerToMap()
  }, [map, vectorLayer])

  useEffect(() => {
    function drawExistingFeaturesOnMap() {
      if (measurementsDrawed && map) {
        measurementsDrawed.forEach(measurement => {
          const feature = new GeoJSON({
            featureProjection: OPENLAYERS_PROJECTION,
          }).readFeature(measurement.feature)

          vectorSource.addFeature(feature)
        })
      }
    }

    drawExistingFeaturesOnMap()
  }, [measurementsDrawed, map])

  useEffect(() => {
    if (map && measurementTypeToAdd) {
      function addEmptyNextMeasurement() {
        setMeasurementInProgress({
          feature: null,
          coordinates: null,
          measurement: null
        })
      }

      function drawNewFeatureOnMap() {
        const draw = new Draw({
          source: vectorSource,
          style: [measurementStyle, measurementStyleWithCenter],
          type: measurementTypeToAdd
        })

        map.addInteraction(draw)
        setDrawObject(draw)
      }

      addEmptyNextMeasurement()
      drawNewFeatureOnMap()
    }
  }, [map, measurementTypeToAdd])

  useEffect(() => {
    function removeInteraction() {
      if (!measurementTypeToAdd && drawObject) {
        setDrawObject(null)
        setMeasurementInProgress(null)

        waitForUnwantedZoomAndQuitInteraction()
      }
    }

    function waitForUnwantedZoomAndQuitInteraction() {
      setTimeout(() => {
        map.removeInteraction(drawObject)
      }, 300)
    }

    removeInteraction()
  }, [measurementTypeToAdd])

  useEffect(() => {
    function addCustomCircleMeasurement() {
      const metersForOneNauticalMile = 1852
      const longitude = 1
      const latitude = 0
      const numberOfVertices = 64

      if (
        !circleMeasurementHasCoordinatesAndRadiusFromForm() &&
        !circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw()
      ) {
        return
      }

      function circleMeasurementHasCoordinatesAndRadiusFromForm() {
        return circleMeasurementToAdd?.circleCoordinatesToAdd?.length === 2 && circleMeasurementToAdd?.circleRadiusToAdd
      }

      function circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw() {
        return circleMeasurementToAdd?.circleRadiusToAdd && measurementInProgress?.center?.length === 2
      }

      const radiusInMeters = METERS_PER_UNIT.m * circleMeasurementToAdd.circleRadiusToAdd * metersForOneNauticalMile
      let coordinates = []
      if (circleMeasurementHasCoordinatesAndRadiusFromForm()) {
        coordinates = [
          circleMeasurementToAdd.circleCoordinatesToAdd[longitude],
          circleMeasurementToAdd.circleCoordinatesToAdd[latitude],
        ]
      } else if (circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw()) {
        coordinates = transform(measurementInProgress?.center, OPENLAYERS_PROJECTION, WSG84_PROJECTION)
      }

      const circleFeature = new Feature({
        geometry: circular(coordinates, radiusInMeters, numberOfVertices).transform(
          WSG84_PROJECTION,
          OPENLAYERS_PROJECTION,
        ),
        style: [measurementStyle, measurementStyleWithCenter],
      })
      dispatch(saveMeasurement(circleFeature, `r = ${circleMeasurementToAdd.circleRadiusToAdd} nm`))
    }

    addCustomCircleMeasurement()
  }, [circleMeasurementToAdd])

  useEffect(() => {
    function handleDrawEvents() {
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

    handleDrawEvents()
  }, [drawObject])

  useEffect(() => {
    if (measurementInProgress?.center || measurementInProgress?.measurement) {
      dispatch(
        setCircleMeasurementInDrawing({
          measurement: measurementInProgress.measurement,
          coordinates: measurementInProgress.center,
        }),
      )
    }
  }, [measurementInProgress])

  function deleteFeature(featureId) {
    const feature = vectorSource.getFeatureById(featureId)
    if (feature) {
      vectorSource.removeFeature(feature)
      vectorSource.changed()
    }

    dispatch(removeMeasurementDrawed(featureId))
  }

  function startDrawing(event) {
    const firstTooltipCoordinates = event.coordinate

    setMeasurementInProgress({
      coordinates: event.feature.getGeometry().getLastCoordinate(),
      measurement: 0,
      center: getCenter(event.feature.getGeometry().getExtent()),
    })

    return event.feature.getGeometry().on('change', changeEvent => {
      function updateMeasurementOnNewPoint(event, tooltipCoordinates) {
        const geom = event.target

        if (geom instanceof LineString) {
          const nextMeasurementOutput = getNauticalMilesOfLine(geom)
          tooltipCoordinates = geom.getLastCoordinate()

          setMeasurementInProgress({
            coordinates: tooltipCoordinates,
            measurement: nextMeasurementOutput
          })
        } else if (geom instanceof Circle) {
          const nextMeasurementOutput = getNauticalMilesRadiusOfCircle(geom)
          tooltipCoordinates = geom.getLastCoordinate()

          setMeasurementInProgress({
            coordinates: tooltipCoordinates,
            measurement: nextMeasurementOutput,
            center: getCenter(geom.getExtent()),
          })
        }
      }

      updateMeasurementOnNewPoint(changeEvent, firstTooltipCoordinates)
    })
  }

  return (
    <>
      {measurementsDrawed.map(measurement => <MeasurementOverlay
            id={measurement.feature.id}
            key={measurement.feature.id}
            map={map}
            measurement={measurement.measurement}
            coordinates={measurement.coordinates}
            deleteFeature={deleteFeature}
          />)
      })}

      <div>
        {measurementInProgress ? (
          <MeasurementOverlay
            map={map}
            measurement={measurementInProgress?.measurement}
            coordinates={measurementInProgress?.coordinates}
          />
        ) : null}
      </div>
    </>
  )
}

export default React.memo(MeasurementLayer)
