import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { OPENLAYERS_PROJECTION } from '../domain/entities/map'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import { getInterestPointStyle, POIStyle } from './styles/interestPoint.style'
import { v4 as uuidv4 } from 'uuid'
import InterestPointOverlay from '../features/map/overlays/InterestPointOverlay'
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
import saveInterestPointFeature from '../domain/use_cases/saveInterestPointFeature'
import GeoJSON from 'ol/format/GeoJSON'
import LineString from 'ol/geom/LineString'
import { InterestPointLine } from '../domain/entities/interestPointLine'
import { usePrevious } from '../hooks/usePrevious'
import { getLength } from 'ol/sphere'
import Layers from '../domain/entities/layers'

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
  const [vectorSource] = useState(new VectorSource({
    wrapX: false,
    projection: OPENLAYERS_PROJECTION
  }))
  const [vectorLayer] = useState(new VectorLayer({
    source: vectorSource,
    renderBuffer: 7,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: (feature, resolution) => getInterestPointStyle(feature, resolution),
    zIndex: Layers.INTEREST_POINT.zIndex
  }))
  const previousMapZoom = useRef('')
  const [interestPointToCoordinates, setInterestPointToCoordinates] = useState(new Map())
  const previousInterestPointBeingDrawed = usePrevious(interestPointBeingDrawed)

  useEffect(() => {
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

    addLayerToMap()
  }, [map, vectorLayer])

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

        vectorSource.addFeatures(features)
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
          type: null,
          coordinates: null,
          observations: null
        }))
      }

      function drawNewFeatureOnMap () {
        const draw = new Draw({
          source: vectorSource,
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

          startDrawing(event, interestPointBeingDrawed.type || interestPointType.FISHING_VESSEL)
        })

        drawObject.once(DRAW_ABORT_EVENT, () => {
          dispatch(endInterestPointDraw())
          dispatch(deleteInterestPointBeingDrawed())
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
          vectorSource.forEachFeature(feature => {
            feature.set(InterestPointLine.isHiddenByZoomProperty, true)
          })
        } else {
          vectorSource.forEachFeature(feature => {
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
        const drawingFeatureToUpdate = vectorSource.getFeatureById(interestPointBeingDrawed.uuid)

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
  }, [interestPointBeingDrawed])

  useEffect(() => {
    function initLineWhenInterestPointCoordinatesModified () {
      if (interestPointBeingDrawed && previousInterestPointBeingDrawed && coordinatesAreModified(interestPointBeingDrawed, previousInterestPointBeingDrawed)) {
        const line = new LineString([interestPointBeingDrawed.coordinates, previousInterestPointBeingDrawed.coordinates])
        const distance = getLength(line, { projection: OPENLAYERS_PROJECTION })

        if (distance > 10) {
          const featureId = InterestPointLine.getFeatureId(interestPointBeingDrawed.uuid)
          if (interestPointToCoordinates.has(featureId)) {
            interestPointToCoordinates.delete(featureId)
            const feature = vectorSource.getFeatureById(featureId)
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
    const feature = vectorSource.getFeatureById(uuid)
    if (feature) {
      vectorSource.removeFeature(feature)
      vectorSource.changed()
    }

    const featureLine = vectorSource.getFeatureById(InterestPointLine.getFeatureId(uuid))
    if (featureLine) {
      vectorSource.removeFeature(featureLine)
      vectorSource.changed()
    }

    dispatch(removeInterestPoint(uuid))
  }

  function moveInterestPointLine (uuid, coordinates, nextCoordinates, offset) {
    const featureId = InterestPointLine.getFeatureId(uuid)

    if (interestPointToCoordinates.has(featureId)) {
      const existingLabelLineFeature = vectorSource.getFeatureById(featureId)
      const interestPointFeature = vectorSource.getFeatureById(uuid)

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

      vectorSource.addFeature(interestPointLineFeature)
    }

    const nextVesselToCoordinates = interestPointToCoordinates
    interestPointToCoordinates.set(featureId, { coordinates: nextCoordinates, offset })
    setInterestPointToCoordinates(nextVesselToCoordinates)
  }

  function modifyInterestPoint (uuid) {
    dispatch(editInterestPoint(uuid))
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
              deleteInterestPoint={() => dispatch(endInterestPointDraw()) && dispatch(deleteInterestPointBeingDrawed())}
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
