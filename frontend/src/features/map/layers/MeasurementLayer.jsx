import { getNauticalMilesFromMeters } from '@utils/getNauticalMilesFromMeters'
import { getCenter } from 'ol/extent'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import Circle from 'ol/geom/Circle'
import LineString from 'ol/geom/LineString'
import { circular, fromCircle } from 'ol/geom/Polygon'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import { unByKey } from 'ol/Observable'
import { transform } from 'ol/proj'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import VectorSource from 'ol/source/Vector'
import { getLength } from 'ol/sphere'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { measurementStyle, measurementStyleWithCenter } from './styles/measurement.style'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { MeasurementType, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import {
  removeMeasurementDrawed,
  resetMeasurementTypeToAdd,
  setCircleMeasurementInDrawing
} from '../../../domain/shared_slices/Measurement'
import saveMeasurement from '../../../domain/use_cases/measurement/saveMeasurement'
import { monitorfishMap } from '../monitorfishMap'
import MeasurementOverlay from '../overlays/MeasurementOverlay'

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

function MeasurementLayer() {
  const dispatch = useDispatch()

  const { circleMeasurementToAdd, measurementsDrawed, measurementTypeToAdd } = useSelector(state => state.measurement)

  const [measurementInProgress, _setMeasurementInProgress] = useState(null)
  const measurementInProgressRef = useRef(measurementInProgress)
  const setMeasurementInProgress = value => {
    measurementInProgressRef.current = value
    _setMeasurementInProgress(value)
  }
  const [drawObject, setDrawObject] = useState(null)
  const [vectorSource] = useState(
    new VectorSource({
      projection: OPENLAYERS_PROJECTION,
      wrapX: false
    })
  )
  const [vectorLayer] = useState(
    new VectorLayer({
      className: LayerProperties.MEASUREMENT.code,
      renderBuffer: 7,
      source: vectorSource,
      style: [measurementStyle, measurementStyleWithCenter],
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: LayerProperties.MEASUREMENT.zIndex
    })
  )

  useEffect(() => {
    function addLayerToMap() {
      if (vectorLayer) {
        monitorfishMap.getLayers().push(vectorLayer)
      }

      return () => {
        monitorfishMap.removeLayer(vectorLayer)
      }
    }

    addLayerToMap()
  }, [vectorLayer])

  useEffect(() => {
    function drawExistingFeaturesOnMap() {
      if (measurementsDrawed) {
        measurementsDrawed.forEach(measurement => {
          const feature = new GeoJSON({
            featureProjection: OPENLAYERS_PROJECTION
          }).readFeature(measurement.feature)

          vectorSource.addFeature(feature)
        })
      }
    }

    drawExistingFeaturesOnMap()
  }, [measurementsDrawed])

  useEffect(() => {
    if (measurementTypeToAdd) {
      function addEmptyNextMeasurement() {
        setMeasurementInProgress({
          coordinates: null,
          feature: null,
          measurement: null
        })
      }

      function drawNewFeatureOnMap() {
        const draw = new Draw({
          source: vectorSource,
          style: [measurementStyle, measurementStyleWithCenter],
          type: measurementTypeToAdd
        })

        monitorfishMap.addInteraction(draw)
        setDrawObject(draw)
      }

      addEmptyNextMeasurement()
      drawNewFeatureOnMap()
    }
  }, [measurementTypeToAdd])

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
        monitorfishMap.removeInteraction(drawObject)
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
          circleMeasurementToAdd.circleCoordinatesToAdd[latitude]
        ]
      } else if (circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw()) {
        coordinates = transform(measurementInProgress?.center, OPENLAYERS_PROJECTION, WSG84_PROJECTION)
      }

      const circleFeature = new Feature({
        geometry: circular(coordinates, radiusInMeters, numberOfVertices).transform(
          WSG84_PROJECTION,
          OPENLAYERS_PROJECTION
        ),
        style: [measurementStyle, measurementStyleWithCenter]
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
          coordinates: measurementInProgress.center,
          measurement: measurementInProgress.measurement
        })
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
      center: getCenter(event.feature.getGeometry().getExtent()),
      coordinates: event.feature.getGeometry().getLastCoordinate(),
      measurement: 0
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
            center: getCenter(geom.getExtent()),
            coordinates: tooltipCoordinates,
            measurement: nextMeasurementOutput
          })
        }
      }

      updateMeasurementOnNewPoint(changeEvent, firstTooltipCoordinates)
    })
  }

  return (
    <>
      {measurementsDrawed.map(measurement => (
        <MeasurementOverlay
          key={measurement.feature.id}
          coordinates={measurement.coordinates}
          deleteFeature={deleteFeature}
          id={measurement.feature.id}
          map={monitorfishMap}
          measurement={measurement.measurement}
        />
      ))}

      <div>
        {measurementInProgress ? (
          <MeasurementOverlay
            coordinates={measurementInProgress?.coordinates}
            map={monitorfishMap}
            measurement={measurementInProgress?.measurement}
          />
        ) : null}
      </div>
    </>
  )
}

export default React.memo(MeasurementLayer)
