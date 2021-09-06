import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { OPENLAYERS_PROJECTION } from '../domain/entities/map'
import Draw from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import { measurementStyle } from './styles/measurement.style'
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
import { getInterestPointStyle } from './styles/interestPoint.style'
import GeoJSON from 'ol/format/GeoJSON'
import LineString from 'ol/geom/LineString'
import { InterestPointLine } from '../domain/entities/interestPointLine'
import { usePrevious } from '../hooks/usePrevious'
import { getLength } from 'ol/sphere'

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
  const [vectorSource] = useState(new VectorSource({ wrapX: false, projection: OPENLAYERS_PROJECTION }))
  const [vectorLayer] = useState(new VectorLayer({
    source: vectorSource,
    renderBuffer: 7,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: (feature, resolution) => getInterestPointStyle(feature, resolution)
  }))
  const previousMapZoom = useRef('')
  const [interestPointToCoordinates, setInterestPointToCoordinates] = useState(new Map())
  const previousInterestPointBeingDrawed = usePrevious(interestPointBeingDrawed)

  useEffect(() => {
    addLayerToMap()
  }, [map, vectorLayer])

  useEffect(() => {
    drawExistingFeaturesOnMap()
  }, [map, interestPoints])

  useEffect(() => {
    if (map && isDrawing) {
      addEmptyNextMeasurement()
      drawNewFeatureOnMap()
    }
  }, [map, isDrawing])

  useEffect(() => {
    removeInteraction()
  }, [isDrawing])

  useEffect(() => {
    handleDrawEvents()
  }, [drawObject])

  useEffect(() => {
    showOrHideInterestPointsOverlays()
  }, [mapMovingAndZoomEvent])

  useEffect(() => {
    if (triggerInterestPointFeatureDeletion) {
      deleteInterestPoint(triggerInterestPointFeatureDeletion)
      resetInterestPointFeatureDeletion()
    }
  }, [triggerInterestPointFeatureDeletion])

  useEffect(() => {
    modifyFeatureWhenCoordinatesOrTypeModified()
  }, [interestPointBeingDrawed])

  useEffect(() => {
    initLineWhenInterestPointCoordinatesModified()
  }, [interestPointBeingDrawed])

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

  function modifyFeatureWhenCoordinatesOrTypeModified () {
    if (interestPointBeingDrawed?.coordinates && interestPointBeingDrawed?.uuid) {
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

  function handleDrawEvents () {
    if (drawObject) {
      drawObject.on(DRAW_START_EVENT, event => {
        startDrawing(event)
      })

      drawObject.on(DRAW_ABORT_EVENT, () => {
        dispatch(endInterestPointDraw())
        dispatch(deleteInterestPointBeingDrawed())
      })

      drawObject.on(DRAW_END_EVENT, event => {
        dispatch(saveInterestPointFeature(event.feature))
        dispatch(endInterestPointDraw())
      })
    }
  }

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

  function modifyInterestPoint (uuid) {
    dispatch(editInterestPoint(uuid))
  }

  function removeInteraction () {
    if (!isDrawing && drawObject) {
      setDrawObject(null)

      waitForUnwantedZoomAndQuitInteraction()
    }
  }

  function waitForUnwantedZoomAndQuitInteraction () {
    setTimeout(() => {
      map.removeInteraction(drawObject)
    }, 300)
  }

  function addEmptyNextMeasurement () {
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
      style: measurementStyle
    })

    map.addInteraction(draw)
    setDrawObject(draw)
  }

  function startDrawing (event) {
    dispatch(updateInterestPointBeingDrawed({
      uuid: interestPointBeingDrawed.uuid,
      name: null,
      type: interestPointType.FISHING_VESSEL,
      coordinates: event.feature.getGeometry().getLastCoordinate(),
      observations: null
    }))
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
