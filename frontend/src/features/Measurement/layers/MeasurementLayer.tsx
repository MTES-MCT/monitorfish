import { getNauticalMilesOfLine, getNauticalMilesRadiusOfCircle } from '@features/Measurement/layers/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { getCenter } from 'ol/extent'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import Circle from 'ol/geom/Circle'
import LineString from 'ol/geom/LineString'
import { circular } from 'ol/geom/Polygon'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import { unByKey } from 'ol/Observable'
import { transform } from 'ol/proj'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import VectorSource from 'ol/source/Vector'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { measurementStyle, measurementStyleWithCenter } from './measurement.style'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { monitorfishMap } from '../../map/monitorfishMap'
import MeasurementOverlay from '../components/MeasurementOverlay'
import { removeMeasurementDrawed, resetMeasurementTypeToAdd, setCircleMeasurementInDrawing } from '../slice'
import { saveMeasurement } from '../useCases/saveMeasurement'

import type { VectorLayerWithName } from '../../../domain/types/layer'
import type { MeasurementInProgress } from '@features/Measurement/types'
import type { Coordinate } from 'ol/coordinate'
import type Geometry from 'ol/geom/Geometry'
import type { Type } from 'ol/geom/Geometry'
import type { MutableRefObject } from 'react'

const DRAW_START_EVENT = 'drawstart'
const DRAW_ABORT_EVENT = 'drawabort'
const DRAW_END_EVENT = 'drawend'

function UnmemoizedMeasurementLayer() {
  const dispatch = useMainAppDispatch()
  const measurementTypeToAdd = useMainAppSelector(state => state.measurement.measurementTypeToAdd)
  const measurementsDrawed = useMainAppSelector(state => state.measurement.measurementsDrawed)
  const circleMeasurementToAdd = useMainAppSelector(state => state.measurement.circleMeasurementToAdd)

  const [measurementInProgress, _setMeasurementInProgress] = useState<MeasurementInProgress | undefined>(undefined)
  const measurementInProgressRef = useRef<MeasurementInProgress | undefined>(measurementInProgress)
  const setMeasurementInProgress = (value: MeasurementInProgress | undefined) => {
    measurementInProgressRef.current = value
    _setMeasurementInProgress(value)
  }
  const [drawObject, setDrawObject] = useState<Draw | undefined>(undefined)

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource<Feature<Geometry>>>
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource({
        format: new GeoJSON({
          dataProjection: WSG84_PROJECTION,
          featureProjection: OPENLAYERS_PROJECTION
        }),
        wrapX: false
      })
    }

    return vectorSourceRef.current
  }, [])

  const layerRef = useRef<VectorLayerWithName>()
  const getLayer = useCallback(() => {
    if (layerRef.current === undefined) {
      layerRef.current = new VectorLayer({
        className: LayerProperties.MEASUREMENT.code,
        renderBuffer: 7,
        source: getVectorSource(),
        style: [measurementStyle, measurementStyleWithCenter],
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MEASUREMENT.zIndex
      })
    }

    return layerRef.current as VectorLayerWithName
  }, [getVectorSource])

  useEffect(() => {
    getLayer().name = LayerProperties.MEASUREMENT.code
    monitorfishMap.getLayers().push(getLayer())

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [getLayer])

  useEffect(() => {
    function drawExistingFeaturesOnMap() {
      measurementsDrawed.forEach(measurement => {
        const feature = new GeoJSON({
          featureProjection: OPENLAYERS_PROJECTION
        }).readFeature(measurement.geometry)
        feature.setId(measurement.id)

        getVectorSource().addFeature(feature)
      })
    }

    getVectorSource().clear(true)
    drawExistingFeaturesOnMap()
  }, [getVectorSource, measurementsDrawed])

  useEffect(() => {
    if (!measurementTypeToAdd) {
      return
    }

    function addEmptyNextMeasurement() {
      setMeasurementInProgress({
        coordinates: [],
        measurement: ''
      })
    }

    function drawNewFeatureOnMap() {
      const draw = new Draw({
        source: getVectorSource(),
        style: [measurementStyle, measurementStyleWithCenter],
        type: measurementTypeToAdd as Type
      })

      monitorfishMap.addInteraction(draw)
      setDrawObject(draw)
    }

    addEmptyNextMeasurement()
    drawNewFeatureOnMap()
  }, [getVectorSource, measurementTypeToAdd])

  useEffect(() => {
    function removeInteraction() {
      if (!measurementTypeToAdd && drawObject) {
        setDrawObject(undefined)
        setMeasurementInProgress(undefined)

        waitForUnwantedZoomAndQuitInteraction()
      }
    }

    function waitForUnwantedZoomAndQuitInteraction() {
      setTimeout(() => {
        if (drawObject) {
          monitorfishMap.removeInteraction(drawObject)
        }
      }, 300)
    }

    removeInteraction()
  }, [measurementTypeToAdd, drawObject])

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

      const radiusInMeters =
        METERS_PER_UNIT.m * ((circleMeasurementToAdd?.circleRadiusToAdd ?? 0) as number) * metersForOneNauticalMile
      let coordinates: Coordinate = []
      if (circleMeasurementHasCoordinatesAndRadiusFromForm()) {
        coordinates = [
          circleMeasurementToAdd!.circleCoordinatesToAdd![longitude]!,
          circleMeasurementToAdd!.circleCoordinatesToAdd![latitude]!
        ]
      } else if (circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw()) {
        coordinates = transform(measurementInProgress!.center!, OPENLAYERS_PROJECTION, WSG84_PROJECTION)
      }

      const circleFeature = new Feature({
        geometry: circular(coordinates, radiusInMeters, numberOfVertices).transform(
          WSG84_PROJECTION,
          OPENLAYERS_PROJECTION
        ),
        style: [measurementStyle, measurementStyleWithCenter]
      })
      dispatch(saveMeasurement(circleFeature, `r = ${circleMeasurementToAdd?.circleRadiusToAdd} nm`))
    }

    addCustomCircleMeasurement()
  }, [dispatch, circleMeasurementToAdd, measurementInProgress])

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
          setMeasurementInProgress(undefined)
        })

        drawObject.on(DRAW_END_EVENT, event => {
          if (measurementInProgressRef.current?.measurement) {
            dispatch(saveMeasurement(event.feature, measurementInProgressRef.current.measurement))
          }

          unByKey(listener)
          dispatch(resetMeasurementTypeToAdd())
          setMeasurementInProgress(undefined)
        })
      }
    }

    handleDrawEvents()
    // TODO startDrawing is re-created at each render, memoize it and add it to deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, drawObject])

  useEffect(() => {
    if (measurementInProgress?.center || measurementInProgress?.measurement) {
      dispatch(
        setCircleMeasurementInDrawing({
          coordinates: measurementInProgress.center,
          measurement: measurementInProgress.measurement
        })
      )
    }
  }, [dispatch, measurementInProgress])

  const deleteFeature = featureId => {
    const feature = getVectorSource().getFeatureById(featureId)
    if (feature) {
      getVectorSource().removeFeature(feature)
      getVectorSource().changed()
      dispatch(removeMeasurementDrawed(featureId))
    }
  }

  function startDrawing(event) {
    setMeasurementInProgress({
      center: getCenter(event.feature.getGeometry().getExtent()),
      coordinates: event.feature.getGeometry().getLastCoordinate(),
      measurement: ''
    })

    return event.feature.getGeometry().on('change', changeEvent => {
      function updateMeasurementOnNewPoint(geom) {
        if (geom instanceof LineString) {
          const nextMeasurementOutput = getNauticalMilesOfLine(geom)

          setMeasurementInProgress({
            coordinates: geom.getLastCoordinate(),
            measurement: nextMeasurementOutput
          })
        } else if (geom instanceof Circle) {
          const nextMeasurementOutput = getNauticalMilesRadiusOfCircle(geom)

          setMeasurementInProgress({
            center: getCenter(geom.getExtent()),
            coordinates: geom.getLastCoordinate(),
            measurement: nextMeasurementOutput
          })
        }
      }

      updateMeasurementOnNewPoint(changeEvent.target)
    })
  }

  return (
    <>
      {measurementsDrawed.map(measurement => (
        <MeasurementOverlay
          key={measurement.id}
          coordinates={measurement.coordinates}
          deleteFeature={deleteFeature}
          id={measurement.id}
          measurement={measurement.measurement}
        />
      ))}

      <div>
        {!!measurementInProgress && (
          <MeasurementOverlay
            coordinates={measurementInProgress?.coordinates}
            deleteFeature={undefined}
            id={undefined}
            measurement={measurementInProgress?.measurement}
          />
        )}
      </div>
    </>
  )
}

export const MeasurementLayer = React.memo(UnmemoizedMeasurementLayer)
