import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { OPENLAYERS_PROJECTION } from '../domain/entities/map'
import Draw from 'ol/interaction/Draw'
import { unByKey } from 'ol/Observable'
import VectorLayer from 'ol/layer/Vector'
import { measurementStyle } from './styles/measurement.style'
import Point from 'ol/geom/Point'
import { v4 as uuidv4 } from 'uuid'
import InterestPointOverlay from '../components/overlays/InterestPointOverlay'
import { endInterestPointDraw, updateInterestPointBeingDrawed } from '../domain/reducers/InterestPoint'

const DRAW_START_EVENT = 'drawstart'
const DRAW_ABORT_EVENT = 'drawabort'
const DRAW_END_EVENT = 'drawend'

const InterestPointLayer = ({ map }) => {
  const dispatch = useDispatch()

  const {
    isDrawing,
    /** @type {InterestPoint | null} interestPointBeingDrawed */
    interestPointBeingDrawed
  } = useSelector(state => state.interestPoint)

  const [drawObject, setDrawObject] = useState(null)
  const [vectorSource] = useState(new VectorSource({ wrapX: false, projection: OPENLAYERS_PROJECTION }))
  const [vectorLayer] = useState(new VectorLayer({
    source: vectorSource,
    renderBuffer: 7,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: measurementStyle
  }))

  useEffect(() => {
    console.log('interestPointBeingDrawed', interestPointBeingDrawed)
  }, [interestPointBeingDrawed])

  useEffect(() => {
    addLayerToMap()
  }, [map, vectorLayer])

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

  function addLayerToMap () {
    if (map && vectorLayer) {
      map.getLayers().push(vectorLayer)
    }
  }

  function handleDrawEvents () {
    if (drawObject) {
      let listener

      drawObject.on(DRAW_START_EVENT, event => {
        listener = startDrawing(event)
      })

      drawObject.on(DRAW_ABORT_EVENT, () => {
        unByKey(listener)
        dispatch(endInterestPointDraw())
        dispatch(updateInterestPointBeingDrawed(null))
      })

      drawObject.on(DRAW_END_EVENT, () => {
        unByKey(listener)
        dispatch(endInterestPointDraw())
      })
    }
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

    console.log(draw)
    map.addInteraction(draw)
    setDrawObject(draw)
  }

  function startDrawing (event) {
    const firstTooltipCoordinates = event.coordinate

    dispatch(updateInterestPointBeingDrawed({
      uuid: interestPointBeingDrawed.uuid,
      name: null,
      type: null,
      coordinates: event.feature.getGeometry().getLastCoordinate(),
      observations: null
    }))

    return event.feature.getGeometry().on('change', changeEvent => {
      updateInterestPointOnNewPoint(changeEvent, firstTooltipCoordinates)
    })
  }

  function updateInterestPointOnNewPoint (event, tooltipCoordinates) {
    const geom = event.target

    if (geom instanceof Point) {
      tooltipCoordinates = geom.getCoordinates()

      const nextInterestPoint = interestPointBeingDrawed
      nextInterestPoint.coordinates = tooltipCoordinates
      dispatch(updateInterestPointBeingDrawed(nextInterestPoint))
    }
  }

  return (
    <>
      <div>
        {
          interestPointBeingDrawed
            ? <InterestPointOverlay
              map={map}
              name={interestPointBeingDrawed.name}
              observations={interestPointBeingDrawed.name}
              coordinates={interestPointBeingDrawed.coordinates}
            />
            : null
        }
      </div>
    </>
  )
}

export default InterestPointLayer
