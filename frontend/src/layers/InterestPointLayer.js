import { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { MapToolType, OPENLAYERS_PROJECTION } from '../domain/entities/map/constants'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import { getInterestPointStyle, POIStyle } from './styles/interestPoint.style'
import { v4 as uuidv4 } from 'uuid'
import { InterestPointOverlay } from '../features/map/overlays/InterestPointOverlay'
import {
  deleteInterestPointBeingDrawed,
  editInterestPoint,
  endInterestPointDraw,
  removeInterestPoint,
  resetInterestPointFeatureDeletion,
  updateInterestPointBeingDrawed,
  updateInterestPointKeyBeingDrawed
} from '../domain/shared_slices/InterestPoint'
import {
  coordinatesAreModified,
  coordinatesOrTypeAreModified,
  interestPointType
} from '../domain/entities/interestPoints'
import saveInterestPointFeature from '../domain/use_cases/interestPoint/saveInterestPointFeature'
import GeoJSON from 'ol/format/GeoJSON'
import LineString from 'ol/geom/LineString'
import { InterestPointLine } from '../domain/entities/interestPointLine'
import { usePrevious } from '../hooks/usePrevious'
import { getLength } from 'ol/sphere'
import { Layer } from '../domain/entities/layers/constants'
import { setMapToolOpened } from '../domain/shared_slices/Global'

const DRAW_START_EVENT = 'drawstart'
const DRAW_ABORT_EVENT = 'drawabort'
const DRAW_END_EVENT = 'drawend'

export const MIN_ZOOM = 7

const InterestPointLayer = ({ map, mapMovingAndZoomEvent }) => {
  const dispatch = useDispatch()

  const {
    isDrawing,
    isEditing,
    /** @type {InterestPoint | null} interestPointBeingDrawed */
    interestPointBeingDrawed,
    /** @type {InterestPoint[]} interestPoints */
    interestPoints,
    triggerInterestPointFeatureDeletion
  } = useSelector(state => state.interestPoint)

  const [drawObject, setDrawObject] = useState(null)

  const vectorSourceRef = useRef(null)
  function getVectorSource () {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        wrapX: false,
        projection: OPENLAYERS_PROJECTION
      })
    }
    return vectorSourceRef.current
  }

  const layerRef = useRef(null)
  function getLayer () {
    if (layerRef.current === null) {
      layerRef.current = new VectorLayer({
        source: getVectorSource(),
        renderBuffer: 7,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: (feature, resolution) => getInterestPointStyle(feature, resolution),
        zIndex: Layer.INTEREST_POINT.zIndex
      })
    }
    return layerRef.current
  }

  const previousMapZoom = useRef('')
  const [interestPointToCoordinates, setInterestPointToCoordinates] = useState(new Map())
  const previousInterestPointBeingDrawed = usePrevious(interestPointBeingDrawed)

  useEffect(() => {
    function addLayerToMap () {
      if (map) {
        map.getLayers().push(getLayer())
      }

      return () => {
        if (map) {
          map.removeLayer(getLayer())
        }
      }
    }

    addLayerToMap()
  }, [map])

  useEffect(() => {
    function drawExistingFeaturesOnMap () {
      if (interestPoints && map) {
        const features = interestPoints.map(interestPoint => {
          if (interestPoint.feature) {
            const nextFeature = new GeoJSON({
              featureProjection: OPENLAYERS_PROJECTION
            }).readFeature(interestPoint.feature)

            const { feature, ...interestPointWithoutFeature } = interestPoint
            nextFeature.setProperties(interestPointWithoutFeature)

            return nextFeature
          }

          return null
        }).filter(feature => feature)

        getVectorSource().addFeatures(features)
      }
    }

    drawExistingFeaturesOnMap()
  }, [map, interestPoints])

  useEffect(() => {
    if (map && isDrawing) {
      function addEmptyNextInterestPoint () {
        dispatch(updateInterestPointBeingDrawed({
          uuid: uuidv4(),
          name: null,
          type: interestPointType.FISHING_VESSEL,
          coordinates: null,
          observations: null
        }))
      }

      function drawNewFeatureOnMap () {
        const draw = new Draw({
          source: getVectorSource(),
          type: 'Point',
          style: POIStyle
        })

        map.addInteraction(draw)
        setDrawObject(draw)
      }

      addEmptyNextInterestPoint()
      drawNewFeatureOnMap()
    }
  }, [map, isDrawing])

  useEffect(() => {
    function removeInteraction () {
      if (!isDrawing && drawObject) {
        setDrawObject(null)

        function waitForUnwantedZoomAndQuitInteraction () {
          setTimeout(() => {
            map.removeInteraction(drawObject)
          }, 300)
        }

        waitForUnwantedZoomAndQuitInteraction()
      }
    }

    removeInteraction()
  }, [isDrawing])

  useEffect(() => {
    function handleDrawEvents () {
      if (drawObject) {
        drawObject.once(DRAW_START_EVENT, event => {
          function startDrawing (event, type) {
            dispatch(updateInterestPointBeingDrawed({
              uuid: interestPointBeingDrawed.uuid,
              name: null,
              type: type,
              coordinates: event.feature.getGeometry().getLastCoordinate(),
              observations: null
            }))
          }

          if (interestPointBeingDrawed) {
            startDrawing(event, interestPointBeingDrawed.type || interestPointType.OTHER)
          }
        })

        drawObject.once(DRAW_ABORT_EVENT, () => {
          dispatch(endInterestPointDraw())
          dispatch(deleteInterestPointBeingDrawed())
          dispatch(setMapToolOpened(undefined))
        })

        drawObject.once(DRAW_END_EVENT, event => {
          dispatch(saveInterestPointFeature(event.feature))
          dispatch(endInterestPointDraw())
        })
      }
    }

    handleDrawEvents()
  }, [drawObject, interestPointBeingDrawed])

  useEffect(() => {
    function showOrHideInterestPointsOverlays () {
      const currentZoom = map.getView().getZoom().toFixed(2)
      if (currentZoom !== previousMapZoom.current) {
        previousMapZoom.current = currentZoom
        if (currentZoom < MIN_ZOOM) {
          getVectorSource().forEachFeature(feature => {
            feature.set(InterestPointLine.isHiddenByZoomProperty, true)
          })
        } else {
          getVectorSource().forEachFeature(feature => {
            feature.set(InterestPointLine.isHiddenByZoomProperty, false)
          })
        }
      }
    }

    showOrHideInterestPointsOverlays()
  }, [mapMovingAndZoomEvent])

  useEffect(() => {
    if (triggerInterestPointFeatureDeletion) {
      deleteInterestPoint(triggerInterestPointFeatureDeletion)
      resetInterestPointFeatureDeletion()
    }
  }, [triggerInterestPointFeatureDeletion])

  useEffect(() => {
    function modifyFeatureWhenCoordinatesOrTypeModified () {
      if (interestPointBeingDrawed?.coordinates?.length && interestPointBeingDrawed?.uuid) {
        const drawingFeatureToUpdate = getVectorSource().getFeatureById(interestPointBeingDrawed.uuid)

        if (drawingFeatureToUpdate && coordinatesOrTypeAreModified(drawingFeatureToUpdate, interestPointBeingDrawed)) {
          const { feature, ...interestPointWithoutFeature } = interestPointBeingDrawed
          drawingFeatureToUpdate.getGeometry().setCoordinates(interestPointWithoutFeature.coordinates)
          drawingFeatureToUpdate.setProperties(interestPointWithoutFeature)

          const nextFeature = new GeoJSON()
            .writeFeatureObject(drawingFeatureToUpdate, { featureProjection: OPENLAYERS_PROJECTION })

          dispatch(updateInterestPointKeyBeingDrawed({
            key: 'feature',
            value: nextFeature
          }))
        }
      }
    }

    modifyFeatureWhenCoordinatesOrTypeModified()
  }, [interestPointBeingDrawed?.coordinates, interestPointBeingDrawed?.type])

  useEffect(() => {
    function initLineWhenInterestPointCoordinatesModified () {
      if (interestPointBeingDrawed && previousInterestPointBeingDrawed && coordinatesAreModified(interestPointBeingDrawed, previousInterestPointBeingDrawed)) {
        const line = new LineString([interestPointBeingDrawed.coordinates, previousInterestPointBeingDrawed.coordinates])
        const distance = getLength(line, { projection: OPENLAYERS_PROJECTION })

        if (distance > 10) {
          const featureId = InterestPointLine.getFeatureId(interestPointBeingDrawed.uuid)
          if (interestPointToCoordinates.has(featureId)) {
            interestPointToCoordinates.delete(featureId)
            const feature = getVectorSource().getFeatureById(featureId)
            if (feature) {
              feature.setGeometry(new LineString([interestPointBeingDrawed.coordinates, interestPointBeingDrawed.coordinates]))
            }
          }
        }
      }
    }

    initLineWhenInterestPointCoordinatesModified()
  }, [interestPointBeingDrawed])

  function deleteInterestPoint (uuid) {
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
  }

  function moveInterestPointLine (uuid, coordinates, nextCoordinates, offset) {
    const featureId = InterestPointLine.getFeatureId(uuid)

    if (interestPointToCoordinates.has(featureId)) {
      const existingLabelLineFeature = getVectorSource().getFeatureById(featureId)
      const interestPointFeature = getVectorSource().getFeatureById(uuid)

      if (existingLabelLineFeature) {
        if (interestPointFeature) {
          existingLabelLineFeature.setGeometry(new LineString([interestPointFeature.getGeometry().getCoordinates(), nextCoordinates]))
        }
      }
    } else {
      const interestPointLineFeature = InterestPointLine.getFeature(
        coordinates,
        nextCoordinates,
        featureId)

      getVectorSource().addFeature(interestPointLineFeature)
    }

    const nextVesselToCoordinates = interestPointToCoordinates
    interestPointToCoordinates.set(featureId, { coordinates: nextCoordinates, offset })
    setInterestPointToCoordinates(nextVesselToCoordinates)
  }

  function modifyInterestPoint (uuid) {
    dispatch(editInterestPoint(uuid))
    dispatch(setMapToolOpened(MapToolType.INTEREST_POINT))
  }

  function deleteInterestPointBeingDrawedAndCloseTool () {
    dispatch(endInterestPointDraw())
    dispatch(setMapToolOpened(undefined))
    dispatch(deleteInterestPointBeingDrawed())
  }

  return (
    <>
      <div>
        {
          interestPoints && Array.isArray(interestPoints)
            ? interestPoints.map(interestPoint => {
              return <InterestPointOverlay
                map={map}
                key={interestPoint.uuid}
                uuid={interestPoint.uuid}
                name={interestPoint.name}
                featureIsShowed={true}
                observations={interestPoint.observations}
                coordinates={interestPoint.coordinates}
                deleteInterestPoint={deleteInterestPoint}
                modifyInterestPoint={modifyInterestPoint}
                zoomHasChanged={previousMapZoom.current}
                moveLine={moveInterestPointLine}
              />
            })
            : null
        }
        {
          interestPointBeingDrawed && !isEditing
            ? <InterestPointOverlay
              map={map}
              uuid={interestPointBeingDrawed.uuid}
              name={interestPointBeingDrawed.name}
              observations={interestPointBeingDrawed.observations}
              coordinates={interestPointBeingDrawed.coordinates}
              featureIsShowed={drawObject}
              deleteInterestPoint={deleteInterestPointBeingDrawedAndCloseTool}
              modifyInterestPoint={() => {}}
              zoomHasChanged={previousMapZoom.current}
              moveLine={moveInterestPointLine}
            />
            : null
        }
      </div>
    </>
  )
}

export default InterestPointLayer
