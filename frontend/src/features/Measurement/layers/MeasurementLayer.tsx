import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { assertNotNullish } from '@utils/assertNotNullish'
import { noop } from 'lodash'
import { getCenter } from 'ol/extent'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import Circle from 'ol/geom/Circle'
import LineString from 'ol/geom/LineString'
import Polygon, { circular, fromCircle } from 'ol/geom/Polygon'
import Draw, { DrawEvent } from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import { unByKey } from 'ol/Observable'
import { transform } from 'ol/proj'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import VectorSource from 'ol/source/Vector'
import { getLength } from 'ol/sphere'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import saveMeasurement from '../../../domain/use_cases/measurement/saveMeasurement'
import { getNauticalMilesFromMeters } from '../../../utils'
import MeasurementOverlay from '../components/MeasurementOverlay'
import { removeMeasurementDrawed, resetMeasurementTypeToAdd, setCircleMeasurementInDrawing } from '../slice'
import { measurementStyle, measurementStyleWithCenter } from './measurement.style'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { monitorfishMap } from '../../map/monitorfishMap'

import type { Coordinates } from '@mtes-mct/monitor-ui'
import type { Coordinate } from 'ol/coordinate'

const DRAW_START_EVENT = 'drawstart'
const DRAW_ABORT_EVENT = 'drawabort'
const DRAW_END_EVENT = 'drawend'

const getNauticalMilesRadiusOfCircle = (circle: Circle): string => {
  const polygon = fromCircle(circle)

  return getNauticalMilesRadiusOfCircularPolygon(polygon)
}

const getNauticalMilesOfLine = (line: LineString): string => {
  const length = getLength(line)

  return `${getNauticalMilesFromMeters(length)} nm`
}

function getNauticalMilesRadiusOfCircularPolygon(polygon: Polygon): string {
  const length = getLength(polygon)
  const radius = length / (2 * Math.PI)

  return `r = ${getNauticalMilesFromMeters(radius)} nm`
}

type MeasurementInProgress = {
  center?: Coordinate
  coordinates: null
  feature?: null
  measurement: number | string | null
}

function UnmemoizedMeasurementLayer() {
  const vectorSourceRef = useRef(
    new VectorSource({
      // TODO Fix TS error `'projection' does not exist in type 'Options<Feature<Geometry>>'`.
      // @ts-ignore
      projection: OPENLAYERS_PROJECTION,
      wrapX: false
    })
  )
  const vectorLayerRef = useRef(
    new VectorLayer({
      className: LayerProperties.MEASUREMENT.code,
      renderBuffer: 7,
      source: vectorSourceRef.current,
      style: [measurementStyle, measurementStyleWithCenter],
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: LayerProperties.MEASUREMENT.zIndex
    })
  )

  const dispatch = useMainAppDispatch()
  const { circleMeasurementToAdd, measurementsDrawed, measurementTypeToAdd } = useMainAppSelector(
    state => state.measurement
  )

  const [measurementInProgress, setMeasurementInProgress] = useState<MeasurementInProgress | null>(null)
  const measurementInProgressRef = useRef(measurementInProgress)
  const setMeasurementInProgressWithRef = (nextMeasurementInProgress: MeasurementInProgress | null) => {
    measurementInProgressRef.current = nextMeasurementInProgress
    setMeasurementInProgress(nextMeasurementInProgress)
  }
  const [drawObject, setDrawObject] = useState<Draw | null>(null)

  const addCustomCircleMeasurement = useCallback(
    (nextCircleMeasurementToAdd: { circleCoordinatesToAdd: Coordinates; circleRadiusToAdd: number }) => {
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
        return (
          nextCircleMeasurementToAdd.circleCoordinatesToAdd?.length === 2 &&
          nextCircleMeasurementToAdd.circleRadiusToAdd
        )
      }

      function circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw() {
        return nextCircleMeasurementToAdd.circleRadiusToAdd && measurementInProgress?.center?.length === 2
      }

      assertNotNullish(nextCircleMeasurementToAdd.circleRadiusToAdd)

      const radiusInMeters = METERS_PER_UNIT.m * nextCircleMeasurementToAdd.circleRadiusToAdd * metersForOneNauticalMile
      let coordinates: Coordinate = []
      if (circleMeasurementHasCoordinatesAndRadiusFromForm()) {
        coordinates = [
          nextCircleMeasurementToAdd.circleCoordinatesToAdd[longitude],
          nextCircleMeasurementToAdd.circleCoordinatesToAdd[latitude]
        ]
      } else if (circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw()) {
        assertNotNullish(measurementInProgress?.center)

        coordinates = transform(measurementInProgress.center, OPENLAYERS_PROJECTION, WSG84_PROJECTION)
      }

      const circleFeature = new Feature({
        geometry: circular(coordinates, radiusInMeters, numberOfVertices).transform(
          WSG84_PROJECTION,
          OPENLAYERS_PROJECTION
        ),
        style: [measurementStyle, measurementStyleWithCenter]
      })
      dispatch(saveMeasurement(circleFeature, `r = ${nextCircleMeasurementToAdd.circleRadiusToAdd} nm`))
    },
    [dispatch, measurementInProgress?.center]
  )

  const deleteFeature = useCallback(
    (featureId: string) => {
      const feature = vectorSourceRef.current.getFeatureById(featureId)
      if (feature) {
        vectorSourceRef.current.removeFeature(feature)
        vectorSourceRef.current.changed()
      }

      dispatch(removeMeasurementDrawed(featureId))
    },
    [dispatch]
  )

  const startDrawing = useCallback((event: DrawEvent) => {
    // TODO Fix TS error `Property 'coordinate' does not exist on type 'DrawEvent'`.
    // @ts-ignore
    let firstTooltipCoordinates = event.coordinate
    const geometry = event.feature.getGeometry()
    assertNotNullish(geometry)

    setMeasurementInProgressWithRef({
      center: getCenter(geometry.getExtent()),
      // TODO Fix TS error `Property 'getLastCoordinate' does not exist on type 'Geometry'`.
      // @ts-ignore
      coordinates: geometry.getLastCoordinate(),
      measurement: 0
    })

    return geometry.on('change', changeEvent => {
      const geom = changeEvent.target

      if (geom instanceof LineString) {
        const nextMeasurementOutput = getNauticalMilesOfLine(geom)
        firstTooltipCoordinates = geom.getLastCoordinate()

        setMeasurementInProgressWithRef({
          coordinates: firstTooltipCoordinates,
          measurement: nextMeasurementOutput
        })
      } else if (geom instanceof Circle) {
        const nextMeasurementOutput = getNauticalMilesRadiusOfCircle(geom)
        firstTooltipCoordinates = geom.getLastCoordinate()

        setMeasurementInProgressWithRef({
          center: getCenter(geom.getExtent()),
          coordinates: firstTooltipCoordinates,
          measurement: nextMeasurementOutput
        })
      }
    })
  }, [])

  useEffect(() => {
    const vectorLayer = vectorLayerRef.current

    monitorfishMap.getLayers().push(vectorLayer)

    return () => {
      monitorfishMap.removeLayer(vectorLayer)
    }
  }, [])

  useEffect(() => {
    if (measurementsDrawed) {
      measurementsDrawed.forEach(measurement => {
        const feature = new GeoJSON({
          featureProjection: OPENLAYERS_PROJECTION
        }).readFeature(measurement.feature)

        vectorSourceRef.current.addFeature(feature)
      })
    }
  }, [measurementsDrawed])

  useEffect(() => {
    if (measurementTypeToAdd) {
      setMeasurementInProgressWithRef({
        coordinates: null,
        feature: null,
        measurement: null
      })

      const draw = new Draw({
        source: vectorSourceRef.current,
        style: [measurementStyle, measurementStyleWithCenter],
        type: measurementTypeToAdd
      })

      monitorfishMap.addInteraction(draw)
      setDrawObject(draw)
    }
  }, [measurementTypeToAdd])

  useEffect(() => {
    if (!measurementTypeToAdd && drawObject) {
      setDrawObject(null)
      setMeasurementInProgressWithRef(null)

      setTimeout(() => {
        monitorfishMap.removeInteraction(drawObject)
      }, 300)
    }
  }, [drawObject, measurementTypeToAdd])

  useEffect(() => {
    if (circleMeasurementToAdd) {
      addCustomCircleMeasurement(circleMeasurementToAdd)
    }
  }, [addCustomCircleMeasurement, circleMeasurementToAdd])

  useEffect(() => {
    if (!drawObject) {
      return
    }

    let listener

    drawObject.on(DRAW_START_EVENT, event => {
      listener = startDrawing(event)
    })

    drawObject.on(DRAW_ABORT_EVENT, () => {
      unByKey(listener)

      dispatch(resetMeasurementTypeToAdd())

      setMeasurementInProgressWithRef(null)
    })

    drawObject.on(DRAW_END_EVENT, event => {
      assertNotNullish(measurementInProgressRef.current)

      unByKey(listener)

      dispatch(saveMeasurement(event.feature, measurementInProgressRef.current.measurement))
      dispatch(resetMeasurementTypeToAdd())

      setMeasurementInProgressWithRef(null)
    })
  }, [dispatch, drawObject, startDrawing])

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

  return (
    <>
      {measurementsDrawed.map(measurement => (
        <MeasurementOverlay
          key={measurement.feature.id}
          coordinates={measurement.coordinates}
          deleteFeature={deleteFeature}
          id={measurement.feature.id}
          measurement={measurement.measurement}
        />
      ))}

      <div>
        {measurementInProgress ? (
          <MeasurementOverlay
            coordinates={measurementInProgress?.coordinates}
            deleteFeature={noop}
            id={undefined}
            measurement={measurementInProgress?.measurement}
          />
        ) : null}
      </div>
    </>
  )
}

export const MeasurementLayer = memo(UnmemoizedMeasurementLayer)
