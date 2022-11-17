import React, { Children, cloneElement, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import OpenLayerMap from 'ol/Map'
import View from 'ol/View'
import { transform } from 'ol/proj'
import ScaleLine from 'ol/control/ScaleLine'
import Zoom from 'ol/control/Zoom'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../domain/entities/map'
import { resetAnimateToRegulatoryLayer } from '../../domain/shared_slices/Map'
import MapCoordinatesBox from './controls/MapCoordinatesBox'
import MapAttributionsBox from './controls/MapAttributionsBox'
import { HIT_PIXEL_TO_TOLERANCE } from '../../constants/constants'
import { platformModifierKeyOnly } from 'ol/events/condition'

let lastEventForPointerMove, timeoutForPointerMove, timeoutForMove

/**
 * BaseMap forwards map & mapClickEvent (when hasClickEvent is true) as props to children
 */
const BaseMap = props => {
  const {
    handleMovingAndZoom,
    handlePointerMove,
    children,
    showCoordinates,
    setCurrentFeature,
    showAttributions,
    container
  } = props

  const {
    selectedBaseLayer,
    animateToRegulatoryLayer
  } = useSelector(state => state.map)

  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode
  } = useSelector(state => state.global)
  const dispatch = useDispatch()

  const [map, setMap] = useState()
  const [isAnimating, setIsAnimating] = useState(false)
  const [initRenderIsDone, setInitRenderIsDone] = useState(false)
  const [cursorCoordinates, setCursorCoordinates] = useState('')
  /** @type {MapClickEvent} mapClickEvent */
  const [mapClickEvent, setMapClickEvent] = useState(null)

  const mapElement = useRef()
  const mapRef = useRef()
  mapRef.current = map

  const handleMapClick = (event, map) => {
    if (event && map) {
      const feature = map.forEachFeatureAtPixel(event.pixel, feature => feature, { hitTolerance: HIT_PIXEL_TO_TOLERANCE })
      const isCtrl = platformModifierKeyOnly(event)
      setMapClickEvent({ feature, ctrlKeyPressed: isCtrl })
    }
  }

  const handleBasePointerMove = (event, map) => {
    if (event && map) {
      const pixel = map.getEventPixel(event.originalEvent)
      const feature = map.forEachFeatureAtPixel(pixel, feature => feature, { hitTolerance: HIT_PIXEL_TO_TOLERANCE })

      if (feature?.getId()) {
        if (setCurrentFeature) {
          setCurrentFeature(feature)
        }
        map.getTarget().style.cursor = 'pointer'
      } else if (map.getTarget().style) {
        if (setCurrentFeature) {
          setCurrentFeature(null)
        }
        map.getTarget().style.cursor = ''
      }

      if (handlePointerMove) {
        handlePointerMove(event)
      }
    }
  }

  useEffect(() => {
    initMap()
  }, [map, selectedBaseLayer])

  useEffect(() => {
    animateToLayer()
  }, [animateToRegulatoryLayer, map])

  function initMap () {
    if (!map) {
      const centeredOnFrance = [2.99049, 46.82801]
      const initialMap = new OpenLayerMap({
        keyboardEventTarget: document,
        target: mapElement.current,
        layers: [],
        renderer: (['webgl', 'canvas']),
        view: new View({
          projection: OPENLAYERS_PROJECTION,
          center: transform(centeredOnFrance, WSG84_PROJECTION, OPENLAYERS_PROJECTION),
          zoom: 6,
          minZoom: 3
        }),
        controls: [
          new ScaleLine({ units: 'nautical' }),
          new Zoom({
            className: 'zoom'
          })
        ]
      })

      initialMap.on('click', event => handleMapClick(event, initialMap))
      initialMap.on('pointermove', event => throttleAndHandlePointerMove(event, initialMap))
      initialMap.on('movestart', () => throttleAndHandleMovingAndZoom(initialMap))
      initialMap.on('moveend', () => throttleAndHandleMovingAndZoom(initialMap))

      setMap(initialMap)

      // Wait 15 seconds to not apply any animate() before this init phase only in the homepage
      if (container === 'map') {
        setTimeout(() => {
          setInitRenderIsDone(true)
        }, 15000)
      } else {
        setInitRenderIsDone(true)
      }
    }
  }

  function throttleAndHandleMovingAndZoom (initialMap) {
    if (timeoutForMove) {
      return
    }

    timeoutForMove = setTimeout(() => {
      timeoutForMove = null
      if (handleMovingAndZoom) {
        handleMovingAndZoom(initialMap)
      }
    }, 100)
  }

  function throttleAndHandlePointerMove (event, map) {
    if (event.dragging || timeoutForPointerMove) {
      if (timeoutForPointerMove) {
        lastEventForPointerMove = event
      }
      return
    }

    timeoutForPointerMove = setTimeout(() => {
      timeoutForPointerMove = null
      handleBasePointerMove(lastEventForPointerMove, map)

      if (showCoordinates) {
        saveCoordinates(lastEventForPointerMove)
      }
    }, 50)
  }

  function animateToLayer () {
    if (map && animateToRegulatoryLayer && !isAnimating && initRenderIsDone) {
      if (animateToRegulatoryLayer.extent) {
        map.getView().fit(animateToRegulatoryLayer.extent, {
          duration: 1000,
          callback: () => dispatch(resetAnimateToRegulatoryLayer())
        })
        return
      }

      if (animateToRegulatoryLayer.center) {
        const animateObject = {
          center: [
            animateToRegulatoryLayer.center[0],
            animateToRegulatoryLayer.center[1]
          ],
          duration: 1000
        }
        if (map.getView().getZoom() < 8) {
          animateObject.zoom = 8
        }
        setIsAnimating(true)
        map.getView().animate(animateObject, () => {
          setIsAnimating(false)
          dispatch(resetAnimateToRegulatoryLayer())
        })
      }
    }
  }

  function saveCoordinates (event) {
    if (event) {
      const clickedCoordinates = mapRef.current.getCoordinateFromPixel(event.pixel)
      setCursorCoordinates(clickedCoordinates)
    }
  }

  return (
    <MapWrapper>
      <MapContainer
        ref={mapElement}
        healthcheckTextWarning={healthcheckTextWarning}
        previewFilteredVesselsMode={previewFilteredVesselsMode}
      />
      {showCoordinates && <MapCoordinatesBox coordinates={cursorCoordinates}/>}
      {showAttributions && <MapAttributionsBox/>}
      {map && Children.map(children, child => {
        if (!child) {
          return null
        }

        const props = { map }
        if (child.props.hasClickEvent) {
          props.mapClickEvent = mapClickEvent
        }
        return cloneElement(child, props)
      })}
    </MapWrapper>
  )
}

const MapWrapper = styled.div`
  display: flex;
  flex: 1;
`

const MapContainer = styled.div`
  height: ${props => props.healthcheckTextWarning || props.previewFilteredVesselsMode ? 'calc(100vh - 50px)' : '100vh'};
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

export default BaseMap
