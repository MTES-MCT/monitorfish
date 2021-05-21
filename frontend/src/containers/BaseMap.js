import React, { Children, cloneElement, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import OpenLayerMap from 'ol/Map'
import View from 'ol/View'
import { transform } from 'ol/proj'
import ScaleLine from 'ol/control/ScaleLine'
import Zoom from 'ol/control/Zoom'

import { getCoordinates } from '../utils'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import { resetAnimateToRegulatoryLayer } from '../domain/reducers/Map'
import MapCoordinatesBox from '../components/map/MapCoordinatesBox'
import MapAttributionsBox from '../components/map/MapAttributionsBox'
import BaseLayer from '../layers/BaseLayer'
import RegulatoryLayers from '../layers/RegulatoryLayers'
import AdministrativeLayers from '../layers/AdministrativeLayers'

let lastEventForPointerMove, timeoutForPointerMove, timeoutForMove

const BaseMap = props => {
  const { handleMovingAndZoom, handlePointerMove, handleMapClick, children } = props
  const mapState = useSelector(state => state.map)
  const dispatch = useDispatch()

  const [map, setMap] = useState()
  const [isAnimating, setIsAnimating] = useState(false)
  const [initRenderIsDone, setInitRenderIsDone] = useState(false)
  const [cursorCoordinates, setCursorCoordinates] = useState('')

  const mapElement = useRef()
  const mapRef = useRef()
  mapRef.current = map

  useEffect(() => {
    initMap()
  }, [mapState.selectedBaseLayer])

  useEffect(() => {
    animateToRegulatoryLayer()
  }, [mapState.animateToRegulatoryLayer, map])

  function initMap () {
    if (!map) {
      const centeredOnFrance = [2.99049, 46.82801]
      const initialMap = new OpenLayerMap({
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

      initialMap.on('click', event => handleMapClick(event, map))
      initialMap.on('pointermove', event => throttleAndHandlePointerMove(event, map))
      initialMap.on('moveend', () => throttleAndHandleMovingAndZoom(map))

      setMap(initialMap)

      // Wait 15 seconds to not apply any animate() before this init phase
      setTimeout(() => {
        setInitRenderIsDone(true)
      }, 15000)
    }
  }

  function throttleAndHandleMovingAndZoom () {
    if (timeoutForMove) {
      return
    }

    timeoutForMove = setTimeout(() => {
      timeoutForMove = null
      if (handleMovingAndZoom) {
        handleMovingAndZoom(map)
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
      if (handlePointerMove) {
        handlePointerMove(lastEventForPointerMove, map)
        showCoordinatesInDMS(lastEventForPointerMove)
      }
    }, 100)
  }

  function animateToRegulatoryLayer () {
    if (map && mapState.animateToRegulatoryLayer && mapState.animateToRegulatoryLayer.center && !isAnimating && initRenderIsDone) {
      const animateObject = {
        center: [
          mapState.animateToRegulatoryLayer.center[0],
          mapState.animateToRegulatoryLayer.center[1]
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

  function showCoordinatesInDMS (event) {
    if (event) {
      const clickedCoordinates = mapRef.current.getCoordinateFromPixel(event.pixel)
      const coordinates = getCoordinates(clickedCoordinates, OPENLAYERS_PROJECTION)
      setCursorCoordinates(`${coordinates[0]} ${coordinates[1]}`)
    }
  }

  return (
        <div>
            <MapContainer ref={mapElement} />
            <BaseLayer map={map} />
            <RegulatoryLayers map={map} />
            <AdministrativeLayers map={map} />
            <MapCoordinatesBox coordinates={cursorCoordinates}/>
            <MapAttributionsBox />
            {map && Children.map(children, (child) => (
              child && cloneElement(child, { map })
            ))}
        </div>
  )
}

const MapContainer = styled.div`
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

export default BaseMap
