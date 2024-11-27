import { getNauticalMilesOfLine, getNauticalMilesRadiusOfCircle } from '@features/Measurement/layers/utils'
import { addCustomCircleMeasurement } from '@features/Measurement/useCases/addCustomCircleMeasurement'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { getCenter } from 'ol/extent'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import Circle from 'ol/geom/Circle'
import LineString from 'ol/geom/LineString'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import { unByKey } from 'ol/Observable'
import VectorSource from 'ol/source/Vector'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { measurementStyle, measurementStyleWithCenter } from './measurement.style'
import { LayerProperties, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../MainMap/constants'
import { monitorfishMap } from '../../map/monitorfishMap'
import MeasurementOverlay from '../components/MeasurementOverlay'
import { removeMeasurementDrawed, resetMeasurementTypeToAdd, setCircleMeasurementInDrawing } from '../slice'
import { saveMeasurement } from '../useCases/saveMeasurement'

import type { MainMap } from '@features/MainMap/MainMap.types'
import type { MeasurementInProgress } from '@features/Measurement/types'
import type { Type } from 'ol/geom/Geometry'
import type Geometry from 'ol/geom/Geometry'
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
  const currentInteraction = useRef<Draw | undefined>(undefined)

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

  const layerRef = useRef<MainMap.VectorLayerWithName>()
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

    return layerRef.current as MainMap.VectorLayerWithName
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
      const features = measurementsDrawed.map(measurement => {
        const feature = new GeoJSON({
          featureProjection: OPENLAYERS_PROJECTION
        }).readFeature(measurement.geometry)

        feature.setId(measurement.id)

        return feature
      })
      getVectorSource().addFeatures(features)
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

    function drawNewFeatureOnMap() {
      const draw = new Draw({
        source: getVectorSource(),
        style: [measurementStyle, measurementStyleWithCenter],
        type: measurementTypeToAdd as Type
      })
      let listener

      draw.on(DRAW_START_EVENT, event => {
        listener = startDrawing(event)
      })

      draw.on(DRAW_ABORT_EVENT, () => {
        unByKey(listener)
        dispatch(resetMeasurementTypeToAdd())
        setMeasurementInProgress(undefined)
      })

      draw.on(DRAW_END_EVENT, event => {
        if (measurementInProgressRef.current?.measurement) {
          dispatch(saveMeasurement(event.feature, measurementInProgressRef.current.measurement))
        }

        unByKey(listener)
        dispatch(resetMeasurementTypeToAdd())
        setMeasurementInProgress(undefined)
      })

      monitorfishMap.addInteraction(draw)
      currentInteraction.current = draw
    }

    addEmptyNextMeasurement()
    drawNewFeatureOnMap()
  }, [dispatch, getVectorSource, measurementTypeToAdd])

  useEffect(() => {
    function removeInteraction() {
      if (!measurementTypeToAdd) {
        setMeasurementInProgress(undefined)

        waitForUnwantedZoomAndQuitInteraction()
      }
    }

    function waitForUnwantedZoomAndQuitInteraction() {
      setTimeout(() => {
        if (currentInteraction.current) {
          monitorfishMap.removeInteraction(currentInteraction.current)
          currentInteraction.current = undefined
        }
      }, 300)
    }

    removeInteraction()
  }, [measurementTypeToAdd])

  useEffect(() => {
    dispatch(addCustomCircleMeasurement(measurementInProgressRef.current))
  }, [dispatch, circleMeasurementToAdd])

  useEffect(() => {
    if (!!measurementInProgress?.center || !!measurementInProgress?.measurement) {
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
