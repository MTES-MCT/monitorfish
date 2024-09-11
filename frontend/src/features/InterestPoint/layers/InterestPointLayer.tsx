import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import { omit } from 'lodash'
import GeoJSON from 'ol/format/GeoJSON'
import LineString from 'ol/geom/LineString'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { getLength } from 'ol/sphere'
import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { getInterestPointStyle, POIStyle } from './interestPoint.style'
import { InterestPointLine } from './InterestPointLine'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { MapBox, OPENLAYERS_PROJECTION } from '../../../domain/entities/map/constants'
import { setRightMapBoxOpened } from '../../../domain/shared_slices/Global'
import saveInterestPointFeature from '../../../domain/use_cases/interestPoint/saveInterestPointFeature'
import { monitorfishMap } from '../../map/monitorfishMap'
import { InterestPointOverlay } from '../components/InterestPointOverlay'
import {
  deleteInterestPointBeingDrawed,
  editInterestPoint,
  endInterestPointDraw,
  removeInterestPoint,
  resetInterestPointFeatureDeletion,
  updateInterestPointBeingDrawed,
  updateInterestPointKeyBeingDrawed
} from '../slice'
import { coordinatesAreModified, coordinatesOrTypeAreModified, InterestPointType } from '../utils'

import type { DummyObjectToForceEffectHookUpdate } from '@features/map/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

const DRAW_START_EVENT = 'drawstart'
const DRAW_ABORT_EVENT = 'drawabort'
const DRAW_END_EVENT = 'drawend'

export const MIN_ZOOM = 7

type InterstPointLayerProps = Readonly<{
  mapMovingAndZoomEvent: DummyObjectToForceEffectHookUpdate
}>
export function InterestPointLayer({ mapMovingAndZoomEvent }: InterstPointLayerProps) {
  const layerRef = useRef<VectorLayer<Feature<Geometry>> | null>(null)
  const previousMapZoom = useRef('')
  const vectorSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null)

  const dispatch = useMainAppDispatch()
  const {
    interestPointBeingDrawed,
    interestPoints,
    /** @type {InterestPoint | null} interestPointBeingDrawed */
    isDrawing,
    /** @type {InterestPoint[]} interestPoints */
    isEditing,
    triggerInterestPointFeatureDeletion
  } = useMainAppSelector(state => state.interestPoint)

  const [drawObject, setDrawObject] = useState<Draw | null>(null)
  const [interestPointToCoordinates, setInterestPointToCoordinates] = useState(new Map())
  const previousInterestPointBeingDrawed = usePrevious(interestPointBeingDrawed)

  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        // TODO Fix that: `projection` propr does not exist in type `Options<Feature<Geometry>>`.
        // @ts-ignore
        projection: OPENLAYERS_PROJECTION,
        wrapX: false
      })
    }

    return vectorSourceRef.current
  }, [])

  const getLayer = useCallback(() => {
    if (layerRef.current === null) {
      layerRef.current = new VectorLayer({
        renderBuffer: 7,
        source: getVectorSource(),
        style: (feature, resolution) => getInterestPointStyle(feature, resolution),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.INTEREST_POINT.zIndex
      })
    }

    return layerRef.current
  }, [getVectorSource])

  const addEmptyNextInterestPoint = useCallback(() => {
    dispatch(
      updateInterestPointBeingDrawed({
        coordinates: null,
        name: null,
        observations: null,
        type: InterestPointType.FISHING_VESSEL,
        uuid: uuidv4()
      })
    )
  }, [dispatch])

  const drawNewFeatureOnMap = useCallback(() => {
    const draw = new Draw({
      source: getVectorSource(),
      style: POIStyle,
      type: 'Point'
    })

    monitorfishMap.addInteraction(draw)
    setDrawObject(draw)
  }, [getVectorSource])

  const waitForUnwantedZoomAndQuitInteraction = useCallback(() => {
    setTimeout(() => {
      if (drawObject) {
        monitorfishMap.removeInteraction(drawObject)
      }
    }, 300)
  }, [drawObject])

  const startDrawing = useCallback(
    (event, type) => {
      dispatch(
        updateInterestPointBeingDrawed({
          coordinates: event.feature.getGeometry().getLastCoordinate(),
          name: null,
          observations: null,
          type,
          uuid: interestPointBeingDrawed?.uuid
        })
      )
    },
    [dispatch, interestPointBeingDrawed]
  )

  const handleDrawEvents = useCallback(() => {
    if (drawObject) {
      drawObject.once(DRAW_START_EVENT, event => {
        if (interestPointBeingDrawed) {
          startDrawing(event, interestPointBeingDrawed.type || InterestPointType.OTHER)
        }
      })

      drawObject.once(DRAW_ABORT_EVENT, () => {
        dispatch(endInterestPointDraw())
        dispatch(deleteInterestPointBeingDrawed())
        dispatch(setRightMapBoxOpened(undefined))
      })

      drawObject.once(DRAW_END_EVENT, event => {
        dispatch(saveInterestPointFeature(event.feature))
        dispatch(endInterestPointDraw())
      })
    }
  }, [dispatch, drawObject, interestPointBeingDrawed, startDrawing])

  const showOrHideInterestPointsOverlays = useCallback(() => {
    const currentZoom = monitorfishMap.getView().getZoom()?.toFixed(2)
    if (!!currentZoom && currentZoom !== previousMapZoom.current) {
      previousMapZoom.current = currentZoom
      if (Number(currentZoom) < MIN_ZOOM) {
        getVectorSource().forEachFeature(feature => {
          feature.set(InterestPointLine.isHiddenByZoomProperty, true)
        })
      } else {
        getVectorSource().forEachFeature(feature => {
          feature.set(InterestPointLine.isHiddenByZoomProperty, false)
        })
      }
    }
  }, [getVectorSource])

  const deleteInterestPoint = useCallback(
    (uuid: string) => {
      const feature = getVectorSource().getFeatureById(uuid)
      if (feature) {
        getVectorSource().removeFeature(feature)
        getVectorSource().changed()
      }

      const featureLine = getVectorSource().getFeatureById(InterestPointLine.getFeatureId(uuid))
      if (featureLine) {
        getVectorSource().removeFeature(featureLine)
        getVectorSource().changed()
      }

      dispatch(removeInterestPoint(uuid))
    },
    [dispatch, getVectorSource]
  )

  const moveInterestPointLine = useCallback(
    (uuid: string, coordinates: string[], nextCoordinates: string[], offset: number) => {
      const featureId = InterestPointLine.getFeatureId(uuid)

      if (interestPointToCoordinates.has(featureId)) {
        const existingLabelLineFeature = getVectorSource().getFeatureById(featureId)
        const interestPointFeature = getVectorSource().getFeatureById(uuid)

        if (existingLabelLineFeature) {
          if (interestPointFeature) {
            const geometry = existingLabelLineFeature.getGeometry()
            // TODO Fix that. There may be a real bug here: `Property 'getCoordinates' does not exist on type 'Geometry'.`. Legacy code.
            // @ts-ignore
            const previousCoordinates = geometry?.getCoordinates()

            existingLabelLineFeature.setGeometry(new LineString([previousCoordinates, nextCoordinates]))
          }
        }
      } else {
        const interestPointLineFeature = InterestPointLine.getFeature(coordinates, nextCoordinates, featureId)

        getVectorSource().addFeature(interestPointLineFeature)
      }

      const nextVesselToCoordinates = interestPointToCoordinates
      interestPointToCoordinates.set(featureId, { coordinates: nextCoordinates, offset })
      setInterestPointToCoordinates(nextVesselToCoordinates)
    },
    [getVectorSource, interestPointToCoordinates]
  )

  const modifyInterestPoint = useCallback(
    (uuid: string) => {
      dispatch(editInterestPoint(uuid))
      dispatch(setRightMapBoxOpened(MapBox.INTEREST_POINT))
    },
    [dispatch]
  )

  const deleteInterestPointBeingDrawedAndCloseTool = useCallback(() => {
    dispatch(endInterestPointDraw())
    dispatch(setRightMapBoxOpened(undefined))
    dispatch(deleteInterestPointBeingDrawed())
  }, [dispatch])

  const modifyFeatureWhenCoordinatesOrTypeModified = useCallback(() => {
    if (interestPointBeingDrawed?.coordinates?.length && interestPointBeingDrawed?.uuid) {
      const drawingFeatureToUpdate = getVectorSource().getFeatureById(interestPointBeingDrawed.uuid)

      if (drawingFeatureToUpdate && coordinatesOrTypeAreModified(drawingFeatureToUpdate, interestPointBeingDrawed)) {
        const interestPointWithoutFeature = omit(interestPointBeingDrawed, 'feature')
        const drawingFeatureToUpdateGeometry = drawingFeatureToUpdate.getGeometry()
        if (drawingFeatureToUpdateGeometry) {
          // TODO Fix that. There may be a real bug here: `Property 'setCoordinates' does not exist on type 'Geometry'.`. Legacy code.
          // @ts-ignore
          drawingFeatureToUpdateGeometry.setCoordinates(interestPointBeingDrawed.coordinates)
        }
        drawingFeatureToUpdate.setProperties(interestPointWithoutFeature)

        const nextFeature = new GeoJSON().writeFeatureObject(drawingFeatureToUpdate, {
          featureProjection: OPENLAYERS_PROJECTION
        })

        dispatch(
          updateInterestPointKeyBeingDrawed({
            key: 'feature',
            value: nextFeature
          })
        )
      }
    }
  }, [dispatch, getVectorSource, interestPointBeingDrawed])

  const initLineWhenInterestPointCoordinatesModified = useCallback(() => {
    if (
      interestPointBeingDrawed &&
      previousInterestPointBeingDrawed &&
      coordinatesAreModified(interestPointBeingDrawed, previousInterestPointBeingDrawed)
    ) {
      const line = new LineString([interestPointBeingDrawed.coordinates, previousInterestPointBeingDrawed.coordinates])
      const distance = getLength(line, { projection: OPENLAYERS_PROJECTION })

      if (distance > 10) {
        const featureId = InterestPointLine.getFeatureId(interestPointBeingDrawed.uuid)
        if (interestPointToCoordinates.has(featureId)) {
          interestPointToCoordinates.delete(featureId)
          const feature = getVectorSource().getFeatureById(featureId)
          if (feature) {
            feature.setGeometry(
              new LineString([interestPointBeingDrawed.coordinates, interestPointBeingDrawed.coordinates])
            )
          }
        }
      }
    }
  }, [getVectorSource, interestPointBeingDrawed, interestPointToCoordinates, previousInterestPointBeingDrawed])

  useEffect(() => {
    if (!layerRef.current) {
      monitorfishMap.getLayers().push(getLayer())
    }

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [getLayer])

  useEffect(() => {
    function drawExistingFeaturesOnMap() {
      if (interestPoints) {
        const features = interestPoints
          .map(interestPoint => {
            if (interestPoint.feature) {
              const nextFeature = new GeoJSON({
                featureProjection: OPENLAYERS_PROJECTION
              }).readFeature(interestPoint.feature)

              const interestPointWithoutFeature = omit(interestPoint, 'feature')
              nextFeature.setProperties(interestPointWithoutFeature)

              return nextFeature
            }

            return null
          })
          .filter(feature => !!feature)

        getVectorSource().addFeatures(features)
      }
    }

    drawExistingFeaturesOnMap()
  }, [getVectorSource, interestPoints])

  useEffect(() => {
    if (isDrawing) {
      addEmptyNextInterestPoint()
      drawNewFeatureOnMap()
    }
  }, [addEmptyNextInterestPoint, drawNewFeatureOnMap, isDrawing])

  useEffect(() => {
    function removeInteraction() {
      if (!isDrawing && drawObject) {
        setDrawObject(null)

        waitForUnwantedZoomAndQuitInteraction()
      }
    }

    removeInteraction()
  }, [drawObject, isDrawing, waitForUnwantedZoomAndQuitInteraction])

  useEffect(() => {
    handleDrawEvents()
  }, [handleDrawEvents])

  useEffect(() => {
    showOrHideInterestPointsOverlays()
  }, [mapMovingAndZoomEvent, showOrHideInterestPointsOverlays])

  useEffect(() => {
    if (triggerInterestPointFeatureDeletion) {
      deleteInterestPoint(triggerInterestPointFeatureDeletion)
      resetInterestPointFeatureDeletion()
    }
  }, [deleteInterestPoint, triggerInterestPointFeatureDeletion])

  useEffect(() => {
    modifyFeatureWhenCoordinatesOrTypeModified()
  }, [modifyFeatureWhenCoordinatesOrTypeModified])

  useEffect(() => {
    initLineWhenInterestPointCoordinatesModified()
  }, [initLineWhenInterestPointCoordinatesModified])

  return (
    <>
      <div>
        {!!interestPoints &&
          Array.isArray(interestPoints) &&
          interestPoints.map(interestPoint => (
            <InterestPointOverlay
              key={interestPoint.uuid}
              coordinates={interestPoint.coordinates}
              deleteInterestPoint={deleteInterestPoint}
              featureIsShowed
              modifyInterestPoint={modifyInterestPoint}
              moveLine={moveInterestPointLine}
              name={interestPoint.name}
              observations={interestPoint.observations}
              uuid={interestPoint.uuid}
              zoomHasChanged={previousMapZoom.current}
            />
          ))}
        {!!interestPointBeingDrawed && !isEditing && (
          <InterestPointOverlay
            coordinates={interestPointBeingDrawed.coordinates}
            deleteInterestPoint={deleteInterestPointBeingDrawedAndCloseTool}
            featureIsShowed={drawObject}
            modifyInterestPoint={() => {}}
            moveLine={moveInterestPointLine}
            name={interestPointBeingDrawed.name}
            observations={interestPointBeingDrawed.observations}
            uuid={interestPointBeingDrawed.uuid}
            zoomHasChanged={previousMapZoom.current}
          />
        )}
      </div>
    </>
  )
}
